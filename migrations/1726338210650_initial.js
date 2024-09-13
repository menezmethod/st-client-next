/* eslint-disable camelcase */

exports.shorthands = undefined;

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  // Create sequence
  pgm.createSequence('transactions_id_seq', { type: 'integer' });
  pgm.alterSequence('transactions_id_seq', { owner: 'postgres' });

  // Create pgmigrations table
  pgm.createTable('pgmigrations', {
    id: 'id',
    name: { type: 'varchar(255)', notNull: true },
    run_on: { type: 'timestamp', notNull: true },
  }, {
    comment: 'Migration tracking table',
  });
  pgm.alterTable('pgmigrations', { owner: 'postgres' });

  // Create users table
  pgm.createTable('users', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    firebase_uid: { type: 'text', notNull: true, unique: true },
    email: { type: 'text', notNull: true, unique: true },
    display_name: 'text',
    photo_url: 'text',
    bio: 'text',
    is_email_verified: { type: 'boolean', default: false },
    phone_number: 'text',
    date_of_birth: 'date',
    country: 'text',
    preferred_currency: { type: 'text', default: 'USD' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    last_login: 'timestamptz',
  }, {
    comment: 'Users table storing user profile information',
  });
  pgm.alterTable('users', { owner: 'postgres' });
  pgm.createTrigger('users', 'set_updated_at', {
    when: 'BEFORE',
    operation: 'UPDATE',
    function: 'set_updated_at',
    level: 'ROW',
  });
  pgm.createPolicy('users', 'select_user', {
    command: 'SELECT',
    using: 'id = (current_setting(\'app.current_user\'))::uuid',
  });
  pgm.createPolicy('users', 'update_user', {
    command: 'UPDATE',
    using: 'id = (current_setting(\'app.current_user\'))::uuid',
  });

  // Create user_settings table
  pgm.createTable('user_settings', {
    user_id: { type: 'uuid', primaryKey: true, references: 'users', onDelete: 'CASCADE' },
    theme: { type: 'text', notNull: true, default: 'default' },
    language: { type: 'text', notNull: true, default: 'en' },
    notification_preferences: { type: 'jsonb', notNull: true, default: pgm.func('\'{}\'::jsonb') },
    customizations: { type: 'jsonb', notNull: true, default: pgm.func('\'{}\'::jsonb') },
    timezone: { type: 'text', notNull: true, default: 'UTC' },
    date_format: { type: 'text', notNull: true, default: 'YYYY-MM-DD' },
    time_format: { type: 'text', notNull: true, default: 'HH:mm:ss' },
    currency_display: { type: 'text', notNull: true, default: 'symbol' },
    number_format: { type: 'text', notNull: true, default: 'thousand_separated' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  }, {
    comment: 'Table storing user-specific settings',
  });
  pgm.alterTable('user_settings', { owner: 'postgres' });
  pgm.createTrigger('user_settings', 'set_updated_at', {
    when: 'BEFORE',
    operation: 'UPDATE',
    function: 'set_updated_at',
    level: 'ROW',
  });
  pgm.createPolicy('user_settings', 'select_user_settings', {
    command: 'SELECT',
    using: 'user_id = (current_setting(\'app.current_user\'))::uuid',
  });
  pgm.createPolicy('user_settings', 'update_user_settings', {
    command: 'UPDATE',
    using: 'user_id = (current_setting(\'app.current_user\'))::uuid',
  });

  // Create roles table
  pgm.createTable('roles', {
    id: 'id',
    name: { type: 'text', notNull: true, unique: true },
    description: 'text',
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  }, {
    comment: 'Roles available in the system',
  });
  pgm.alterTable('roles', { owner: 'postgres' });
  pgm.createPolicy('roles', 'select_roles', {
    command: 'SELECT',
    using: 'true',
  });
  pgm.createTrigger('roles', 'set_updated_at', {
    when: 'BEFORE',
    operation: 'UPDATE',
    function: 'set_updated_at',
    level: 'ROW',
  });

  // Create permissions table
  pgm.createTable('permissions', {
    id: 'id',
    action: { type: 'text', notNull: true, unique: true },
    description: 'text',
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  }, {
    comment: 'Permissions that can be assigned to roles',
  });
  pgm.alterTable('permissions', { owner: 'postgres' });
  pgm.createPolicy('permissions', 'select_permissions', {
    command: 'SELECT',
    using: 'true',
  });
  pgm.createTrigger('permissions', 'set_updated_at', {
    when: 'BEFORE',
    operation: 'UPDATE',
    function: 'set_updated_at',
    level: 'ROW',
  });

  // Create role_permissions table
  pgm.createTable('role_permissions', {
    role_id: { type: 'integer', notNull: true, references: 'roles', onDelete: 'CASCADE' },
    permission_id: { type: 'integer', notNull: true, references: 'permissions', onDelete: 'CASCADE' },
  }, {
    primaryKey: ['role_id', 'permission_id'],
    comment: 'Associates permissions with roles',
  });
  pgm.alterTable('role_permissions', { owner: 'postgres' });
  pgm.createPolicy('role_permissions', 'select_role_permissions', {
    command: 'SELECT',
    using: 'true',
  });

  // Create user_roles table
  pgm.createTable('user_roles', {
    user_id: { type: 'uuid', notNull: true, references: 'users', onDelete: 'CASCADE' },
    role_id: { type: 'integer', notNull: true, references: 'roles', onDelete: 'CASCADE' },
  }, {
    primaryKey: ['user_id', 'role_id'],
    comment: 'Associates users with roles',
  });
  pgm.alterTable('user_roles', { owner: 'postgres' });
  pgm.createPolicy('user_roles', 'select_user_roles', {
    command: 'SELECT',
    using: 'user_id = (current_setting(\'app.current_user\'))::uuid',
  });

  // Create payment_plans table
  pgm.createTable('payment_plans', {
    id: 'id',
    name: { type: 'text', notNull: true, unique: true },
    description: 'text',
    price_cents: { type: 'integer', notNull: true },
    features: { type: 'jsonb', notNull: true, default: pgm.func('\'{}\'::jsonb') },
    is_active: { type: 'boolean', notNull: true, default: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  }, {
    comment: 'Available payment plans',
  });
  pgm.alterTable('payment_plans', { owner: 'postgres' });
  pgm.createPolicy('payment_plans', 'select_payment_plans', {
    command: 'SELECT',
    using: 'true',
  });
  pgm.createTrigger('payment_plans', 'set_updated_at', {
    when: 'BEFORE',
    operation: 'UPDATE',
    function: 'set_updated_at',
    level: 'ROW',
  });

  // Create user_payment_plans table
  pgm.createTable('user_payment_plans', {
    user_id: { type: 'uuid', notNull: true, references: 'users', onDelete: 'CASCADE' },
    payment_plan_id: { type: 'integer', notNull: true, references: 'payment_plans', onDelete: 'CASCADE' },
    subscription_start: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    subscription_end: 'timestamptz',
    status: { type: 'text', notNull: true, default: 'active' },
    last_payment: 'timestamptz',
    payment_method: 'text',
    transaction_id: 'text',
    auto_renew: { type: 'boolean', default: true },
    next_billing_date: 'timestamptz',
    cancellation_date: 'timestamptz',
    cancellation_reason: 'text',
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  }, {
    primaryKey: ['user_id', 'payment_plan_id'],
    comment: 'Associates users with payment plans',
  });
  pgm.alterTable('user_payment_plans', { owner: 'postgres' });

  // Create data_providers table
  pgm.createTable('data_providers', {
    id: 'id',
    name: { type: 'text', notNull: true, unique: true },
    description: 'text',
    is_active: { type: 'boolean', notNull: true, default: true },
    provider_type: { type: 'text', notNull: true },
    api_base_url: 'text',
    api_version: 'text',
    auth_method: 'text',
    required_credentials: 'jsonb',
    supported_account_types: 'jsonb',
    logo_url: 'text',
    website: 'text',
    support_email: 'text',
    rate_limit: 'integer',
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  }, {
    comment: 'External data providers',
  });
  pgm.alterTable('data_providers', { owner: 'postgres' });
  pgm.createPolicy('data_providers', 'select_data_providers', {
    command: 'SELECT',
    using: 'true',
  });
  pgm.createTrigger('data_providers', 'set_updated_at', {
    when: 'BEFORE',
    operation: 'UPDATE',
    function: 'set_updated_at',
    level: 'ROW',
  });

  // Create user_provider_connections table
  pgm.createTable('user_provider_connections', {
    id: 'id',
    user_id: { type: 'uuid', references: 'users', onDelete: 'CASCADE' },
    provider_id: { type: 'integer', references: 'data_providers', onDelete: 'CASCADE' },
    connection_status: { type: 'text', notNull: true, default: 'active' },
    last_sync: 'timestamptz',
    settings: { type: 'jsonb', notNull: true, default: pgm.func('\'{}\'::jsonb') },
    institution_id: 'text',
    item_id: 'text',
    error_code: 'text',
    error_message: 'text',
    refresh_token: 'text',
    access_token_expiry: 'timestamptz',
    last_successful_sync: 'timestamptz',
    sync_frequency: 'interval',
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    last_connection: 'timestamptz',
  }, {
    comment: 'User connections to data providers',
  });
  pgm.alterTable('user_provider_connections', { owner: 'postgres' });
  pgm.createIndex('user_provider_connections', ['user_id', 'provider_id']);
  pgm.createPolicy('user_provider_connections', 'select_user_provider_connections', {
    command: 'SELECT',
    using: 'user_id = (current_setting(\'app.current_user\'))::uuid',
  });
  pgm.createPolicy('user_provider_connections', 'update_user_provider_connections', {
    command: 'UPDATE',
    using: 'user_id = (current_setting(\'app.current_user\'))::uuid',
  });
  pgm.createTrigger('user_provider_connections', 'set_updated_at', {
    when: 'BEFORE',
    operation: 'UPDATE',
    function: 'set_updated_at',
    level: 'ROW',
  });

  // Create provider_tokens table
  pgm.createTable('provider_tokens', {
    user_id: { type: 'uuid', notNull: true, references: 'users', onDelete: 'CASCADE' },
    provider_id: { type: 'integer', notNull: true, references: 'data_providers', onDelete: 'CASCADE' },
    access_token_encrypted: { type: 'text', notNull: true },
    refresh_token_encrypted: 'text',
    item_id: 'text',
    access_token_expires_at: 'timestamptz',
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    last_used: 'timestamptz',
  }, {
    primaryKey: ['user_id', 'provider_id'],
    comment: 'Tokens for provider authentication',
  });
  pgm.alterTable('provider_tokens', { owner: 'postgres' });

  // Create accounts table
  pgm.createTable('accounts', {
    id: 'id',
    user_id: { type: 'uuid', notNull: true, references: 'users', onDelete: 'CASCADE' },
    provider_connection_id: { type: 'integer', references: 'user_provider_connections', onDelete: 'SET NULL' },
    account_source_id: { type: 'text', notNull: true },
    account_source: { type: 'text', notNull: true },
    name: { type: 'text', notNull: true },
    official_name: 'text',
    type: 'text',
    subtype: 'text',
    currency_code: { type: 'text', default: 'USD' },
    balance: { type: 'numeric(15,2)', notNull: true, default: 0 },
    available_balance: 'numeric(15,2)',
    credit_limit: 'numeric(15,2)',
    is_active: { type: 'boolean', notNull: true, default: true },
    is_manual: { type: 'boolean', notNull: true, default: false },
    institution_name: 'text',
    mask: 'text',
    last_four: 'text',
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    last_sync: 'timestamptz',
  }, {
    comment: 'User financial accounts',
    constraints: {
      unique: ['account_source_id', 'account_source'],
    },
  });
  pgm.alterTable('accounts', { owner: 'postgres' });
  pgm.createIndex('accounts', ['user_id', 'account_source_id']);
  pgm.createIndex('accounts', 'user_id');
  pgm.createPolicy('accounts', 'select_accounts', {
    command: 'SELECT',
    using: 'user_id = (current_setting(\'app.current_user\'))::uuid',
  });
  pgm.createPolicy('accounts', 'update_accounts', {
    command: 'UPDATE',
    using: 'user_id = (current_setting(\'app.current_user\'))::uuid',
  });
  pgm.createTrigger('accounts', 'set_updated_at', {
    when: 'BEFORE',
    operation: 'UPDATE',
    function: 'set_updated_at',
    level: 'ROW',
  });

  // Create investments table
  pgm.createTable('investments', {
    id: 'id',
    user_id: { type: 'uuid', notNull: true, references: 'users', onDelete: 'CASCADE' },
    holding_id: { type: 'text', notNull: true },
    account_id: { type: 'integer', notNull: true, references: 'accounts', onDelete: 'CASCADE' },
    security_id: 'text',
    security_name: { type: 'text', notNull: true },
    security_type: 'text',
    ticker_symbol: 'text',
    quantity: { type: 'numeric', notNull: true },
    cost_basis: 'numeric(15,2)',
    current_market_value: { type: 'numeric(15,2)', notNull: true },
    is_active: { type: 'boolean', notNull: true, default: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  }, {
    constraints: {
      unique: ['user_id', 'account_id', 'security_id'],
    },
    comment: 'Table storing user investment holdings',
  });
  pgm.alterTable('investments', { owner: 'postgres' });
  pgm.createIndex('investments', 'user_id');
  pgm.createIndex('investments', 'account_id');
  pgm.createIndex('investments', ['user_id', 'account_id']);
  pgm.createPolicy('investments', 'select_investments', {
    command: 'SELECT',
    using: 'user_id = (current_setting(\'app.current_user\'))::uuid',
  });
  pgm.createPolicy('investments', 'update_investments', {
    command: 'UPDATE',
    using: 'user_id = (current_setting(\'app.current_user\'))::uuid',
  });
  pgm.createTrigger('investments', 'set_updated_at', {
    when: 'BEFORE',
    operation: 'UPDATE',
    function: 'set_updated_at',
    level: 'ROW',
  });

  // Create widgets table
  pgm.createTable('widgets', {
    id: 'id',
    name: { type: 'text', notNull: true },
    description: 'text',
    default_settings: { type: 'jsonb', notNull: true, default: pgm.func('\'{}\'::jsonb') },
    is_active: { type: 'boolean', notNull: true, default: true },
    widget_type: { type: 'text', notNull: true },
    min_width: { type: 'integer', notNull: true, default: 1 },
    min_height: { type: 'integer', notNull: true, default: 1 },
    max_width: 'integer',
    max_height: 'integer',
    default_width: { type: 'integer', notNull: true, default: 2 },
    default_height: { type: 'integer', notNull: true, default: 2 },
    resizable: { type: 'boolean', notNull: true, default: true },
    draggable: { type: 'boolean', notNull: true, default: true },
    static: { type: 'boolean', notNull: true, default: false },
    icon: 'text',
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  }, {
    comment: 'Available widgets for dashboards',
  });
  pgm.alterTable('widgets', { owner: 'postgres' });
  pgm.createPolicy('widgets', 'select_widgets', {
    command: 'SELECT',
    using: 'true',
  });
  pgm.createTrigger('widgets', 'set_updated_at', {
    when: 'BEFORE',
    operation: 'UPDATE',
    function: 'set_updated_at',
    level: 'ROW',
  });

  // Create user_widgets table
  pgm.createTable('user_widgets', {
    id: 'id',
    user_id: { type: 'uuid', notNull: true, references: 'users', onDelete: 'CASCADE' },
    widget_id: { type: 'integer', notNull: true, references: 'widgets', onDelete: 'CASCADE' },
    settings: { type: 'jsonb', notNull: true, default: pgm.func('\'{}\'::jsonb') },
    layout: { type: 'jsonb', notNull: true, default: pgm.func('\'{}\'::jsonb') },
    is_active: { type: 'boolean', notNull: true, default: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    last_used: 'timestamptz',
  }, {
    comment: 'Widgets added by users to their dashboards',
  });
  pgm.alterTable('user_widgets', { owner: 'postgres' });
  pgm.createIndex('user_widgets', ['user_id', 'widget_id']);
  pgm.createPolicy('user_widgets', 'select_user_widgets', {
    command: 'SELECT',
    using: 'user_id = (current_setting(\'app.current_user\'))::uuid',
  });
  pgm.createPolicy('user_widgets', 'update_user_widgets', {
    command: 'UPDATE',
    using: 'user_id = (current_setting(\'app.current_user\'))::uuid',
  });
  pgm.createTrigger('user_widgets', 'set_updated_at', {
    when: 'BEFORE',
    operation: 'UPDATE',
    function: 'set_updated_at',
    level: 'ROW',
  });

  // Create journal_entries table
  pgm.createTable('journal_entries', {
    id: 'id',
    user_id: { type: 'uuid', notNull: true, references: 'users', onDelete: 'CASCADE' },
    content: { type: 'text', notNull: true },
    is_ai_generated: { type: 'boolean', notNull: true, default: false },
    category: 'text',
    tags: { type: 'text[]', default: pgm.func('\'{}\'::text[]') },
    time_frame_start: 'date',
    time_frame_end: 'date',
    financial_performance_rating: 'integer',
    sentiment: 'text',
    metadata: { type: 'jsonb', default: pgm.func('\'{}\'::jsonb') },
    reading_time: 'interval',
    associated_goals: { type: 'text[]', default: pgm.func('\'{}\'::text[]') },
    mood: 'text',
    location: 'point',
    attachments: { type: 'text[]', default: pgm.func('\'{}\'::text[]') },
    is_private: { type: 'boolean', notNull: true, default: true },
    is_favorite: { type: 'boolean', notNull: true, default: false },
    last_edited_by: { type: 'uuid', references: 'users' },
    version: { type: 'integer', default: 1 },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  }, {
    comment: 'User journal entries',
  });
  pgm.alterTable('journal_entries', { owner: 'postgres' });
  pgm.createIndex('journal_entries', ['user_id', 'time_frame_start']);
  pgm.createPolicy('journal_entries', 'select_journal_entries', {
    command: 'SELECT',
    using: 'user_id = (current_setting(\'app.current_user\'))::uuid',
  });
  pgm.createPolicy('journal_entries', 'update_journal_entries', {
    command: 'UPDATE',
    using: 'user_id = (current_setting(\'app.current_user\'))::uuid',
  });
  pgm.createTrigger('journal_entries', 'set_updated_at', {
    when: 'BEFORE',
    operation: 'UPDATE',
    function: 'set_updated_at',
    level: 'ROW',
  });

  // Create ai_analyses table
  pgm.createTable('ai_analyses', {
    id: 'id',
    user_id: { type: 'uuid', notNull: true, references: 'users', onDelete: 'CASCADE' },
    analysis_type: { type: 'text', notNull: true },
    input_data: { type: 'jsonb', notNull: true },
    output_data: { type: 'jsonb', notNull: true },
    status: { type: 'text', notNull: true, default: 'completed' },
    error_message: 'text',
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  }, {
    comment: 'AI analyses performed for users',
  });
  pgm.alterTable('ai_analyses', { owner: 'postgres' });
  pgm.createIndex('ai_analyses', ['user_id', 'analysis_type']);
  pgm.createPolicy('ai_analyses', 'select_ai_analyses', {
    command: 'SELECT',
    using: 'user_id = (current_setting(\'app.current_user\'))::uuid',
  });
  pgm.createPolicy('ai_analyses', 'update_ai_analyses', {
    command: 'UPDATE',
    using: 'user_id = (current_setting(\'app.current_user\'))::uuid',
  });
  pgm.createTrigger('ai_analyses', 'set_updated_at', {
    when: 'BEFORE',
    operation: 'UPDATE',
    function: 'set_updated_at',
    level: 'ROW',
  });

  // Create audit_logs table
  pgm.createTable('audit_logs', {
    id: 'id',
    user_id: { type: 'uuid', references: 'users', onDelete: 'SET NULL' },
    action: { type: 'text', notNull: true },
    table_name: 'text',
    record_id: 'bigint',
    changes: 'jsonb',
    action_timestamp: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    ip_address: 'inet',
    user_agent: 'text',
  }, {
    comment: 'Audit logs for tracking changes and actions',
  });
  pgm.alterTable('audit_logs', { owner: 'postgres' });
  pgm.createIndex('audit_logs', 'user_id');
  pgm.createIndex('audit_logs', 'action_timestamp');

  // Create transactions table
  pgm.createTable('transactions', {
    id: { type: 'integer', notNull: true, default: pgm.func('nextval(\'transactions_id_seq\'::regclass)') },
    user_id: { type: 'uuid', notNull: true, references: 'users', onDelete: 'CASCADE' },
    account_id: { type: 'integer', notNull: true, references: 'accounts', onDelete: 'CASCADE' },
    transaction_source_id: { type: 'text', notNull: true },
    transaction_source: { type: 'text', notNull: true },
    amount: { type: 'numeric(15,2)', notNull: true },
    transaction_date: { type: 'date', notNull: true },
    authorized_date: 'date',
    description: { type: 'text', notNull: true },
    category: 'text[]',
    transaction_type: 'text',
    pending: { type: 'boolean', default: false },
    is_manual: { type: 'boolean', default: false },
    metadata: { type: 'jsonb', default: pgm.func('\'{}\'::jsonb') },
    is_duplicate: { type: 'boolean', notNull: true, default: false },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  }, {
    constraints: {
      primaryKey: ['id', 'transaction_date'],
      unique: ['user_id', 'account_id', 'transaction_source_id', 'transaction_date'],
    },
    comment: 'Transactions table partitioned by transaction_date',
    inherits: 'transactions_base',
  });
  pgm.alterTable('transactions', { owner: 'postgres' });
  pgm.createIndex('transactions', ['user_id', 'account_id', 'transaction_date'], { name: 'idx_transactions_user_account_date' });

  // Create partitions for transactions table
  const months = ['2024_09', '2024_08', '2024_07', '2024_06'];
  months.forEach((month) => {
    const [year, mon] = month.split('_');
    const startDate = `${year}-${mon}-01`;
    const endDate = pgm.func(`(DATE '${startDate}' + INTERVAL '1 month')::DATE`);
    pgm.createTable(`transactions_${month}`, {}, {
      inherits: 'transactions',
      partitionBy: 'RANGE (transaction_date)',
      forValuesFrom: pgm.func(`'${startDate}'`),
      forValuesTo: endDate,
    });
    pgm.alterTable(`transactions_${month}`, { owner: 'postgres' });
  });

  // Create function set_updated_at()
  pgm.createFunction('set_updated_at', [], {
    returns: 'trigger',
    language: 'plpgsql',
    replace: true,
  }, `
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
  `);
  pgm.alterFunction('set_updated_at', [], { owner: 'postgres' });

  // Create function create_transactions_partition()
  pgm.createFunction('create_transactions_partition', [], {
    returns: 'trigger',
    language: 'plpgsql',
    replace: true,
  }, `
    DECLARE
        partition_name TEXT;
        start_date DATE;
        end_date DATE;
    BEGIN
        start_date := DATE_TRUNC('month', NEW.transaction_date);
        end_date := (start_date + INTERVAL '1 month')::DATE;
        partition_name := 'transactions_' || TO_CHAR(start_date, 'YYYY_MM');

        IF NOT EXISTS (
            SELECT 1 FROM pg_tables
            WHERE schemaname = 'public' AND tablename = partition_name
        ) THEN
            EXECUTE format(
                'CREATE TABLE IF NOT EXISTS %I PARTITION OF transactions FOR VALUES FROM (%L) TO (%L)',
                partition_name,
                start_date,
                end_date
            );
        END IF;

        RETURN NEW;
    END;
  `);
  pgm.alterFunction('create_transactions_partition', [], { owner: 'postgres' });

  // Create trigger create_transactions_partition_trigger
  pgm.createTrigger('transactions', 'create_transactions_partition_trigger', {
    when: 'BEFORE',
    operation: 'INSERT',
    function: 'create_transactions_partition',
    level: 'ROW',
  });
};

exports.down = (pgm) => {
  // Implement down migrations if needed
};
