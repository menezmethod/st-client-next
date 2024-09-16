import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from 'firebase-admin/auth';
import { query, pool } from '@/lib/db';
import { decrypt } from '@/lib/encryption';
import { plaidClient } from '@/lib/plaid';
import { Transaction, AccountBase, Holding, Security } from 'plaid';

interface SyncResponse {
  success: boolean;
  message: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<SyncResponse>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Ensure Plaid provider exists
    const plaidProviderId = await ensurePlaidProvider(client);

    // Extract the ID token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const idToken = authHeader.split('Bearer ')[1];

    // Verify the ID token using Firebase Admin
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const firebaseUid = decodedToken.uid;

    // Fetch the user's UUID from the database using their Firebase UID
    const { rows: userRows } = await client.query(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [firebaseUid]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const userId = userRows[0].id;

    // Retrieve encrypted access token from database
    const { rows } = await client.query(
      `SELECT access_token_encrypted FROM provider_tokens 
       WHERE user_id = $1 AND provider_id = $2`,
      [userId, plaidProviderId]
    );

    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Plaid account not connected.' });
    }

    const encryptedAccessToken = rows[0].access_token_encrypted;
    const accessToken = await decrypt(encryptedAccessToken);

    // Ensure user_provider_connections entry exists
    const { rows: connectionRows } = await client.query(
      `SELECT id, sync_cursor FROM user_provider_connections 
       WHERE user_id = $1 AND provider_id = $2`,
      [userId, plaidProviderId]
    );

    let cursor = null;
    let connectionId: null;

    if (connectionRows.length === 0) {
      // Insert a new connection entry if it doesn't exist
      const { rows: newConnectionRows } = await client.query(
        `INSERT INTO user_provider_connections (user_id, provider_id, sync_cursor, connection_status)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [userId, plaidProviderId, null, 'active']
      );
      connectionId = newConnectionRows[0].id;
    } else {
      connectionId = connectionRows[0].id;
      cursor = connectionRows[0].sync_cursor;
    }

    const { fullSync } = req.body;

    if (fullSync) {
      console.log(`[handler] Performing full sync for user: ${userId}`);
      cursor = null; // Reset cursor for full sync
      await client.query(
        `UPDATE user_provider_connections 
         SET sync_cursor = NULL
         WHERE id = $1`,
        [connectionId]
      );
    }

    console.log(`[${new Date().toISOString()}] [sync_data] Starting sync for user: ${userId}`);

    // Fetch accounts data
    const accountsResponse = await plaidClient.accountsGet({ access_token: accessToken });
    console.log(`[${new Date().toISOString()}] [sync_data] Fetched ${accountsResponse.data.accounts.length} accounts`);

    // Update accounts
    await updateAccounts(client, userId, accountsResponse.data.accounts);

    // Fetch investments data
    const investmentsResponse = await plaidClient.investmentsHoldingsGet({ access_token: accessToken });
    console.log(`[${new Date().toISOString()}] [sync_data] Fetched ${investmentsResponse.data.holdings.length} holdings and ${investmentsResponse.data.securities.length} securities`);

    // Update investments
    await updateInvestments(client, userId, investmentsResponse.data.holdings, investmentsResponse.data.securities);

    // Fetch and process transactions
    const {
      added,
      modified,
      removed,
      newCursor,
    } = await fetchTransactionUpdates(accessToken, cursor);

    console.log(`[${new Date().toISOString()}] [sync_data] Fetched transaction updates: Added ${added.length}, Modified ${modified.length}, Removed ${removed.length}`);

    // Ensure transaction partitions exist
    await ensureTransactionPartitions(added);

    // Update transactions
    await updateTransactions(client, userId, added, modified, removed);

    // Update sync_cursor after successful sync
    await client.query(
      `UPDATE user_provider_connections 
       SET sync_cursor = $1, last_successful_sync = NOW() 
       WHERE id = $2`,
      [newCursor, connectionId]
    );

    await client.query('COMMIT');

    console.log(`[${new Date().toISOString()}] [sync_data] Data sync completed successfully for user: ${userId}`);
    return res.status(200).json({ success: true, message: 'Data synced successfully.' });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error(`[${new Date().toISOString()}] [sync_data] Sync Error:`, error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  } finally {
    client.release();
  }
}

async function fetchTransactionUpdates(accessToken: string, lastCursor: string | null) {
  let cursor = lastCursor;
  let added: Transaction[] = [];
  let modified: Transaction[] = [];
  let removed: { transaction_id: string }[] = [];
  let hasMore = true;
  const batchSize = 100;
  let retries = 0;

  while (hasMore) {
    try {
      const transactionsResponse = await plaidClient.transactionsSync({
        access_token: accessToken,
        cursor: cursor || undefined,
        count: batchSize,
      });
      const data = transactionsResponse.data;

      // Accumulate transactions
      added = added.concat(data.added);
      modified = modified.concat(data.modified);
      removed = removed.concat(data.removed);

      // Update cursor
      cursor = data.next_cursor;

      // Check if more transactions are available
      hasMore = data.has_more;
    } catch (error: any) {
      if (
        error.response?.data?.error_code === 'INVALID_FIELD' &&
        error.response?.data?.error_message === 'cursor not associated with access_token'
      ) {
        console.log('Invalid cursor detected. Resetting cursor and retrying sync.');
        cursor = null;
        retries += 1;
        if (retries > 1) {
          throw new Error('Failed to sync transactions after resetting cursor.');
        }
      } else {
        throw error; // Re-throw other errors
      }
    }
  }

  return { added, modified, removed, newCursor: cursor };
}

async function updateAccounts(client: any, userId: string, accounts: AccountBase[]) {
  console.log(`[${new Date().toISOString()}] [updateAccounts] Updating ${accounts.length} accounts for user: ${userId}`);

  // First, get all existing accounts for this user
  const existingAccounts = await client.query(
    'SELECT * FROM accounts WHERE user_id = $1',
    [userId]
  );

  const existingAccountMap = new Map<string, any>(
    existingAccounts.rows.map((acc: any) => [acc.account_source_id, acc])
  );

  // Keep track of updated account_source_ids
  const updatedAccountSourceIds = new Set<string>();

  for (const account of accounts) {
    let existingAccount = existingAccountMap.get(account.account_id);

    if (!existingAccount) {
      // If no exact match, try to find a matching account based on name, type, and subtype
      existingAccount = Array.from(existingAccountMap.values()).find(
        (acc: any) => acc.name === account.name && acc.type === account.type && acc.subtype === account.subtype
      );
    }

    if (existingAccount) {
      // Update existing account
      await client.query(
        `UPDATE accounts SET
          account_source_id = $1,
          name = $2,
          official_name = $3,
          type = $4,
          subtype = $5,
          currency_code = $6,
          balance = $7,
          available_balance = $8,
          credit_limit = $9,
          is_active = $10,
          is_manual = $11,
          mask = $12,
          last_four = $13,
          updated_at = NOW()
        WHERE id = $14`,
        [
          account.account_id,
          account.name,
          account.official_name,
          account.type,
          account.subtype,
          account.balances.iso_currency_code,
          account.balances.current,
          account.balances.available,
          account.balances.limit,
          true, // is_active
          false, // is_manual
          account.mask,
          account.mask ? account.mask.slice(-4) : null,
          existingAccount.id
        ]
      );
      console.log(`[${new Date().toISOString()}] [updateAccounts] Account ${existingAccount.id} updated for account_source_id: ${account.account_id}`);
    } else {
      // Insert new account
      const result = await client.query(
        `INSERT INTO accounts (
          user_id, account_source_id, account_source, name, official_name, 
          type, subtype, currency_code, balance, available_balance, 
          credit_limit, is_active, is_manual, mask, last_four
        ) VALUES ($1, $2, 'Plaid', $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING id`,
        [
          userId,
          account.account_id,
          account.name,
          account.official_name,
          account.type,
          account.subtype,
          account.balances.iso_currency_code,
          account.balances.current,
          account.balances.available,
          account.balances.limit,
          true, // is_active
          false, // is_manual
          account.mask,
          account.mask ? account.mask.slice(-4) : null,
        ]
      );
      console.log(`[${new Date().toISOString()}] [updateAccounts] New account ${result.rows[0].id} inserted for account_source_id: ${account.account_id}`);
    }

    updatedAccountSourceIds.add(account.account_id);
  }

  // Deactivate accounts that are no longer present in the Plaid data
  for (const [account_source_id, account] of Array.from(existingAccountMap.entries())) {
    if (!updatedAccountSourceIds.has(account_source_id) && account.is_active) {
      await client.query('UPDATE accounts SET is_active = false, updated_at = NOW() WHERE id = $1', [account.id]);
      console.log(`[${new Date().toISOString()}] [updateAccounts] Marked account ${account.id} as inactive`);
    }
  }
}

async function updateInvestments(client: any, userId: string, holdings: Holding[], securities: Security[]) {
  console.log(`[${new Date().toISOString()}] [updateInvestments] Updating ${holdings.length} holdings for user: ${userId}`);

  // First, let's get all existing investments for this user
  const existingInvestments = await client.query(
    'SELECT * FROM investments WHERE user_id = $1',
    [userId]
  );

  const existingInvestmentMap = new Map<string, any>(
    existingInvestments.rows.map((inv: any) => [`${inv.account_id}-${inv.security_id}-${inv.holding_id}`, inv])
  );

  for (const holding of holdings) {
    const { rows } = await client.query(
      'SELECT id FROM accounts WHERE user_id = $1 AND account_source_id = $2',
      [userId, holding.account_id]
    );

    if (rows.length === 0) {
      console.error(`[${new Date().toISOString()}] [updateInvestments] No account found for account_source_id: ${holding.account_id}`);
      continue;
    }

    const accountId = rows[0].id;
    const security = securities.find((s) => s.security_id === holding.security_id);

    const investmentKey = `${accountId}-${holding.security_id}-${holding.security_id}`;
    const existingInvestment = existingInvestmentMap.get(investmentKey);

    if (existingInvestment) {
      // Update existing investment
      await client.query(
        `UPDATE investments SET
          security_name = $1,
          security_type = $2,
          ticker_symbol = $3,
          quantity = $4,
          cost_basis = $5,
          current_market_value = $6,
          updated_at = NOW()
        WHERE id = $7`,
        [
          security ? security.name : 'Unknown Security',
          security ? security.type : null,
          security ? security.ticker_symbol : null,
          holding.quantity,
          holding.cost_basis,
          holding.institution_value,
          existingInvestment.id
        ]
      );
      console.log(`[${new Date().toISOString()}] [updateInvestments] Investment ${existingInvestment.id} updated for security_id: ${holding.security_id}`);
    } else {
      // Insert new investment
      const result = await client.query(
        `INSERT INTO investments (
          user_id, holding_id, account_id, security_id, security_name, 
          security_type, ticker_symbol, quantity, cost_basis, current_market_value
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id`,
        [
          userId,
          holding.security_id,
          accountId,
          holding.security_id,
          security ? security.name : 'Unknown Security',
          security ? security.type : null,
          security ? security.ticker_symbol : null,
          holding.quantity,
          holding.cost_basis,
          holding.institution_value,
        ]
      );
      console.log(`[${new Date().toISOString()}] [updateInvestments] New investment ${result.rows[0].id} inserted for security_id: ${holding.security_id}`);
    }

    // Remove this investment from the map of existing investments
    existingInvestmentMap.delete(investmentKey);
  }

  // Any investments left in the map are no longer present in Plaid data and should be removed
  for (const [_, investment] of Array.from(existingInvestmentMap.entries())) {
    await client.query('DELETE FROM investments WHERE id = $1', [investment.id]);
    console.log(`[${new Date().toISOString()}] [updateInvestments] Removed obsolete investment ${investment.id}`);
  }
}

async function updateTransactions(
  client: any,
  userId: string,
  added: Transaction[],
  modified: Transaction[],
  removed: { transaction_id: string }[]
) {
  console.log(`[${new Date().toISOString()}] [updateTransactions] Updating transactions for user: ${userId}`);
  console.log(`Added: ${added.length}, Modified: ${modified.length}, Removed: ${removed.length}`);

  // Add new transactions and update modified transactions
  for (const transaction of [...added, ...modified]) {
    await insertOrUpdateTransaction(client, userId, transaction);
  }

  // Remove transactions
  for (const removedTransaction of removed) {
    await client.query(
      `DELETE FROM transactions WHERE user_id = $1 AND transaction_source_id = $2`,
      [userId, removedTransaction.transaction_id]
    );
    console.log(`[${new Date().toISOString()}] [updateTransactions] Removed transaction: ${removedTransaction.transaction_id}`);
  }
}

async function insertOrUpdateTransaction(client: any, userId: string, transaction: Transaction) {
  console.log(`[${new Date().toISOString()}] [insertOrUpdateTransaction] Processing transaction: ${transaction.transaction_id}`);

  const { rows } = await client.query(
    'SELECT id FROM accounts WHERE user_id = $1 AND account_source_id = $2',
    [userId, transaction.account_id]
  );

  if (rows.length === 0) {
    console.error(`[${new Date().toISOString()}] [insertOrUpdateTransaction] No account found for account_source_id: ${transaction.account_id}`);
    return;
  }

  const accountId = rows[0].id;

  const categoryArray = transaction.category
    ? `{${transaction.category.map((c) => `"${c.replace(/"/g, '\\"')}"`).join(',')}}`
    : null;

  const result = await client.query(
    `INSERT INTO transactions (
      user_id, account_id, transaction_source_id, transaction_source, amount, 
      transaction_date, authorized_date, description, category, transaction_type, pending, is_manual, metadata
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::text[], $10, $11, $12, $13)
    ON CONFLICT (user_id, account_id, transaction_source_id, transaction_date) 
    DO UPDATE SET
      amount = EXCLUDED.amount,
      authorized_date = EXCLUDED.authorized_date,
      description = EXCLUDED.description,
      category = EXCLUDED.category,
      transaction_type = EXCLUDED.transaction_type,
      pending = EXCLUDED.pending,
      is_manual = EXCLUDED.is_manual,
      metadata = EXCLUDED.metadata,
      updated_at = NOW()
    RETURNING id`,
    [
      userId,
      accountId,
      transaction.transaction_id,
      'Plaid',
      transaction.amount,
      transaction.date,
      transaction.authorized_date,
      transaction.name,
      categoryArray,
      transaction.transaction_type || null,
      transaction.pending,
      false, // is_manual
      JSON.stringify({
        merchant_name: transaction.merchant_name,
        // Add any other fields you want to store in metadata
      }),
    ]
  );

  console.log(`[${new Date().toISOString()}] [insertOrUpdateTransaction] Transaction ${result.rows[0].id} upserted for transaction_id: ${transaction.transaction_id}`);
}

async function ensurePlaidProvider(client: any) {
  const { rows } = await client.query(
    `INSERT INTO data_providers (name, description, provider_type, is_active)
     VALUES ('Plaid', 'Plaid financial data provider', 'financial', true)
     ON CONFLICT (name) DO NOTHING
     RETURNING id`
  );

  if (rows.length === 0) {
    const { rows: existingRows } = await client.query(
      `SELECT id FROM data_providers WHERE name = 'Plaid'`
    );
    return existingRows[0].id;
  }

  return rows[0].id;
}

async function ensureTransactionPartitions(addedTransactions: Transaction[]) {
  const uniqueDates = new Set<string>();

  addedTransactions.forEach((tx) => {
    const date = new Date(tx.date);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    uniqueDates.add(`${year}-${month}`);
  });

  for (const ym of Array.from(uniqueDates)) {
    const [year, month] = ym.split('-');
    const partitionName = `transactions_${year}_${month}`;

    try {
      await query(`
        CREATE TABLE IF NOT EXISTS ${partitionName} PARTITION OF transactions
        FOR VALUES FROM ('${year}-${month}-01') TO ('${year}-${String(
        Number(month) + 1
      ).padStart(2, '0')}-01')
      `);
    } catch (err: any) {
      // If the partition already exists, ignore the error
      if (err.code !== '42P07') {
        // 42P07 is the error code for "relation already exists"
        throw err;
      }
    }
  }
}