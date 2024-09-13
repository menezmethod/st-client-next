# Database Schema Reference Guide

This guide provides a comprehensive overview of the database schema, including tables, columns, data types, relationships, constraints, indexes, triggers, and policies. It is designed to assist AI models like ChatGPT or Claude in understanding the database structure when editing files that interact with the database.

---

## Overview

The database schema is organized into the following key sections:

1. **Users and Authentication**
2. **Roles and Permissions**
3. **Payment Plans**
4. **Providers and Data Integration**
5. **Accounts and Transactions**
6. **Investments**
7. **Widgets and Dashboards**
8. **Journal Entries and AI Analysis**
9. **Security and Audit**

Each section contains detailed information about the tables, columns, constraints, relationships, and other relevant details.

---

## 1. Users and Authentication

### Table: `users`

- **Description:** Stores user profile information aligned with Firebase authentication.

#### Columns:

| Column Name       | Data Type                  | Constraints                            | Default                | Comment                      |
|-------------------|----------------------------|----------------------------------------|------------------------|------------------------------|
| `id`              | `uuid`                     | Primary Key                            | `gen_random_uuid()`    | Generated UUID               |
| `firebase_uid`    | `text`                     | Not Null, Unique                       |                        | Firebase unique identifier   |
| `email`           | `text`                     | Not Null, Unique                       |                        | User email address           |
| `display_name`    | `text`                     |                                        |                        | Display name                 |
| `photo_url`       | `text`                     |                                        |                        | Profile photo URL            |
| `bio`             | `text`                     |                                        |                        | User biography               |
| `is_email_verified` | `boolean`                |                                        | `false`                | Email verification status    |
| `phone_number`    | `text`                     |                                        |                        | Phone number                 |
| `date_of_birth`   | `date`                     |                                        |                        | Date of birth                |
| `country`         | `text`                     |                                        |                        | Country                      |
| `preferred_currency` | `text`                  |                                        | `'USD'`                | Preferred currency           |
| `created_at`      | `timestamp with time zone` | Not Null                               | `now()`                | Creation timestamp           |
| `updated_at`      | `timestamp with time zone` | Not Null                               | `now()`                | Last update timestamp        |
| `last_login`      | `timestamp with time zone` |                                        |                        | Last login timestamp         |

#### Constraints:

- **Primary Key:** `id`
- **Unique:** `firebase_uid`, `email`

#### Triggers:

- `set_updated_at` trigger updates `updated_at` on record updates.

#### Policies:

- **Row-Level Security (RLS):** Enabled
  - `select_user`: Allows users to select their own records.
  - `update_user`: Allows users to update their own records.

---

### Table: `user_settings`

- **Description:** Stores user-specific settings.

#### Columns:

| Column Name               | Data Type                  | Constraints       | Default        | Comment                                  |
|---------------------------|----------------------------|-------------------|----------------|------------------------------------------|
| `user_id`                 | `uuid`                     | Primary Key       |                | References `users(id)`                   |
| `theme`                   | `text`                     | Not Null          | `'default'`    | UI theme preference                      |
| `language`                | `text`                     | Not Null          | `'en'`         | Language preference                      |
| `notification_preferences`| `jsonb`                    | Not Null          | `'{}'`         | Notification settings in JSON format     |
| `customizations`          | `jsonb`                    | Not Null          | `'{}'`         | Custom UI settings in JSON format        |
| `timezone`                | `text`                     | Not Null          | `'UTC'`        | Timezone preference                      |
| `date_format`             | `text`                     | Not Null          | `'YYYY-MM-DD'` | Preferred date format                    |
| `time_format`             | `text`                     | Not Null          | `'HH:mm:ss'`   | Preferred time format                    |
| `currency_display`        | `text`                     | Not Null          | `'symbol'`     | Currency display preference              |
| `number_format`           | `text`                     | Not Null          | `'thousand_separated'` | Number formatting preference    |
| `created_at`              | `timestamp with time zone` | Not Null          | `now()`        | Creation timestamp                       |
| `updated_at`              | `timestamp with time zone` | Not Null          | `now()`        | Last update timestamp                    |
| `last_modified`           | `timestamp with time zone` | Not Null          | `now()`        | Last modification timestamp              |

#### Constraints:

- **Primary Key:** `user_id`
- **Foreign Key:** `user_id` references `users(id)`

#### Triggers:

- `set_updated_at` trigger updates `updated_at` and `last_modified` on record updates.

#### Policies:

- **Row-Level Security (RLS):** Enabled
  - `select_user_settings`: Allows users to select their own settings.
  - `update_user_settings`: Allows users to update their own settings.

---

## 2. Roles and Permissions

### Table: `roles`

- **Description:** Defines roles available in the system.

#### Columns:

| Column Name    | Data Type                  | Constraints | Default | Comment               |
|----------------|----------------------------|-------------|---------|-----------------------|
| `id`           | `serial`                   | Primary Key |         | Auto-incrementing ID  |
| `name`         | `text`                     | Not Null, Unique |     | Role name             |
| `description`  | `text`                     |             |         | Role description      |
| `created_at`   | `timestamp with time zone` | Not Null    | `now()` | Creation timestamp    |
| `updated_at`   | `timestamp with time zone` | Not Null    | `now()` | Last update timestamp |
| `last_modified`| `timestamp with time zone` | Not Null    | `now()` | Last modification     |

#### Constraints:

- **Primary Key:** `id`
- **Unique:** `name`

#### Triggers:

- `set_updated_at` trigger on `UPDATE`

#### Policies:

- **RLS:** Enabled
  - `select_roles`: Allows all users to select roles.

---

### Table: `permissions`

- **Description:** Defines permissions that can be assigned to roles.

#### Columns:

| Column Name    | Data Type                  | Constraints | Default | Comment                    |
|----------------|----------------------------|-------------|---------|----------------------------|
| `id`           | `serial`                   | Primary Key |         | Auto-incrementing ID       |
| `action`       | `text`                     | Not Null, Unique |     | Permission action identifier |
| `description`  | `text`                     |             |         | Permission description     |
| `created_at`   | `timestamp with time zone` | Not Null    | `now()` | Creation timestamp         |
| `updated_at`   | `timestamp with time zone` | Not Null    | `now()` | Last update timestamp      |
| `last_modified`| `timestamp with time zone` | Not Null    | `now()` | Last modification          |

#### Constraints:

- **Primary Key:** `id`
- **Unique:** `action`

#### Triggers:

- `set_updated_at` trigger on `UPDATE`

#### Policies:

- **RLS:** Enabled
  - `select_permissions`: Allows all users to select permissions.

---

### Table: `role_permissions`

- **Description:** Associates permissions with roles.

#### Columns:

| Column Name     | Data Type | Constraints | Comment                            |
|-----------------|-----------|-------------|------------------------------------|
| `role_id`       | `integer` | Primary Key | References `roles(id)`             |
| `permission_id` | `integer` | Primary Key | References `permissions(id)`       |

#### Constraints:

- **Primary Key:** (`role_id`, `permission_id`)
- **Foreign Keys:**
  - `role_id` references `roles(id)` on DELETE CASCADE
  - `permission_id` references `permissions(id)` on DELETE CASCADE

#### Policies:

- **RLS:** Enabled
  - `select_role_permissions`: Allows all users to select role-permission associations.

---

### Table: `user_roles`

- **Description:** Associates users with roles.

#### Columns:

| Column Name | Data Type | Constraints | Comment                    |
|-------------|-----------|-------------|----------------------------|
| `user_id`   | `uuid`    | Primary Key | References `users(id)`     |
| `role_id`   | `integer` | Primary Key | References `roles(id)`     |

#### Constraints:

- **Primary Key:** (`user_id`, `role_id`)
- **Foreign Keys:**
  - `user_id` references `users(id)` on DELETE CASCADE
  - `role_id` references `roles(id)` on DELETE CASCADE

#### Policies:

- **RLS:** Enabled
  - `select_user_roles`: Allows users to select their own roles.

---

## 3. Payment Plans

### Table: `payment_plans`

- **Description:** Defines available payment plans.

#### Columns:

| Column Name    | Data Type                  | Constraints | Default | Comment                       |
|----------------|----------------------------|-------------|---------|-------------------------------|
| `id`           | `serial`                   | Primary Key |         | Auto-incrementing ID          |
| `name`         | `text`                     | Not Null, Unique |     | Payment plan name             |
| `description`  | `text`                     |             |         | Payment plan description      |
| `price_cents`  | `integer`                  | Not Null    |         | Price in cents                |
| `features`     | `jsonb`                    | Not Null    | `'{}'`  | Features included in the plan |
| `is_active`    | `boolean`                  | Not Null    | `true`  | Active status                 |
| `created_at`   | `timestamp with time zone` | Not Null    | `now()` | Creation timestamp            |
| `updated_at`   | `timestamp with time zone` | Not Null    | `now()` | Last update timestamp         |
| `last_modified`| `timestamp with time zone` | Not Null    | `now()` | Last modification             |

#### Constraints:

- **Primary Key:** `id`
- **Unique:** `name`

#### Triggers:

- `set_updated_at` trigger on `UPDATE`

#### Policies:

- **RLS:** Enabled
  - `select_payment_plans`: Allows all users to select payment plans.

---

### Table: `user_payment_plans`

- **Description:** Associates users with payment plans.

#### Columns:

| Column Name            | Data Type                  | Constraints       | Default | Comment                             |
|------------------------|----------------------------|-------------------|---------|-------------------------------------|
| `user_id`              | `uuid`                     | Primary Key       |         | References `users(id)`              |
| `payment_plan_id`      | `integer`                  | Primary Key       |         | References `payment_plans(id)`      |
| `subscription_start`   | `timestamp with time zone` | Not Null          | `now()` | Subscription start date             |
| `subscription_end`     | `timestamp with time zone` |                   |         | Subscription end date               |
| `status`               | `text`                     | Not Null          | `'active'` | Subscription status               |
| `last_payment`         | `timestamp with time zone` |                   |         | Timestamp of last payment           |
| `payment_method`       | `text`                     |                   |         | Payment method used                 |
| `transaction_id`       | `text`                     |                   |         | Transaction identifier              |
| `auto_renew`           | `boolean`                  |                   | `true`  | Auto-renewal status                 |
| `next_billing_date`    | `timestamp with time zone` |                   |         | Next billing date                   |
| `cancellation_date`    | `timestamp with time zone` |                   |         | Cancellation date                   |
| `cancellation_reason`  | `text`                     |                   |         | Reason for cancellation             |
| `created_at`           | `timestamp with time zone` | Not Null          | `now()` | Creation timestamp                  |
| `updated_at`           | `timestamp with time zone` | Not Null          | `now()` | Last update timestamp               |

#### Constraints:

- **Primary Key:** (`user_id`, `payment_plan_id`)
- **Foreign Keys:**
  - `user_id` references `users(id)` on DELETE CASCADE
  - `payment_plan_id` references `payment_plans(id)` on DELETE CASCADE

#### Policies:

- Not specified, but should follow standard practices for user data.

---

## 4. Providers and Data Integration

### Table: `data_providers`

- **Description:** Defines external data providers.

#### Columns:

| Column Name          | Data Type                  | Constraints | Default | Comment                                |
|----------------------|----------------------------|-------------|---------|----------------------------------------|
| `id`                 | `serial`                   | Primary Key |         | Auto-incrementing ID                   |
| `name`               | `text`                     | Not Null, Unique |     | Provider name                          |
| `description`        | `text`                     |             |         | Provider description                   |
| `is_active`          | `boolean`                  | Not Null    | `true`  | Active status                          |
| `provider_type`      | `text`                     | Not Null    |         | Type of provider (e.g., API, Manual)   |
| `api_base_url`       | `text`                     |             |         | API base URL                           |
| `api_version`        | `text`                     |             |         | API version                            |
| `auth_method`        | `text`                     |             |         | Authentication method (e.g., OAuth)    |
| `required_credentials` | `jsonb`                  |             |         | Required credentials for authentication |
| `supported_account_types` | `jsonb`               |             |         | Supported account types                |
| `logo_url`           | `text`                     |             |         | Provider logo URL                      |
| `website`            | `text`                     |             |         | Provider website                       |
| `support_email`      | `text`                     |             |         | Support email address                  |
| `rate_limit`         | `integer`                  |             |         | API rate limit (requests per minute)   |
| `created_at`         | `timestamp with time zone` | Not Null    | `now()` | Creation timestamp                     |
| `updated_at`         | `timestamp with time zone` | Not Null    | `now()` | Last update timestamp                  |
| `last_modified`      | `timestamp with time zone` | Not Null    | `now()` | Last modification                      |

#### Constraints:

- **Primary Key:** `id`
- **Unique:** `name`

#### Triggers:

- `set_updated_at` trigger on `UPDATE`

#### Policies:

- **RLS:** Enabled
  - `select_data_providers`: Allows all users to select data providers.

---

### Table: `user_provider_connections`

- **Description:** Stores user connections to data providers.

#### Columns:

| Column Name          | Data Type                  | Constraints       | Default | Comment                                  |
|----------------------|----------------------------|-------------------|---------|------------------------------------------|
| `id`                 | `serial`                   | Primary Key       |         | Auto-incrementing ID                     |
| `user_id`            | `uuid`                     | Not Null          |         | References `users(id)`                   |
| `provider_id`        | `integer`                  | Not Null          |         | References `data_providers(id)`          |
| `connection_status`  | `text`                     | Not Null          | `'active'` | Connection status                      |
| `last_sync`          | `timestamp with time zone` |                   |         | Timestamp of last sync                   |
| `settings`           | `jsonb`                    | Not Null          | `'{}'`  | Provider-specific settings               |
| `institution_id`     | `text`                     |                   |         | Financial institution identifier         |
| `item_id`            | `text`                     |                   |         | Provider item identifier                 |
| `error_code`         | `text`                     |                   |         | Error code if any                        |
| `error_message`      | `text`                     |                   |         | Detailed error message                   |
| `refresh_token`      | `text`                     |                   |         | Encrypted refresh token                  |
| `access_token_expiry`| `timestamp with time zone` |                   |         | Access token expiration                  |
| `last_successful_sync` | `timestamp with time zone` |                 |         | Last successful sync timestamp           |
| `sync_frequency`     | `interval`                 |                   |         | Data sync frequency                      |
| `created_at`         | `timestamp with time zone` | Not Null          | `now()` | Creation timestamp                       |
| `updated_at`         | `timestamp with time zone` | Not Null          | `now()` | Last update timestamp                    |
| `last_connection`    | `timestamp with time zone` |                   |         | Last connection attempt                  |

#### Constraints:

- **Primary Key:** `id`
- **Foreign Keys:**
  - `user_id` references `users(id)` on DELETE CASCADE
  - `provider_id` references `data_providers(id)` on DELETE CASCADE

#### Indexes:

- Composite Index on `user_id`, `provider_id`

#### Triggers:

- `set_updated_at` trigger on `UPDATE`

#### Policies:

- **RLS:** Enabled
  - `select_user_provider_connections`: Allows users to select their own connections.
  - `update_user_provider_connections`: Allows users to update their own connections.

---

## 5. Accounts and Transactions

### Table: `accounts`

- **Description:** Stores user financial accounts.

#### Columns:

| Column Name              | Data Type                  | Constraints       | Default         | Comment                                    |
|--------------------------|----------------------------|-------------------|-----------------|--------------------------------------------|
| `id`                     | `serial`                   | Primary Key       |                 | Auto-incrementing ID                       |
| `user_id`                | `uuid`                     | Not Null          |                 | References `users(id)`                     |
| `provider_connection_id` | `integer`                  |                   |                 | References `user_provider_connections(id)` |
| `account_source_id`      | `text`                     | Not Null          |                 | ID from the data source                    |
| `account_source`         | `text`                     | Not Null          |                 | Source of the account data                 |
| `name`                   | `text`                     | Not Null          |                 | Account name                               |
| `official_name`          | `text`                     |                   |                 | Official account name                      |
| `type`                   | `text`                     |                   |                 | Account type                               |
| `subtype`                | `text`                     |                   |                 | Account subtype                            |
| `currency_code`          | `text`                     |                   | `'USD'`         | Currency code                              |
| `balance`                | `numeric(15,2)`            | Not Null          | `0`             | Current balance                            |
| `available_balance`      | `numeric(15,2)`            |                   |                 | Available balance                          |
| `credit_limit`           | `numeric(15,2)`            |                   |                 | Account credit limit if applicable         |
| `is_active`              | `boolean`                  | Not Null          | `true`          | Active status                              |
| `is_manual`              | `boolean`                  | Not Null          | `false`         | Manually added account indicator           |
| `institution_name`       | `text`                     |                   |                 | Financial institution name                 |
| `mask`                   | `text`                     |                   |                 | Account mask                               |
| `last_four`              | `text`                     |                   |                 | Last four digits of account                |
| `created_at`             | `timestamp with time zone` | Not Null          | `now()`         | Creation timestamp                         |
| `updated_at`             | `timestamp with time zone` | Not Null          | `now()`         | Last update timestamp                      |
| `last_sync`              | `timestamp with time zone` |                   |                 | Last sync timestamp                        |

#### Constraints:

- **Primary Key:** `id`
- **Foreign Keys:**
  - `user_id` references `users(id)` on DELETE CASCADE
  - `provider_connection_id` references `user_provider_connections(id)` on DELETE SET NULL
- **Unique:** (`user_id`, `account_source_id`)

#### Indexes:

- Composite Index on `user_id`, `account_source_id`
- Index on `user_id`

#### Triggers:

- `set_updated_at` trigger on `UPDATE`

#### Policies:

- **RLS:** Enabled
  - `select_accounts`: Allows users to select their own accounts.
  - `update_accounts`: Allows users to update their own accounts.

---

### Table: `transactions`

- **Description:** Stores user financial transactions. This table is partitioned by date range (monthly partitions).

#### Columns:

| Column Name           | Data Type                  | Constraints       | Default         | Comment                                   |
|-----------------------|----------------------------|-------------------|-----------------|-------------------------------------------|
| `id`                  | `serial`                   | Primary Key       |                 | Auto-incrementing ID                      |
| `user_id`             | `uuid`                     | Not Null          |                 | References `users(id)`                    |
| `account_id`          | `integer`                  | Not Null          |                 | References `accounts(id)`                 |
| `transaction_source_id` | `text`                   | Not Null          |                 | ID from the data source                   |
| `transaction_source`  | `text`                     | Not Null          |                 | Source of the transaction data            |
| `amount`              | `numeric(15,2)`            | Not Null          |                 | Transaction amount                        |
| `transaction_date`    | `date`                     | Not Null          |                 | Transaction date                          |
| `transaction_type`    | `text`                     |                   |                 | Transaction type                          |
| `authorized_date`     | `date`                     |                   |                 | Authorization date if applicable          |
| `description`         | `text`                     | Not Null          |                 | Transaction description                   |
| `category`            | `text[]`                   |                   |                 | Transaction categories                    |
| `pending`             | `boolean`                  |                   | `false`         | Pending status                            |
| `is_manual`           | `boolean`                  |                   | `false`         | Manually added transaction indicator      |
| `metadata`            | `jsonb`                    |                   | `'{}'`          | Additional metadata                       |
| `is_duplicate`        | `boolean`                  | Not Null          | `false`         | Duplicate transaction indicator           |
| `created_at`          | `timestamp with time zone` | Not Null          | `now()`         | Creation timestamp                        |
| `updated_at`          | `timestamp with time zone` | Not Null          | `now()`         | Last update timestamp                     |
| `last_modified`       | `timestamp with time zone` | Not Null          | `now()`         | Last modification timestamp               |

#### Constraints:

- **Primary Key:** `id`
- **Foreign Keys:**
  - `user_id` references `users(id)` on DELETE CASCADE
  - `account_id` references `accounts(id)` on DELETE CASCADE

#### Partitioning:

- **Partitioned By:** `RANGE (transaction_date)`
- **Partition Creation Trigger:** `create_transactions_partition_trigger` automatically creates monthly partitions.

#### Indexes:

- Composite Index on `user_id`, `account_id`, `transaction_date`

#### Triggers:

- `set_updated_at` trigger on `UPDATE`
- `create_transactions_partition_trigger` on `INSERT` to manage partitions.

#### Policies:

- **RLS:** Enabled
  - `select_transactions`: Allows users to select their own transactions.
  - `update_transactions`: Allows users to update their own transactions.

---

## 6. Investments

### Table: `investments`

- **Description:** Stores user investment holdings.

#### Columns:

| Column Name         | Data Type                  | Constraints       | Default         | Comment                                    |
|---------------------|----------------------------|-------------------|-----------------|--------------------------------------------|
| `id`                | `serial`                   | Primary Key       |                 | Auto-incrementing ID                       |
| `user_id`           | `uuid`                     | Not Null          |                 | References `users(id)`                     |
| `holding_id`        | `text`                     | Not Null          |                 | Unique identifier for the holding          |
| `account_id`        | `integer`                  | Not Null          |                 | References `accounts(id)`                  |
| `security_id`       | `text`                     |                   |                 | Unique identifier for the security         |
| `security_name`     | `text`                     | Not Null          |                 | Name of the security                       |
| `security_type`     | `text`                     |                   |                 | Type of security                           |
| `ticker_symbol`     | `text`                     |                   |                 | Ticker symbol of the security              |
| `quantity`          | `numeric`                  | Not Null          |                 | Quantity of the security held              |
| `cost_basis`        | `numeric(15,2)`            |                   |                 | Total cost basis of the investment         |
| `current_market_value` | `numeric(15,2)`         | Not Null          |                 | Current market value of the investment     |
| `is_active`         | `boolean`                  | Not Null          | `true`          | Whether the investment is currently active |
| `created_at`        | `timestamp with time zone` | Not Null          | `now()`         | Creation timestamp                         |
| `updated_at`        | `timestamp with time zone` | Not Null          | `now()`         | Last update timestamp                      |

#### Constraints:

- **Primary Key:** `id`
- **Foreign Keys:**
  - `user_id` references `users(id)` on DELETE CASCADE
  - `account_id` references `accounts(id)` on DELETE CASCADE
- **Unique:** (`user_id`, `holding_id`)

#### Indexes:

- Index on `user_id`
- Index on `account_id`
- Composite Index on `user_id`, `account_id`

#### Triggers:

- `set_updated_at` trigger on `UPDATE`

#### Policies:

- **RLS:** Enabled
  - `select_investments`: Allows users to select their own investments.
  - `update_investments`: Allows users to update their own investments.

---

## 7. Widgets and Dashboards

### Table: `widgets`

- **Description:** Defines available widgets for dashboards.

#### Columns:

| Column Name       | Data Type                  | Constraints       | Default | Comment                                 |
|-------------------|----------------------------|-------------------|---------|-----------------------------------------|
| `id`              | `serial`                   | Primary Key       |         | Auto-incrementing ID                    |
| `name`            | `text`                     | Not Null          |         | Widget name                             |
| `description`     | `text`                     |                   |         | Widget description                      |
| `default_settings`| `jsonb`                    | Not Null          | `'{}'`  | Default settings for the widget         |
| `is_active`       | `boolean`                  | Not Null          | `true`  | Active status                           |
| `widget_type`     | `text`                     | Not Null          |         | Type of widget                          |
| `min_width`       | `integer`                  | Not Null          | `1`     | Minimum width in grid units             |
| `min_height`      | `integer`                  | Not Null          | `1`     | Minimum height in grid units            |
| `max_width`       | `integer`                  |                   |         | Maximum width in grid units             |
| `max_height`      | `integer`                  |                   |         | Maximum height in grid units            |
| `default_width`   | `integer`                  | Not Null          | `2`     | Default width in grid units             |
| `default_height`  | `integer`                  | Not Null          | `2`     | Default height in grid units            |
| `resizable`       | `boolean`                  | Not Null          | `true`  | Resizable indicator                     |
| `draggable`       | `boolean`                  | Not Null          | `true`  | Draggable indicator                     |
| `static`          | `boolean`                  | Not Null          | `false` | Static widget indicator                 |
| `icon`            | `text`                     |                   |         | Widget icon                             |
| `created_at`      | `timestamp with time zone` | Not Null          | `now()` | Creation timestamp                      |
| `updated_at`      | `timestamp with time zone` | Not Null          | `now()` | Last update timestamp                   |
| `last_modified`   | `timestamp with time zone` | Not Null          | `now()` | Last modification timestamp             |

#### Constraints:

- **Primary Key:** `id`

#### Triggers:

- `set_updated_at` trigger on `UPDATE`

#### Policies:

- **RLS:** Enabled
  - `select_widgets`: Allows all users to select widgets.

---

# Database Schema Reference Guide

This guide provides a comprehensive overview of the database schema, including tables, columns, data types, relationships, constraints, indexes, triggers, and policies. It is designed to assist AI models like ChatGPT or Claude in understanding the database structure when editing files that interact with the database.

---

## Overview

The database schema is organized into the following key sections:

1. **Users and Authentication**
2. **Roles and Permissions**
3. **Payment Plans**
4. **Providers and Data Integration**
5. **Accounts and Transactions**
6. **Investments**
7. **Widgets and Dashboards**
8. **Journal Entries and AI Analysis**
9. **Security and Audit**

Each section contains detailed information about the tables, columns, constraints, relationships, and other relevant details.

---

## 1. Users and Authentication

### Table: `users`

- **Description:** Stores user profile information aligned with Firebase authentication.

#### Columns:

| Column Name       | Data Type                  | Constraints                            | Default                | Comment                      |
|-------------------|----------------------------|----------------------------------------|------------------------|------------------------------|
| `id`              | `uuid`                     | Primary Key                            | `gen_random_uuid()`    | Generated UUID               |
| `firebase_uid`    | `text`                     | Not Null, Unique                       |                        | Firebase unique identifier   |
| `email`           | `text`                     | Not Null, Unique                       |                        | User email address           |
| `display_name`    | `text`                     |                                        |                        | Display name                 |
| `photo_url`       | `text`                     |                                        |                        | Profile photo URL            |
| `bio`             | `text`                     |                                        |                        | User biography               |
| `is_email_verified` | `boolean`                |                                        | `false`                | Email verification status    |
| `phone_number`    | `text`                     |                                        |                        | Phone number                 |
| `date_of_birth`   | `date`                     |                                        |                        | Date of birth                |
| `country`         | `text`                     |                                        |                        | Country                      |
| `preferred_currency` | `text`                  |                                        | `'USD'`                | Preferred currency           |
| `created_at`      | `timestamp with time zone` | Not Null                               | `now()`                | Creation timestamp           |
| `updated_at`      | `timestamp with time zone` | Not Null                               | `now()`                | Last update timestamp        |
| `last_login`      | `timestamp with time zone` |                                        |                        | Last login timestamp         |

#### Constraints:

- **Primary Key:** `id`
- **Unique:** `firebase_uid`, `email`

#### Triggers:

- `set_updated_at` trigger updates `updated_at` on record updates.

#### Policies:

- **Row-Level Security (RLS):** Enabled
  - `select_user`: Allows users to select their own records.
  - `update_user`: Allows users to update their own records.

---

### Table: `user_settings`

- **Description:** Stores user-specific settings.

#### Columns:

| Column Name               | Data Type                  | Constraints       | Default        | Comment                                  |
|---------------------------|----------------------------|-------------------|----------------|------------------------------------------|
| `user_id`                 | `uuid`                     | Primary Key       |                | References `users(id)`                   |
| `theme`                   | `text`                     | Not Null          | `'default'`    | UI theme preference                      |
| `language`                | `text`                     | Not Null          | `'en'`         | Language preference                      |
| `notification_preferences`| `jsonb`                    | Not Null          | `'{}'`         | Notification settings in JSON format     |
| `customizations`          | `jsonb`                    | Not Null          | `'{}'`         | Custom UI settings in JSON format        |
| `timezone`                | `text`                     | Not Null          | `'UTC'`        | Timezone preference                      |
| `date_format`             | `text`                     | Not Null          | `'YYYY-MM-DD'` | Preferred date format                    |
| `time_format`             | `text`                     | Not Null          | `'HH:mm:ss'`   | Preferred time format                    |
| `currency_display`        | `text`                     | Not Null          | `'symbol'`     | Currency display preference              |
| `number_format`           | `text`                     | Not Null          | `'thousand_separated'` | Number formatting preference    |
| `created_at`              | `timestamp with time zone` | Not Null          | `now()`        | Creation timestamp                       |
| `updated_at`              | `timestamp with time zone` | Not Null          | `now()`        | Last update timestamp                    |
| `last_modified`           | `timestamp with time zone` | Not Null          | `now()`        | Last modification timestamp              |

#### Constraints:

- **Primary Key:** `user_id`
- **Foreign Key:** `user_id` references `users(id)`

#### Triggers:

- `set_updated_at` trigger updates `updated_at` and `last_modified` on record updates.

#### Policies:

- **Row-Level Security (RLS):** Enabled
  - `select_user_settings`: Allows users to select their own settings.
  - `update_user_settings`: Allows users to update their own settings.

---

## 2. Roles and Permissions

### Table: `roles`

- **Description:** Defines roles available in the system.

#### Columns:

| Column Name    | Data Type                  | Constraints | Default | Comment               |
|----------------|----------------------------|-------------|---------|-----------------------|
| `id`           | `serial`                   | Primary Key |         | Auto-incrementing ID  |
| `name`         | `text`                     | Not Null, Unique |     | Role name             |
| `description`  | `text`                     |             |         | Role description      |
| `created_at`   | `timestamp with time zone` | Not Null    | `now()` | Creation timestamp    |
| `updated_at`   | `timestamp with time zone` | Not Null    | `now()` | Last update timestamp |
| `last_modified`| `timestamp with time zone` | Not Null    | `now()` | Last modification     |

#### Constraints:

- **Primary Key:** `id`
- **Unique:** `name`

#### Triggers:

- `set_updated_at` trigger on `UPDATE`

#### Policies:

- **RLS:** Enabled
  - `select_roles`: Allows all users to select roles.

---

### Table: `permissions`

- **Description:** Defines permissions that can be assigned to roles.

#### Columns:

| Column Name    | Data Type                  | Constraints | Default | Comment                    |
|----------------|----------------------------|-------------|---------|----------------------------|
| `id`           | `serial`                   | Primary Key |         | Auto-incrementing ID       |
| `action`       | `text`                     | Not Null, Unique |     | Permission action identifier |
| `description`  | `text`                     |             |         | Permission description     |
| `created_at`   | `timestamp with time zone` | Not Null    | `now()` | Creation timestamp         |
| `updated_at`   | `timestamp with time zone` | Not Null    | `now()` | Last update timestamp      |
| `last_modified`| `timestamp with time zone` | Not Null    | `now()` | Last modification          |

#### Constraints:

- **Primary Key:** `id`
- **Unique:** `action`

#### Triggers:

- `set_updated_at` trigger on `UPDATE`

#### Policies:

- **RLS:** Enabled
  - `select_permissions`: Allows all users to select permissions.

---

### Table: `role_permissions`

- **Description:** Associates permissions with roles.

#### Columns:

| Column Name     | Data Type | Constraints | Comment                            |
|-----------------|-----------|-------------|------------------------------------|
| `role_id`       | `integer` | Primary Key | References `roles(id)`             |
| `permission_id` | `integer` | Primary Key | References `permissions(id)`       |

#### Constraints:

- **Primary Key:** (`role_id`, `permission_id`)
- **Foreign Keys:**
  - `role_id` references `roles(id)` on DELETE CASCADE
  - `permission_id` references `permissions(id)` on DELETE CASCADE

#### Policies:

- **RLS:** Enabled
  - `select_role_permissions`: Allows all users to select role-permission associations.

---

### Table: `user_roles`

- **Description:** Associates users with roles.

#### Columns:

| Column Name | Data Type | Constraints | Comment                    |
|-------------|-----------|-------------|----------------------------|
| `user_id`   | `uuid`    | Primary Key | References `users(id)`     |
| `role_id`   | `integer` | Primary Key | References `roles(id)`     |

#### Constraints:

- **Primary Key:** (`user_id`, `role_id`)
- **Foreign Keys:**
  - `user_id` references `users(id)` on DELETE CASCADE
  - `role_id` references `roles(id)` on DELETE CASCADE

#### Policies:

- **RLS:** Enabled
  - `select_user_roles`: Allows users to select their own roles.

---

## 3. Payment Plans

### Table: `payment_plans`

- **Description:** Defines available payment plans.

#### Columns:

| Column Name    | Data Type                  | Constraints | Default | Comment                       |
|----------------|----------------------------|-------------|---------|-------------------------------|
| `id`           | `serial`                   | Primary Key |         | Auto-incrementing ID          |
| `name`         | `text`                     | Not Null, Unique |     | Payment plan name             |
| `description`  | `text`                     |             |         | Payment plan description      |
| `price_cents`  | `integer`                  | Not Null    |         | Price in cents                |
| `features`     | `jsonb`                    | Not Null    | `'{}'`  | Features included in the plan |
| `is_active`    | `boolean`                  | Not Null    | `true`  | Active status                 |
| `created_at`   | `timestamp with time zone` | Not Null    | `now()` | Creation timestamp            |
| `updated_at`   | `timestamp with time zone` | Not Null    | `now()` | Last update timestamp         |
| `last_modified`| `timestamp with time zone` | Not Null    | `now()` | Last modification             |

#### Constraints:

- **Primary Key:** `id`
- **Unique:** `name`

#### Triggers:

- `set_updated_at` trigger on `UPDATE`

#### Policies:

- **RLS:** Enabled
  - `select_payment_plans`: Allows all users to select payment plans.

---

### Table: `user_payment_plans`

- **Description:** Associates users with payment plans.

#### Columns:

| Column Name            | Data Type                  | Constraints       | Default | Comment                             |
|------------------------|----------------------------|-------------------|---------|-------------------------------------|
| `user_id`              | `uuid`                     | Primary Key       |         | References `users(id)`              |
| `payment_plan_id`      | `integer`                  | Primary Key       |         | References `payment_plans(id)`      |
| `subscription_start`   | `timestamp with time zone` | Not Null          | `now()` | Subscription start date             |
| `subscription_end`     | `timestamp with time zone` |                   |         | Subscription end date               |
| `status`               | `text`                     | Not Null          | `'active'` | Subscription status               |
| `last_payment`         | `timestamp with time zone` |                   |         | Timestamp of last payment           |
| `payment_method`       | `text`                     |                   |         | Payment method used                 |
| `transaction_id`       | `text`                     |                   |         | Transaction identifier              |
| `auto_renew`           | `boolean`                  |                   | `true`  | Auto-renewal status                 |
| `next_billing_date`    | `timestamp with time zone` |                   |         | Next billing date                   |
| `cancellation_date`    | `timestamp with time zone` |                   |         | Cancellation date                   |
| `cancellation_reason`  | `text`                     |                   |         | Reason for cancellation             |
| `created_at`           | `timestamp with time zone` | Not Null          | `now()` | Creation timestamp                  |
| `updated_at`           | `timestamp with time zone` | Not Null          | `now()` | Last update timestamp               |

#### Constraints:

- **Primary Key:** (`user_id`, `payment_plan_id`)
- **Foreign Keys:**
  - `user_id` references `users(id)` on DELETE CASCADE
  - `payment_plan_id` references `payment_plans(id)` on DELETE CASCADE

#### Policies:

- Not specified, but should follow standard practices for user data.

---

## 4. Providers and Data Integration

### Table: `data_providers`

- **Description:** Defines external data providers.

#### Columns:

| Column Name          | Data Type                  | Constraints | Default | Comment                                |
|----------------------|----------------------------|-------------|---------|----------------------------------------|
| `id`                 | `serial`                   | Primary Key |         | Auto-incrementing ID                   |
| `name`               | `text`                     | Not Null, Unique |     | Provider name                          |
| `description`        | `text`                     |             |         | Provider description                   |
| `is_active`          | `boolean`                  | Not Null    | `true`  | Active status                          |
| `provider_type`      | `text`                     | Not Null    |         | Type of provider (e.g., API, Manual)   |
| `api_base_url`       | `text`                     |             |         | API base URL                           |
| `api_version`        | `text`                     |             |         | API version                            |
| `auth_method`        | `text`                     |             |         | Authentication method (e.g., OAuth)    |
| `required_credentials` | `jsonb`                  |             |         | Required credentials for authentication |
| `supported_account_types` | `jsonb`               |             |         | Supported account types                |
| `logo_url`           | `text`                     |             |         | Provider logo URL                      |
| `website`            | `text`                     |             |         | Provider website                       |
| `support_email`      | `text`                     |             |         | Support email address                  |
| `rate_limit`         | `integer`                  |             |         | API rate limit (requests per minute)   |
| `created_at`         | `timestamp with time zone` | Not Null    | `now()` | Creation timestamp                     |
| `updated_at`         | `timestamp with time zone` | Not Null    | `now()` | Last update timestamp                  |
| `last_modified`      | `timestamp with time zone` | Not Null    | `now()` | Last modification                      |

#### Constraints:

- **Primary Key:** `id`
- **Unique:** `name`

#### Triggers:

- `set_updated_at` trigger on `UPDATE`

#### Policies:

- **RLS:** Enabled
  - `select_data_providers`: Allows all users to select data providers.

---

### Table: `user_provider_connections`

- **Description:** Stores user connections to data providers.

#### Columns:

| Column Name          | Data Type                  | Constraints       | Default | Comment                                  |
|----------------------|----------------------------|-------------------|---------|------------------------------------------|
| `id`                 | `serial`                   | Primary Key       |         | Auto-incrementing ID                     |
| `user_id`            | `uuid`                     | Not Null          |         | References `users(id)`                   |
| `provider_id`        | `integer`                  | Not Null          |         | References `data_providers(id)`          |
| `connection_status`  | `text`                     | Not Null          | `'active'` | Connection status                      |
| `last_sync`          | `timestamp with time zone` |                   |         | Timestamp of last sync                   |
| `settings`           | `jsonb`                    | Not Null          | `'{}'`  | Provider-specific settings               |
| `institution_id`     | `text`                     |                   |         | Financial institution identifier         |
| `item_id`            | `text`                     |                   |         | Provider item identifier                 |
| `error_code`         | `text`                     |                   |         | Error code if any                        |
| `error_message`      | `text`                     |                   |         | Detailed error message                   |
| `refresh_token`      | `text`                     |                   |         | Encrypted refresh token                  |
| `access_token_expiry`| `timestamp with time zone` |                   |         | Access token expiration                  |
| `last_successful_sync` | `timestamp with time zone` |                 |         | Last successful sync timestamp           |
| `sync_frequency`     | `interval`                 |                   |         | Data sync frequency                      |
| `created_at`         | `timestamp with time zone` | Not Null          | `now()` | Creation timestamp                       |
| `updated_at`         | `timestamp with time zone` | Not Null          | `now()` | Last update timestamp                    |
| `last_connection`    | `timestamp with time zone` |                   |         | Last connection attempt                  |

#### Constraints:

- **Primary Key:** `id`
- **Foreign Keys:**
  - `user_id` references `users(id)` on DELETE CASCADE
  - `provider_id` references `data_providers(id)` on DELETE CASCADE

#### Indexes:

- Composite Index on `user_id`, `provider_id`

#### Triggers:

- `set_updated_at` trigger on `UPDATE`

#### Policies:

- **RLS:** Enabled
  - `select_user_provider_connections`: Allows users to select their own connections.
  - `update_user_provider_connections`: Allows users to update their own connections.

---

## 5. Accounts and Transactions

### Table: `accounts`

- **Description:** Stores user financial accounts.

#### Columns:

| Column Name              | Data Type                  | Constraints       | Default         | Comment                                    |
|--------------------------|----------------------------|-------------------|-----------------|--------------------------------------------|
| `id`                     | `serial`                   | Primary Key       |                 | Auto-incrementing ID                       |
| `user_id`                | `uuid`                     | Not Null          |                 | References `users(id)`                     |
| `provider_connection_id` | `integer`                  |                   |                 | References `user_provider_connections(id)` |
| `account_source_id`      | `text`                     | Not Null          |                 | ID from the data source                    |
| `account_source`         | `text`                     | Not Null          |                 | Source of the account data                 |
| `name`                   | `text`                     | Not Null          |                 | Account name                               |
| `official_name`          | `text`                     |                   |                 | Official account name                      |
| `type`                   | `text`                     |                   |                 | Account type                               |
| `subtype`                | `text`                     |                   |                 | Account subtype                            |
| `currency_code`          | `text`                     |                   | `'USD'`         | Currency code                              |
| `balance`                | `numeric(15,2)`            | Not Null          | `0`             | Current balance                            |
| `available_balance`      | `numeric(15,2)`            |                   |                 | Available balance                          |
| `credit_limit`           | `numeric(15,2)`            |                   |                 | Account credit limit if applicable         |
| `is_active`              | `boolean`                  | Not Null          | `true`          | Active status                              |
| `is_manual`              | `boolean`                  | Not Null          | `false`         | Manually added account indicator           |
| `institution_name`       | `text`                     |                   |                 | Financial institution name                 |
| `mask`                   | `text`                     |                   |                 | Account mask                               |
| `last_four`              | `text`                     |                   |                 | Last four digits of account                |
| `created_at`             | `timestamp with time zone` | Not Null          | `now()`         | Creation timestamp                         |
| `updated_at`             | `timestamp with time zone` | Not Null          | `now()`         | Last update timestamp                      |
| `last_sync`              | `timestamp with time zone` |                   |                 | Last sync timestamp                        |

#### Constraints:

- **Primary Key:** `id`
- **Foreign Keys:**
  - `user_id` references `users(id)` on DELETE CASCADE
  - `provider_connection_id` references `user_provider_connections(id)` on DELETE SET NULL
- **Unique:** (`user_id`, `account_source_id`)

#### Indexes:

- Composite Index on `user_id`, `account_source_id`
- Index on `user_id`

#### Triggers:

- `set_updated_at` trigger on `UPDATE`

#### Policies:

- **RLS:** Enabled
  - `select_accounts`: Allows users to select their own accounts.
  - `update_accounts`: Allows users to update their own accounts.

---

### Table: `transactions`

- **Description:** Stores user financial transactions. This table is partitioned by date range (monthly partitions).

#### Columns:

| Column Name           | Data Type                  | Constraints       | Default         | Comment                                   |
|-----------------------|----------------------------|-------------------|-----------------|-------------------------------------------|
| `id`                  | `serial`                   | Primary Key       |                 | Auto-incrementing ID                      |
| `user_id`             | `uuid`                     | Not Null          |                 | References `users(id)`                    |
| `account_id`          | `integer`                  | Not Null          |                 | References `accounts(id)`                 |
| `transaction_source_id` | `text`                   | Not Null          |                 | ID from the data source                   |
| `transaction_source`  | `text`                     | Not Null          |                 | Source of the transaction data            |
| `amount`              | `numeric(15,2)`            | Not Null          |                 | Transaction amount                        |
| `transaction_date`    | `date`                     | Not Null          |                 | Transaction date                          |
| `transaction_type`    | `text`                     |                   |                 | Transaction type                          |
| `authorized_date`     | `date`                     |                   |                 | Authorization date if applicable          |
| `description`         | `text`                     | Not Null          |                 | Transaction description                   |
| `category`            | `text[]`                   |                   |                 | Transaction categories                    |
| `pending`             | `boolean`                  |                   | `false`         | Pending status                            |
| `is_manual`           | `boolean`                  |                   | `false`         | Manually added transaction indicator      |
| `metadata`            | `jsonb`                    |                   | `'{}'`          | Additional metadata                       |
| `is_duplicate`        | `boolean`                  | Not Null          | `false`         | Duplicate transaction indicator           |
| `created_at`          | `timestamp with time zone` | Not Null          | `now()`         | Creation timestamp                        |
| `updated_at`          | `timestamp with time zone` | Not Null          | `now()`         | Last update timestamp                     |
| `last_modified`       | `timestamp with time zone` | Not Null          | `now()`         | Last modification timestamp               |

#### Constraints:

- **Primary Key:** `id`
- **Foreign Keys:**
  - `user_id` references `users(id)` on DELETE CASCADE
  - `account_id` references `accounts(id)` on DELETE CASCADE

#### Partitioning:

- **Partitioned By:** `RANGE (transaction_date)`
- **Partition Creation Trigger:** `create_transactions_partition_trigger` automatically creates monthly partitions.

#### Indexes:

- Composite Index on `user_id`, `account_id`, `transaction_date`

#### Triggers:

- `set_updated_at` trigger on `UPDATE`
- `create_transactions_partition_trigger` on `INSERT` to manage partitions.

#### Policies:

- **RLS:** Enabled
  - `select_transactions`: Allows users to select their own transactions.
  - `update_transactions`: Allows users to update their own transactions.

---

## 6. Investments

### Table: `investments`

- **Description:** Stores user investment holdings.

#### Columns:

| Column Name         | Data Type                  | Constraints       | Default         | Comment                                    |
|---------------------|----------------------------|-------------------|-----------------|--------------------------------------------|
| `id`                | `serial`                   | Primary Key       |                 | Auto-incrementing ID                       |
| `user_id`           | `uuid`                     | Not Null          |                 | References `users(id)`                     |
| `holding_id`        | `text`                     | Not Null          |                 | Unique identifier for the holding          |
| `account_id`        | `integer`                  | Not Null          |                 | References `accounts(id)`                  |
| `security_id`       | `text`                     |                   |                 | Unique identifier for the security         |
| `security_name`     | `text`                     | Not Null          |                 | Name of the security                       |
| `security_type`     | `text`                     |                   |                 | Type of security                           |
| `ticker_symbol`     | `text`                     |                   |                 | Ticker symbol of the security              |
| `quantity`          | `numeric`                  | Not Null          |                 | Quantity of the security held              |
| `cost_basis`        | `numeric(15,2)`            |                   |                 | Total cost basis of the investment         |
| `current_market_value` | `numeric(15,2)`         | Not Null          |                 | Current market value of the investment     |
| `is_active`         | `boolean`                  | Not Null          | `true`          | Whether the investment is currently active |
| `created_at`        | `timestamp with time zone` | Not Null          | `now()`         | Creation timestamp                         |
| `updated_at`        | `timestamp with time zone` | Not Null          | `now()`         | Last update timestamp                      |

#### Constraints:

- **Primary Key:** `id`
- **Foreign Keys:**
  - `user_id` references `users(id)` on DELETE CASCADE
  - `account_id` references `accounts(id)` on DELETE CASCADE
- **Unique:** (`user_id`, `holding_id`)

#### Indexes:

- Index on `user_id`
- Index on `account_id`
- Composite Index on `user_id`, `account_id`

#### Triggers:

- `set_updated_at` trigger on `UPDATE`

#### Policies:

- **RLS:** Enabled
  - `select_investments`: Allows users to select their own investments.
  - `update_investments`: Allows users to update their own investments.

---

## 7. Widgets and Dashboards

### Table: `widgets`

- **Description:** Defines available widgets for dashboards.

#### Columns:

| Column Name       | Data Type                  | Constraints       | Default | Comment                                 |
|-------------------|----------------------------|-------------------|---------|-----------------------------------------|
| `id`              | `serial`                   | Primary Key       |         | Auto-incrementing ID                    |
| `name`            | `text`                     | Not Null          |         | Widget name                             |
| `description`     | `text`                     |                   |         | Widget description                      |
| `default_settings`| `jsonb`                    | Not Null          | `'{}'`  | Default settings for the widget         |
| `is_active`       | `boolean`                  | Not Null          | `true`  | Active status                           |
| `widget_type`     | `text`                     | Not Null          |         | Type of widget                          |
| `min_width`       | `integer`                  | Not Null          | `1`     | Minimum width in grid units             |
| `min_height`      | `integer`                  | Not Null          | `1`     | Minimum height in grid units            |
| `max_width`       | `integer`                  |                   |         | Maximum width in grid units             |
| `max_height`      | `integer`                  |                   |         | Maximum height in grid units            |
| `default_width`   | `integer`                  | Not Null          | `2`     | Default width in grid units             |
| `default_height`  | `integer`                  | Not Null          | `2`     | Default height in grid units            |
| `created_at`      | `timestamp with time zone` | Not Null          | `now()` | Creation timestamp                       |
| `updated_at`      | `timestamp with time zone` | Not Null          | `now()` | Last update timestamp                    |
| `last_modified`   | `timestamp with time zone` | Not Null          | `now()` | Last modification timestamp              |

#### Constraints:

- **Primary Key:** `id`

#### Triggers:

- `set_updated_at` trigger on `UPDATE`

#### Policies:

- **RLS:** Enabled
  - `select_widgets`: Allows all users to select widgets.

---

### Table: `user_widgets`

- **Description:** Stores user-specific widget configurations.

#### Columns:

| Column Name       | Data Type                  | Constraints       | Default | Comment                                 |
|-------------------|----------------------------|-------------------|---------|-----------------------------------------|
| `id`              | `serial`                   | Primary Key       |         | Auto-incrementing ID                    |
| `user_id`         | `uuid`                     | Not Null          |         | References `users(id)`                 |
| `widget_id`       | `integer`                  | Not Null          |         | References `widgets(id)`                |
| `settings`        | `jsonb`                    | Not Null          | `'{}'`  | Widget-specific settings                 |
| `position`        | `jsonb`                    | Not Null          | `'{}'`  | Widget position on the dashboard        |
| `created_at`      | `timestamp with time zone` | Not Null          | `now()` | Creation timestamp                       |
| `updated_at`      | `timestamp with time zone` | Not Null          | `now()` | Last update timestamp                    |
| `last_modified`   | `timestamp with time zone` | Not Null          | `now()` | Last modification timestamp              |

#### Constraints:

- **Primary Key:** `id`
- **Foreign Keys:**
# Database Schema Reference Guide

This guide provides a comprehensive overview of the database schema, including tables, columns, data types, relationships, constraints, indexes, triggers, and policies. It is designed to assist AI models like ChatGPT or Claude in understanding the database structure when editing files that interact with the database.

---

## Overview

The database schema is organized into the following key sections:

1. **Users and Authentication**
2. **Roles and Permissions**
3. **Payment Plans**
4. **Providers and Data Integration**
5. **Accounts and Transactions**
6. **Investments**
7. **Widgets and Dashboards**
8. **Journal Entries and AI Analysis**
9. **Security and Audit**

Each section contains detailed information about the tables, columns, constraints, relationships, and other relevant details.

---

## 1. Users and Authentication

### Table: `users`

- **Description:** Stores user profile information aligned with Firebase authentication.

#### Columns:

| Column Name       | Data Type                  | Constraints                            | Default                | Comment                      |
|-------------------|----------------------------|----------------------------------------|------------------------|------------------------------|
| `id`              | `uuid`                     | Primary Key                            | `gen_random_uuid()`    | Generated UUID               |
| `firebase_uid`    | `text`                     | Not Null, Unique                       |                        | Firebase unique identifier   |
| `email`           | `text`                     | Not Null, Unique                       |                        | User email address           |
| `display_name`    | `text`                     |                                        |                        | Display name                 |
| `photo_url`       | `text`                     |                                        |                        | Profile photo URL            |
| `bio`             | `text`                     |                                        |                        | User biography               |
| `is_email_verified` | `boolean`                |                                        | `false`                | Email verification status    |
| `phone_number`    | `text`                     |                                        |                        | Phone number                 |
| `date_of_birth`   | `date`                     |                                        |                        | Date of birth                |
| `country`         | `text`                     |                                        |                        | Country                      |
| `preferred_currency` | `text`                  |                                        | `'USD'`                | Preferred currency           |
| `created_at`      | `timestamp with time zone` | Not Null                               | `now()`                | Creation timestamp           |
| `updated_at`      | `timestamp with time zone` | Not Null                               | `now()`                | Last update timestamp        |
| `last_login`      | `timestamp with time zone` |                                        |                        | Last login timestamp         |

#### Constraints:

- **Primary Key:** `id`
- **Unique:** `firebase_uid`, `email`

#### Triggers:

- `set_updated_at` trigger updates `updated_at` on record updates.

#### Policies:

- **Row-Level Security (RLS):** Enabled
  - `select_user`: Allows users to select their own records.
  - `update_user`: Allows users to update their own records.

---

### Table: `user_settings`

- **Description:** Stores user-specific settings.

#### Columns:

| Column Name               | Data Type                  | Constraints       | Default        | Comment                                  |
|---------------------------|----------------------------|-------------------|----------------|------------------------------------------|
| `user_id`                 | `uuid`                     | Primary Key       |                | References `users(id)`                   |
| `theme`                   | `text`                     | Not Null          | `'default'`    | UI theme preference                      |
| `language`                | `text`                     | Not Null          | `'en'`         | Language preference                      |
| `notification_preferences`| `jsonb`                    | Not Null          | `'{}'`         | Notification settings in JSON format     |
| `customizations`          | `jsonb`                    | Not Null          | `'{}'`         | Custom UI settings in JSON format        |
| `timezone`                | `text`                     | Not Null          | `'UTC'`        | Timezone preference                      |
| `date_format`             | `text`                     | Not Null          | `'YYYY-MM-DD'` | Preferred date format                    |
| `time_format`             | `text`                     | Not Null          | `'HH:mm:ss'`   | Preferred time format                    |
| `currency_display`        | `text`                     | Not Null          | `'symbol'`     | Currency display preference              |
| `number_format`           | `text`                     | Not Null          | `'thousand_separated'` | Number formatting preference    |
| `created_at`              | `timestamp with time zone` | Not Null          | `now()`        | Creation timestamp                       |
| `updated_at`              | `timestamp with time zone` | Not Null          | `now()`        | Last update timestamp                    |
| `last_modified`           | `timestamp with time zone` | Not Null          | `now()`        | Last modification timestamp              |

#### Constraints:

- **Primary Key:** `user_id`
- **Foreign Key:** `user_id` references `users(id)`

#### Triggers:

- `set_updated_at` trigger updates `updated_at` and `last_modified` on record updates.

#### Policies:

- **Row-Level Security (RLS):** Enabled
  - `select_user_settings`: Allows users to select their own settings.
  - `update_user_settings`: Allows users to update their own settings.

---

## 2. Roles and Permissions

### Table: `roles`

- **Description:** Defines roles available in the system.

#### Columns:

| Column Name    | Data Type                  | Constraints | Default | Comment               |
|----------------|----------------------------|-------------|---------|-----------------------|
| `id`           | `serial`                   | Primary Key |         | Auto-incrementing ID  |
| `name`         | `text`                     | Not Null, Unique |     | Role name             |
| `description`  | `text`                     |             |         | Role description      |
| `created_at`   | `timestamp with time zone` | Not Null    | `now()` | Creation timestamp    |
| `updated_at`   | `timestamp with time zone` | Not Null    | `now()` | Last update timestamp |
| `last_modified`| `timestamp with time zone` | Not Null    | `now()` | Last modification     |

#### Constraints:

- **Primary Key:** `id`
- **Unique:** `name`

#### Triggers:

- `set_updated_at` trigger on `UPDATE`

#### Policies:

- **RLS:** Enabled
  - `select_roles`: Allows all users to select roles.

---

### Table: `permissions`

- **Description:** Defines permissions that can be assigned to roles.

#### Columns:

| Column Name    | Data Type                  | Constraints | Default | Comment                    |
|----------------|----------------------------|-------------|---------|----------------------------|
| `id`           | `serial`                   | Primary Key |         | Auto-incrementing ID       |
| `action`       | `text`                     | Not Null, Unique |     | Permission action identifier |
| `description`  | `text`                     |             |         | Permission description     |
| `created_at`   | `timestamp with time zone` | Not Null    | `now()` | Creation timestamp         |
| `updated_at`   | `timestamp with time zone` | Not Null    | `now()` | Last update timestamp      |
| `last_modified`| `timestamp with time zone` | Not Null    | `now()` | Last modification          |

#### Constraints:

- **Primary Key:** `id`
- **Unique:** `action`

#### Triggers:

- `set_updated_at` trigger on `UPDATE`

#### Policies:

- **RLS:** Enabled
  - `select_permissions`: Allows all users to select permissions.

---

### Table: `role_permissions`

- **Description:** Associates permissions with roles.

#### Columns:

| Column Name     | Data Type | Constraints | Comment                            |
|-----------------|-----------|-------------|------------------------------------|
| `role_id`       | `integer` | Primary Key | References `roles(id)`             |
| `permission_id` | `integer` | Primary Key | References `permissions(id)`       |

#### Constraints:

- **Primary Key:** (`role_id`, `permission_id`)
- **Foreign Keys:**
  - `role_id` references `roles(id)` on DELETE CASCADE
  - `permission_id` references `permissions(id)` on DELETE CASCADE

#### Policies:

- **RLS:** Enabled
  - `select_role_permissions`: Allows all users to select role-permission associations.

---

### Table: `user_roles`

- **Description:** Associates users with roles.

#### Columns:

| Column Name | Data Type | Constraints | Comment                    |
|-------------|-----------|-------------|----------------------------|
| `user_id`   | `uuid`    | Primary Key | References `users(id)`     |
| `role_id`   | `integer` | Primary Key | References `roles(id)`     |

#### Constraints:

- **Primary Key:** (`user_id`, `role_id`)
- **Foreign Keys:**
  - `user_id` references `users(id)` on DELETE CASCADE
  - `role_id` references `roles(id)` on DELETE CASCADE

#### Policies:

- **RLS:** Enabled
  - `select_user_roles`: Allows users to select their own roles.

---

## 3. Payment Plans

### Table: `payment_plans`

- **Description:** Defines available payment plans.

#### Columns:

| Column Name    | Data Type                  | Constraints | Default | Comment                       |
|----------------|----------------------------|-------------|---------|-------------------------------|
| `id`           | `serial`                   | Primary Key |         | Auto-incrementing ID          |
| `name`         | `text`                     | Not Null, Unique |     | Payment plan name             |
| `description`  | `text`                     |             |         | Payment plan description      |
| `price_cents`  | `integer`                  | Not Null    |         | Price in cents                |
| `features`     | `jsonb`                    | Not Null    | `'{}'`  | Features included in the plan |
| `is_active`    | `boolean`                  | Not Null    | `true`  | Active status                 |
| `created_at`   | `timestamp with time zone` | Not Null    | `now()` | Creation timestamp            |
| `updated_at`   | `timestamp with time zone` | Not Null    | `now()` | Last update timestamp         |
| `last_modified`| `timestamp with time zone` | Not Null    | `now()` | Last modification             |

#### Constraints:

- **Primary Key:** `id`
- **Unique:** `name`

#### Triggers:

- `set_updated_at` trigger on `UPDATE`

#### Policies:

- **RLS:** Enabled
  - `select_payment_plans`: Allows all users to select payment plans.

---

### Table: `user_payment_plans`

- **Description:** Associates users with payment plans.

#### Columns:

| Column Name            | Data Type                  | Constraints       | Default | Comment                             |
|------------------------|----------------------------|-------------------|---------|-------------------------------------|
| `user_id`              | `uuid`                     | Primary Key       |         | References `users(id)`              |
| `payment_plan_id`      | `integer`                  | Primary Key       |         | References `payment_plans(id)`      |
| `subscription_start`   | `timestamp with time zone` | Not Null          | `now()` | Subscription start date             |
| `subscription_end`     | `timestamp with time zone` |                   |         | Subscription end date               |
| `status`               | `text`                     | Not Null          | `'active'` | Subscription status               |
| `last_payment`         | `timestamp with time zone` |                   |         | Timestamp of last payment           |
| `payment_method`       | `text`                     |                   |         | Payment method used                 |
| `transaction_id`       | `text`                     |                   |         | Transaction identifier              |
| `auto_renew`           | `boolean`                  |                   | `true`  | Auto-renewal status                 |
| `next_billing_date`    | `timestamp with time zone` |                   |         | Next billing date                   |
| `cancellation_date`    | `timestamp with time zone` |                   |         | Cancellation date                   |
| `cancellation_reason`  | `text`                     |                   |         | Reason for cancellation             |
| `created_at`           | `timestamp with time zone` | Not Null          | `now()` | Creation timestamp                  |
| `updated_at`           | `timestamp with time zone` | Not Null          | `now()` | Last update timestamp               |

#### Constraints:

- **Primary Key:** (`user_id`, `payment_plan_id`)
- **Foreign Keys:**
  - `user_id` references `users(id)` on DELETE CASCADE
  - `payment_plan_id` references `payment_plans(id)` on DELETE CASCADE

#### Policies:

- Not specified, but should follow standard practices for user data.

---

## 4. Providers and Data Integration

### Table: `data_providers`

- **Description:** Defines external data providers.

#### Columns:

| Column Name          | Data Type                  | Constraints | Default | Comment                                |
|----------------------|----------------------------|-------------|---------|----------------------------------------|
| `id`                 | `serial`                   | Primary Key |         | Auto-incrementing ID                   |
| `name`               | `text`                     | Not Null, Unique |     | Provider name                          |
| `description`        | `text`                     |             |         | Provider description                   |
| `is_active`          | `boolean`                  | Not Null    | `true`  | Active status                          |
| `provider_type`      | `text`                     | Not Null    |         | Type of provider (e.g., API, Manual)   |
| `api_base_url`       | `text`                     |             |         | API base URL                           |
| `api_version`        | `text`                     |             |         | API version                            |
| `auth_method`        | `text`                     |             |         | Authentication method (e.g., OAuth)    |
| `required_credentials` | `jsonb`                  |             |         | Required credentials for authentication |
| `supported_account_types` | `jsonb`               |             |         | Supported account types                |
| `logo_url`           | `text`                     |             |         | Provider logo URL                      |
| `website`            | `text`                     |             |         | Provider website                       |
| `support_email`      | `text`                     |             |         | Support email address                  |
| `rate_limit`         | `integer`                  |             |         | API rate limit (requests per minute)   |
| `created_at`         | `timestamp with time zone` | Not Null    | `now()` | Creation timestamp                     |
| `updated_at`         | `timestamp with time zone` | Not Null    | `now()` | Last update timestamp                  |
| `last_modified`      | `timestamp with time zone` | Not Null    | `now()` | Last modification                      |

#### Constraints:

- **Primary Key:** `id`
- **Unique:** `name`

#### Triggers:

- `set_updated_at` trigger on `UPDATE`

#### Policies:

- **RLS:** Enabled
  - `select_data_providers`: Allows all users to select data providers.

---

### Table: `user_provider_connections`

- **Description:** Stores user connections to data providers.

#### Columns:

| Column Name          | Data Type                  | Constraints       | Default | Comment                                  |
|----------------------|----------------------------|-------------------|---------|------------------------------------------|
| `id`                 | `serial`                   | Primary Key       |         | Auto-incrementing ID                     |
| `user_id`            | `uuid`                     | Not Null          |         | References `users(id)`                   |
| `provider_id`        | `integer`                  | Not Null          |         | References `data_providers(id)`          |
| `connection_status`  | `text`                     | Not Null          | `'active'` | Connection status                      |
| `last_sync`          | `timestamp with time zone` |                   |         | Timestamp of last sync                   |
| `settings`           | `jsonb`                    | Not Null          | `'{}'`  | Provider-specific settings               |
| `institution_id`     | `text`                     |                   |         | Financial institution identifier         |
| `created_at`         | `timestamp with time zone` | Not Null          | `now()` | Creation timestamp                       |
| `updated_at`         | `timestamp with time zone` | Not Null          | `now()` | Last update timestamp                    |

#### Constraints:

- **Primary Key:** `id`
- **Foreign Keys:**
  - `user_id` references `users(id)` on DELETE CASCADE
  - `provider_id` references `data_providers(id)` on DELETE CASCADE

#### Policies:

- **RLS:** Enabled
  - `select_user_provider_connections`: Allows users to select their own connections.

---

## 5. Accounts and Transactions

### Table: `accounts`

- **Description:** Stores user accounts and their associated data.

#### Columns:

| Column Name          | Data Type                  | Constraints       | Default | Comment                                  |
|----------------------|----------------------------|-------------------|---------|------------------------------------------|
| `id`                 | `serial`                   | Primary Key       |         | Auto-incrementing ID                     |
| `user_id`            | `uuid`                     | Not Null          |         | References `users(id)`                   |
| `provider_id`        | `integer`                  | Not Null          |         | References `data_providers(id)`          |
| `account_type`       | `text`                     | Not Null          |         | Type of account (e.g., checking, savings) |
| `account_name`       | `text`                     | Not Null          |         | Account name                             |
| `account_number`     | `text`                     |                   |         | Account number                           |
| `balance`            | `numeric`                  | Not Null          | `0`     | Account balance                          |
| `currency`           | `text`                     | Not Null          |         | Account currency                         |
| `institution_name`   | `text`                     |                   |         | Financial institution name               |
| `institution_id`     | `text`                     |                   |         | Financial institution identifier         |
| `is_active`          | `boolean`                  | Not Null          | `true`  | Active status                            |
| `created_at`         | `timestamp with time zone` | Not Null          | `now()` | Creation timestamp                       |
| `updated_at`         | `timestamp with time zone` | Not Null          | `now()` | Last update timestamp                    |

#### Constraints:

- **Primary Key:** `id`
- **Foreign Keys:**
  - `user_id` references `users(id)` on DELETE CASCADE
  - `provider_id` references `data_providers(id)` on DELETE CASCADE

#### Policies:

- **RLS:** Enabled
  - `select_accounts`: Allows users to select their own accounts.

---

### Table: `transactions`

- **Description:** Stores user transactions and their associated data.

#### Columns:

| Column Name          | Data Type                  | Constraints       | Default | Comment                                  |
|----------------------|----------------------------|-------------------|---------|------------------------------------------|
| `id`                 | `serial`                   | Primary Key       |         | Auto-incrementing ID                     |
| `user_id`            | `uuid`                     | Not Null          |         | References `users(id)`                   |
| `account_id`          | `integer`                  | Not Null          |         | References `accounts(id)`                |
| `transaction_type`   | `text`                     | Not Null          |         | Type of transaction (e.g., debit, credit) |
| `transaction_date`   | `timestamp with time zone` | Not Null          |         | Transaction date and time                 |
| `description`        | `text`                     |                   |         | Transaction description                  |
| `amount`             | `numeric`                  | Not Null          |         | Transaction amount                       |
| `currency`           | `text`                     | Not Null          |         | Transaction currency                     |
| `category`           | `text`                     |                   |         | Transaction category                     |
| `is_recurring`       | `boolean`                  | Not Null          | `false` | Recurring transaction status             |
| `recurring_interval` | `text`                     |                   |         | Recurring interval (e.g., monthly, weekly) |
| `is_pending`         | `boolean`                  | Not Null          | `false` | Pending transaction status               |
| `is_transfer`        | `boolean`                  | Not Null          | `false` | Transfer transaction status              |
| `transfer_account_id` | `integer`                  |                   |         | References `accounts(id)` for transfers  |
| `created_at`         | `timestamp with time zone` | Not Null          | `now()` | Creation timestamp                       |
| `updated_at`         | `timestamp with time zone` | Not Null          | `now()` | Last update timestamp                    |

#### Constraints:

- **Primary Key:** `id`
- **Foreign Keys:**
  - `user_id` references `users(id)` on DELETE CASCADE
  - `account_id` references `accounts(id)` on DELETE CASCADE
  - `transfer_account_id` references `accounts(id)` on DELETE CASCADE

#### Policies:

- **RLS:** Enabled
  - `select_transactions`: Allows users to select their own transactions.

---

## 6. Investments

### Table: `investment_accounts`

- **Description:** Stores user investment accounts and their associated data.

#### Columns:

| Column Name          | Data Type                  | Constraints       | Default | Comment                                  |
|----------------------|----------------------------|-------------------|---------|------------------------------------------|
| `id`                 | `serial`                   | Primary Key       |         | Auto-incrementing ID                     |
| `user_id`            | `uuid`                     | Not Null          |         | References `users(id)`                   |
| `provider_id`        | `integer`                  | Not Null          |         | References `data_providers(id)`          |
| `account_type`       | `text`                     | Not Null          |         | Type of investment account (e.g., brokerage, retirement) |
| `account_name`       | `text`                     | Not Null          |         | Account name                             |
| `account_number`     | `text`                     |                   |         | Account number                           |
| `balance`            | `numeric`                  | Not Null          | `0`     | Account balance                          |
| `currency`           | `text`                     | Not Null          |         | Account currency                         |
| `institution_name`   | `text`                     |                   |         | Financial institution name               |
| `institution_id`     | `text`                     |                   |         | Financial institution identifier         |
| `is_active`          | `boolean`                  | Not Null          | `true`  | Active status                            |
| `created_at`         | `timestamp with time zone` | Not Null          | `now()` | Creation timestamp                       |
| `updated_at`         | `timestamp with time zone` | Not Null          | `now()` | Last update timestamp                    |

#### Constraints:

- **Primary Key:** `id`
- **Foreign Keys:**
  - `user_id` references `users(id)` on DELETE CASCADE
  - `provider_id` references `data_providers(id)` on DELETE CASCADE

#### Policies:

- **RLS:** Enabled
  - `select_investment_accounts`: Allows users to select their own investment accounts.

---

### Table: `investment_transactions`

- **Description:** Stores user investment transactions and their associated data.

#### Columns:

| Column Name          | Data Type                  | Constraints       | Default | Comment                                  |
|----------------------|----------------------------|-------------------|---------|------------------------------------------|
| `id`                 | `serial`                   | Primary Key       |         | Auto-incrementing ID                     |
| `user_id`            | `uuid`                     | Not Null          |         | References `users(id)`                   |
| `account_id`          | `integer`                  | Not Null          |         | References `investment_accounts(id)`      |
| `transaction_type`   | `text`                     | Not Null          |         | Type of transaction (e.g., buy, sell)     |
| `transaction_date`   | `timestamp with time zone` | Not Null          |         | Transaction date and time                 |
| `description`        | `text`                     |                   |         | Transaction description                  |
| `amount`             | `numeric`                  | Not Null          |         | Transaction amount                       |
| `currency`           | `text`                     | Not Null          |         | Transaction currency                     |
| `security_type`      | `text`                     | Not Null          |         | Type of security (e.g., stock, bond)     |
| `security_symbol`    | `text`                     | Not Null          |         | Security symbol                          |
| `quantity`           | `numeric`                  | Not Null          |         | Transaction quantity                    |
| `price_per_unit`     | `numeric`                  | Not Null          |         | Price per unit                           |
| `fees`               | `numeric`                  | Not Null          | `0`     | Transaction fees                        |
| `is_recurring`       | `boolean`                  | Not Null          | `false` | Recurring transaction status             |
| `recurring_interval` | `text`                     |                   |         | Recurring interval (e.g., monthly, weekly) |
| `is_pending`         | `boolean`                  | Not Null          | `false` | Pending transaction status               |
| `is_transfer`        | `boolean`                  | Not Null          | `false` | Transfer transaction status              |
| `transfer_account_id` | `integer`                  |                   |         | References `investment_accounts(id)` for transfers  |
| `created_at`         | `timestamp with time zone` | Not Null          | `now()` | Creation timestamp                       |
| `updated_at`         | `timestamp with time zone` | Not Null          | `now()` | Last update timestamp                    |

#### Constraints:

- **Primary Key:** `id`
- **Foreign Keys:**
  - `user_id` references `users(id)` on DELETE CASCADE
  - `account_id` references `investment_accounts(id)` on DELETE CASCADE
  - `transfer_account_id` references `investment_accounts(id)` on DELETE CASCADE

#### Policies:

- **RLS:** Enabled
  - `select_investment_transactions`: Allows users to select their own investment transactions.

---

## 7. Widgets and Dashboards

### Table: `widgets`

- **Description:** Defines available widgets for user dashboards.

#### Columns:

| Column Name    | Data Type                  | Constraints | Default | Comment                       |
|----------------|----------------------------|-------------|---------|-------------------------------|
| `id`           | `serial`                   | Primary Key |         | Auto-incrementing ID          |
| `name`         | `text`                     | Not Null, Unique |     | Widget name                     |
| `description`  | `text`                     |             |         | Widget description              |
| `widget_type`  | `text`                     | Not Null    |         | Type of widget (e.g., chart, table) |
| `is_active`    | `boolean`                  | Not Null    | `true`  | Active status                 |
| `created_at`   | `timestamp with time zone` | Not Null    | `now()` | Creation timestamp            |
| `updated_at`   | `timestamp with time zone` | Not Null    | `now()` | Last update timestamp         |
| `last_modified`| `timestamp with time zone` | Not Null    | `now()` | Last modification             |

#### Constraints:

- **Primary Key:** `id`
- **Unique:** `name`

#### Triggers:

- `set_updated_at` trigger on `UPDATE`

#### Policies:

- **RLS:** Enabled
  - `select_widgets`: Allows all users to select widgets.

---

### Table: `user_widgets`

- **Description:** Associates users with widgets on their dashboards.

#### Columns:

| Column Name            | Data Type                  | Constraints       | Default | Comment                             |
|------------------------|----------------------------|-------------------|---------|-------------------------------------|
| `user_id`              | `uuid`                     | Primary Key       |         | References `users(id)`              |
| `widget_id`            | `integer`                  | Primary Key       |         | References `widgets(id)`             |
| `dashboard_id`         | `integer`                  | Not Null          |         | References `user_dashboards(id)`     |
| `position`             | `integer`                  | Not Null          | `0`     | Widget position on the dashboard    |
| `settings`             | `jsonb`                    | Not Null          | `'{}'`  | Widget-specific settings             |
| `created_at`           | `timestamp with time zone` | Not Null          | `now()` | Creation timestamp                  |
| `updated_at`           | `timestamp with time zone` | Not Null          | `now()` | Last update timestamp               |

#### Constraints:

- **Primary Key:** (`user_id`, `widget_id`, `dashboard_id`)
- **Foreign Keys:**
  - `user_id` references `users(id)` on DELETE CASCADE
  - `widget_id` references `widgets(id)` on DELETE CASCADE
  - `dashboard_id` references `user_dashboards(id)` on DELETE CASCADE

#### Policies:

- **RLS:** Enabled
  - `select_user_widgets`: Allows users to select their own widgets.

---

### Table: `user_dashboards`

- **Description:** Stores user-created dashboards and their associated data.

#### Columns:

| Column Name          | Data Type                  | Constraints       | Default | Comment                                  |
|----------------------|----------------------------|-------------------|---------|------------------------------------------|
| `id`                 | `serial`                   | Primary Key       |         | Auto-incrementing ID                     |
| `user_id`            | `uuid`                     | Not Null          |         | References `users(id)`                   |
| `dashboard_name`     | `text`                     | Not Null          |         | Dashboard name                            |
| `description`        | `text`                     |                   |         | Dashboard description                     |
| `is_default`         | `boolean`                  | Not Null          | `false` | Default dashboard status                 |
| `is_shared`           | `boolean`                  | Not Null          | `false` | Shared dashboard status                  |
| `shared_with_users`  | `uuid[]`                   |                   | `'{}'`  | Array of user IDs the dashboard is shared with |
| `created_at`         | `timestamp with time zone` | Not Null          | `now()` | Creation timestamp                       |
| `updated_at`         | `timestamp with time zone` | Not Null          | `now()` | Last update timestamp                    |

#### Constraints:

- **Primary Key:** `id`
- **Foreign Keys:**
  - `user_id` references `users(id)` on DELETE CASCADE

#### Policies:

- **RLS:** Enabled
  - `select_user_dashboards`: Allows users to select their own dashboards.

---

## 8. Journal Entries and AI Analysis

### Table: `journal_entries`

- **Description:** Stores user journal entries for AI analysis.

#### Columns:

| Column Name          | Data Type                  | Constraints       | Default | Comment                                  |
|----------------------|----------------------------|-------------------|---------|------------------------------------------|
| `id`                 | `serial`                   | Primary Key       |         | Auto-incrementing ID                     |
| `user_id`            | `uuid`                     | Not Null          |         | References `users(id)`                   |
| `entry_type`         | `text`                     | Not Null          |         | Type of journal entry (e.g., thought, emotion) |
| `entry_date`         | `timestamp with time zone` | Not Null          |         | Entry date and time                      |
| `content`            | `text`                     | Not Null          |         | Journal entry content                    |
| `mood`               | `text`                     |                   |         | Mood associated with the entry           |
| `tags`               | `text[]`                   |                   | `'{}'`  | Array of tags associated with the entry   |
| `is_private`         | `boolean`                  | Not Null          | `false` | Private entry status                      |
| `is_analyzed`        | `boolean`                  | Not Null          | `false` | Analysis status                           |
| `analysis_results`   | `jsonb`                    | Not Null          | `'{}'`  | Analysis results in JSON format           |
| `created_at`         | `timestamp with time zone` | Not Null          | `now()` | Creation timestamp                       |
| `updated_at`         | `timestamp with time zone` | Not Null          | `now()` | Last update timestamp                    |

#### Constraints:

- **Primary Key:** `id`
- **Foreign Keys:**
  - `user_id` references `users(id)` on DELETE CASCADE

#### Policies:

- **RLS:** Enabled
  - `select_journal_entries`: Allows users to select their own journal entries.

---

## 9. Security and Audit

### Table: `security_events`

- **Description:** Stores security events for audit purposes.

#### Columns:

| Column Name          | Data Type                  | Constraints       | Default | Comment                                  |
|----------------------|----------------------------|-------------------|---------|------------------------------------------|
# Database Schema Reference Guide

This guide provides a comprehensive overview of the database schema, including tables, columns, data types, relationships, constraints, indexes, triggers, and policies. It is designed to assist AI models like ChatGPT or Claude in understanding the database structure when editing files that interact with the database.

---

## Overview

The database schema is organized into the following key sections:

1. **Users and Authentication**
2. **Roles and Permissions**
3. **Payment Plans**
4. **Providers and Data Integration**
5. **Accounts and Transactions**
6. **Widgets and Dashboards**
7. **Journal Entries and AI Analysis**
8. **Security and Audit**
9. **Provider Tokens**

Each section contains detailed information about the tables, columns, constraints, relationships, and other relevant details.

---

## 1. Users and Authentication

### Table: `users`

- **Description:** Stores user profile information aligned with Firebase authentication.

#### Columns:

| Column Name       | Data Type                  | Constraints                            | Default                | Comment                      |
|-------------------|----------------------------|----------------------------------------|------------------------|------------------------------|
| `id`              | `uuid`                     | Primary Key                            | `gen_random_uuid()`    | Generated UUID               |
| `firebase_uid`    | `text`                     | Not Null, Unique                       |                        | Firebase unique identifier   |
| `email`           | `text`                     | Not Null, Unique                       |                        | User email address           |
| `display_name`    | `text`                     |                                        |                        | Display name                 |
| `photo_url`       | `text`                     |                                        |                        | Profile photo URL            |
| `bio`             | `text`                     |                                        |                        | User biography               |
| `is_email_verified` | `boolean`                |                                        | `false`                | Email verification status    |
| `phone_number`    | `text`                     |                                        |                        | Phone number                 |
| `date_of_birth`   | `date`                     |                                        |                        | Date of birth                |
| `country`         | `text`                     |                                        |                        | Country                      |
| `preferred_currency` | `text`                  |                                        | `'USD'`                | Preferred currency           |
| `created_at`      | `timestamp with time zone` | Not Null                               | `now()`                | Creation timestamp           |
| `updated_at`      | `timestamp with time zone` | Not Null                               | `now()`                | Last update timestamp        |
| `last_login`      | `timestamp with time zone` |                                        |                        | Last login timestamp         |

#### Constraints:

- **Primary Key:** `id`
- **Unique:** `firebase_uid`, `email`

#### Triggers:

- `set_updated_at` trigger updates `updated_at` and `last_modified` on record updates.

#### Policies:

- **Row-Level Security (RLS):** Enabled
  - `select_user`: Allows users to select their own records.
  - `update_user`: Allows users to update their own records.

---

### Table: `user_settings`

- **Description:** Stores user-specific settings.

#### Columns:

| Column Name               | Data Type                  | Constraints       | Default        | Comment                                  |
|---------------------------|----------------------------|-------------------|----------------|------------------------------------------|
| `user_id`                 | `uuid`                     | Primary Key       |                | References `users(id)`                   |
| `theme`                   | `text`                     | Not Null          | `'default'`    | UI theme preference                      |
| `language`                | `text`                     | Not Null          | `'en'`         | Language preference                      |
| `notification_preferences`| `jsonb`                    | Not Null          | `'{}'`         | Notification settings in JSON format     |
| `customizations`          | `jsonb`                    | Not Null          | `'{}'`         | Custom UI settings in JSON format        |
| `timezone`                | `text`                     | Not Null          | `'UTC'`        | Timezone preference                      |
| `date_format`             | `text`                     | Not Null          | `'YYYY-MM-DD'` | Preferred date format                    |
| `time_format`             | `text`                     | Not Null          | `'HH:mm:ss'`   | Preferred time format                    |
| `currency_display`        | `text`                     | Not Null          | `'symbol'`     | Currency display preference              |
| `number_format`           | `text`                     | Not Null          | `'thousand_separated'` | Number formatting preference    |
| `created_at`              | `timestamp with time zone` | Not Null          | `now()`        | Creation timestamp                       |
| `updated_at`              | `timestamp with time zone` | Not Null          | `now()`        | Last update timestamp                    |
| `last_modified`           | `timestamp with time zone` | Not Null          | `now()`        | Last modification timestamp              |

#### Constraints:

- **Primary Key:** `user_id`
- **Foreign Key:** `user_id` references `users(id)`

#### Triggers:

- `set_updated_at` trigger updates `updated_at` and `last_modified` on record updates.

#### Policies:

- **Row-Level Security (RLS):** Enabled
  - `select_user_settings`: Allows users to select their own settings.
  - `update_user_settings`: Allows users to update their own settings.

---

## 2. Roles and Permissions

### Table: `roles`

- **Description:** Defines roles available in the system.

#### Columns:

| Column Name    | Data Type                  | Constraints | Default | Comment               |
|----------------|----------------------------|-------------|---------|-----------------------|
| `id`           | `serial`                   | Primary Key |         | Auto-incrementing ID  |
| `name`         | `text`                     | Not Null, Unique |     | Role name             |
| `description`  | `text`                     |             |         | Role description      |
| `created_at`   | `timestamp with time zone` | Not Null    | `now()` | Creation timestamp    |
| `updated_at`   | `timestamp with time zone` | Not Null    | `now()` | Last update timestamp |
| `last_modified`| `timestamp with time zone` | Not Null    | `now()` | Last modification     |

#### Constraints:

- **Primary Key:** `id`
- **Unique:** `name`

#### Triggers:

- `set_updated_at` trigger on `UPDATE`

#### Policies:

- **RLS:** Enabled
  - `select_roles`: Allows all users to select roles.

---

### Table: `permissions`

- **Description:** Defines permissions that can be assigned to roles.

#### Columns:

| Column Name    | Data Type                  | Constraints | Default | Comment                    |
|----------------|----------------------------|-------------|---------|----------------------------|
| `id`           | `serial`                   | Primary Key |         | Auto-incrementing ID       |
| `action`       | `text`                     | Not Null, Unique |     | Permission action identifier |
| `description`  | `text`                     |             |         | Permission description     |
| `created_at`   | `timestamp with time zone` | Not Null    | `now()` | Creation timestamp         |
| `updated_at`   | `timestamp with time zone` | Not Null    | `now()` | Last update timestamp      |
| `last_modified`| `timestamp with time zone` | Not Null    | `now()` | Last modification          |

#### Constraints:

- **Primary Key:** `id`
- **Unique:** `action`

#### Triggers:

- `set_updated_at` trigger on `UPDATE`

#### Policies:

- **RLS:** Enabled
  - `select_permissions`: Allows all users to select permissions.

---

### Table: `role_permissions`

- **Description:** Associates permissions with roles.

#### Columns:

| Column Name     | Data Type | Constraints | Comment                            |
|-----------------|-----------|-------------|------------------------------------|
| `role_id`       | `integer` | Primary Key | References `roles(id)`             |
| `permission_id` | `integer` | Primary Key | References `permissions(id)`       |

#### Constraints:

- **Primary Key:** (`role_id`, `permission_id`)
- **Foreign Keys:**
  - `role_id` references `roles(id)` on DELETE CASCADE
  - `permission_id` references `permissions(id)` on DELETE CASCADE

#### Policies:

- **RLS:** Enabled
  - `select_role_permissions`: Allows all users to select role-permission associations.

---

### Table: `user_roles`

- **Description:** Associates users with roles.

#### Columns:

| Column Name | Data Type | Constraints | Comment                    |
|-------------|-----------|-------------|----------------------------|
| `user_id`   | `uuid`    | Primary Key | References `users(id)`     |
| `role_id`   | `integer` | Primary Key | References `roles(id)`     |

#### Constraints:

- **Primary Key:** (`user_id`, `role_id`)
- **Foreign Keys:**
  - `user_id` references `users(id)` on DELETE CASCADE
  - `role_id` references `roles(id)` on DELETE CASCADE

#### Policies:

- **RLS:** Enabled
  - `select_user_roles`: Allows users to select their own roles.

---

## 3. Payment Plans

### Table: `payment_plans`

- **Description:** Defines available payment plans.

#### Columns:

| Column Name    | Data Type                  | Constraints | Default | Comment                       |
|----------------|----------------------------|-------------|---------|-------------------------------|
| `id`           | `serial`                   | Primary Key |         | Auto-incrementing ID          |
| `name`         | `text`                     | Not Null, Unique |     | Payment plan name             |
| `description`  | `text`                     |             |         | Payment plan description      |
| `price_cents`  | `integer`                  | Not Null    |         | Price in cents                |
| `features`     | `jsonb`                    | Not Null    | `'{}'`  | Features included in the plan |
| `is_active`    | `boolean`                  | Not Null    | `true`  | Active status                 |
| `created_at`   | `timestamp with time zone` | Not Null    | `now()` | Creation timestamp            |
| `updated_at`   | `timestamp with time zone` | Not Null    | `now()` | Last update timestamp         |
| `last_modified`| `timestamp with time zone` | Not Null    | `now()` | Last modification             |

#### Constraints:

- **Primary Key:** `id`
- **Unique:** `name`

#### Triggers:

- `set_updated_at` trigger on `UPDATE`

#### Policies:

- **RLS:** Enabled
  - `select_payment_plans`: Allows all users to select payment plans.

---

### Table: `user_payment_plans`

- **Description:** Associates users with payment plans.

#### Columns:

| Column Name            | Data Type                  | Constraints       | Default | Comment                             |
|------------------------|----------------------------|-------------------|---------|-------------------------------------|
| `user_id`              | `uuid`                     | Primary Key       |         | References `users(id)`              |
| `payment_plan_id`      | `integer`                  | Primary Key       |         | References `payment_plans(id)`      |
| `subscription_start`   | `timestamp with time zone` | Not Null          | `now()` | Subscription start date             |
| `subscription_end`     | `timestamp with time zone` |                   |         | Subscription end date               |
| `status`               | `text`                     | Not Null          | `'active'` | Subscription status               |
| `last_payment`         | `timestamp with time zone` |                   |         | Timestamp of last payment           |
| `payment_method`       | `text`                     |                   |         | Payment method used                 |
| `transaction_id`       | `text`                     |                   |         | Transaction identifier              |
| `auto_renew`           | `boolean`                  |                   | `true`  | Auto-renewal status                 |
| `next_billing_date`    | `timestamp with time zone` |                   |         | Next billing date                   |
| `cancellation_date`    | `timestamp with time zone` |                   |         | Cancellation date                   |
| `cancellation_reason`  | `text`                     |                   |         | Reason for cancellation             |
| `created_at`           | `timestamp with time zone` | Not Null          | `now()` | Creation timestamp                  |
| `updated_at`           | `timestamp with time zone` | Not Null          | `now()` | Last update timestamp               |

#### Constraints:

- **Primary Key:** (`user_id`, `payment_plan_id`)
- **Foreign Keys:**
  - `user_id` references `users(id)` on DELETE CASCADE
  - `payment_plan_id` references `payment_plans(id)` on DELETE CASCADE

#### Policies:

- Not specified, but should follow standard practices for user data.

---

## 4. Providers and Data Integration

### Table: `data_providers`

- **Description:** Defines external data providers.

#### Columns:

| Column Name          | Data Type                  | Constraints | Default | Comment                                |
|----------------------|----------------------------|-------------|---------|----------------------------------------|
| `id`                 | `serial`                   | Primary Key |         | Auto-incrementing ID                   |
| `name`               | `text`                     | Not Null, Unique |     | Provider name                          |
| `description`        | `text`                     |             |         | Provider description                   |
| `is_active`          | `boolean`                  | Not Null    | `true`  | Active status                          |
| `provider_type`      | `text`                     | Not Null    |         | Type of provider (e.g., API, Manual)   |
| `api_base_url`       | `text`                     |             |         | API base URL                           |
| `api_version`        | `text`                     |             |         | API version                            |
| `auth_method`        | `text`                     |             |         | Authentication method (e.g., OAuth)    |
| `required_credentials` | `jsonb`                  |             |         | Required credentials for authentication |
| `supported_account_types` | `jsonb`               |             |         | Supported account types                |
| `logo_url`           | `text`                     |             |         | Provider logo URL                      |
| `website`            | `text`                     |             |         | Provider website                       |
| `support_email`      | `text`                     |             |         | Support email address                  |
| `rate_limit`         | `integer`                  |             |         | API rate limit (requests per minute)   |
| `created_at`         | `timestamp with time zone` | Not Null    | `now()` | Creation timestamp                     |
| `updated_at`         | `timestamp with time zone` | Not Null    | `now()` | Last update timestamp                  |
| `last_modified      | `timestamp with time zone` | Not Null    | `now()` | Last modification                      |

#### Constraints:

- **Primary Key:** `id`
- **Unique:** `name`

#### Triggers:

- `set_updated_at` trigger on `UPDATE`

#### Policies:

- **RLS:** Enabled
  - `select_data_providers`: Allows all users to select data providers.

---

### Table: `user_provider_connections`

- **Description:** Stores user connections to data providers.

#### Columns:

| Column Name          | Data Type                  | Constraints       | Default | Comment                                  |
|----------------------|----------------------------|-------------------|---------|------------------------------------------|
| `id`                 | `serial`                   | Primary Key       |         | Auto-incrementing ID                     |
| `user_id`            | `uuid`                     | Not Null          |         | References `users(id)`                   |
| `provider_id`        | `integer`                  | Not Null          |         | References `data_providers(id)`          |
| `connection_status`  | `text`                     | Not Null          | `'active'` | Connection status                      |
| `last_sync`          | `timestamp with time zone` |                   |         | Timestamp of last sync                   |
| `settings`           | `jsonb`                    | Not Null          | `'{}'`  | Provider-specific settings               |
| `institution_id`     | `text`                     |                   |         | Financial institution identifier         |
| `item_id`            | `text`                     |                   |         | Provider item identifier                 |
| `error_code`         | `text`                     |                   |         | Error code if any                        |
| `error_message`      | `text`                     |                   |         | Detailed error message                   |
| `refresh_token`      | `text`                     |                   |         | Encrypted refresh token                  |
| `access_token_expiry`| `timestamp with time zone` |                   |         | Access token expiration                  |
| `last_successful_sync` | `timestamp with time zone` |                 |         | Last successful sync timestamp           |
| `sync_frequency`     | `interval`                 |                   |         | Data sync frequency                      |
| `created_at`         | `timestamp with time zone` | Not Null          | `now()` | Creation timestamp                       |
| `updated_at`         | `timestamp with time zone` | Not Null          | `now()` | Last update timestamp                    |
| `last_connection`    | `timestamp with time zone` |                   |         | Last connection attempt                  |

#### Constraints:

- **Foreign Keys:**
  - `user_id` references `users(id)` on DELETE CASCADE
  - `provider_id` references `data_providers(id)` on DELETE CASCADE

#### Indexes:

- Composite Index on `user_id`, `provider_id`

#### Triggers:

- `set_updated_at` trigger on `UPDATE`

#### Policies:

- **RLS:** Enabled
  - `select_user_provider_connections`: Allows users to select their own connections.
  - `update_user_provider_connections`: Allows users to update their own connections.

---

## 5. Accounts and Transactions

### Table: `accounts`

- **Description:** Stores user financial accounts.

#### Columns:

| Column Name              | Data Type                  | Constraints       | Default         | Comment                                    |
|--------------------------|----------------------------|-------------------|-----------------|--------------------------------------------|
| `id`                     | `serial`                   | Primary Key       |                 | Auto-incrementing ID                       |
| `user_id`                | `uuid`                     | Not Null          |                 | References `users(id)`                     |
| `provider_connection_id` | `integer`                  |                   |                 | References `user_provider_connections(id)` |
| `account_source_id`      | `text`                     | Not Null          |                 | ID from the data source                    |
| `account_source`         | `text`                     | Not Null          |                 | Source of the account data                 |
| `name`                   | `text`                     | Not Null          |                 | Account name                               |
| `official_name`          | `text`                     |                   |                 | Official account name                      |
| `type`                   | `text`                     |                   |                 | Account type                               |
| `subtype`                | `text`                     |                   |                 | Account subtype                            |
| `currency_code`          | `text`                     |                   | `'USD'`         | Currency code                              |
| `balance`                | `numeric(15,2)`            | Not Null          | `0`             | Current balance                            |
| `available_balance`      | `numeric(15,2)`            |                   |                 | Available balance                          |
| `credit_limit`           | `numeric(15,2)`            |                   |                 | Account credit limit if applicable         |
| `is_active`              | `boolean`                  | Not Null          | `true`          | Active status                              |
| `is_manual`              | `boolean`                  | Not Null          | `false`         | Manually added account indicator           |
| `institution_name`       | `text`                     |                   |                 | Financial institution name                 |
| `mask`                   | `text`                     |                   |                 | Account mask                               |
| `last_four`              | `text`                     |                   |                 | Last four digits of account                |
| `created_at`             | `timestamp with time zone` | Not Null          | `now()`         | Creation timestamp                         |
| `updated_at`             | `timestamp with time zone` | Not Null          | `now()`         | Last update timestamp                      |
| `last_sync`              | `timestamp with time zone` |                   |                 | Last sync timestamp                        |

#### Constraints:

- **Primary Key:** `id`
- **Foreign Keys:**
  - `user_id` references `users(id)` on DELETE CASCADE
  - `provider_connection_id` references `user_provider_connections(id)` on DELETE SET NULL

#### Indexes:

- Composite Index on `user_id`, `account_source_id`
- Index on `user_id`

#### Triggers:

- `set_updated_at` trigger on `UPDATE`

#### Policies:

- **RLS:** Enabled
  - `select_accounts`: Allows users to select their own accounts.
  - `update_accounts`: Allows users to update their own accounts.

---

### Table: `transactions`

- **Description:** Stores user financial transactions. This table is partitioned by date range (monthly partitions).

#### Columns:

| Column Name           | Data Type                  | Constraints       | Default         | Comment                                   |
|-----------------------|----------------------------|-------------------|-----------------|-------------------------------------------|
| `id`                  | `serial`                   | Primary Key       |                 | Auto-incrementing ID                      |
| `user_id`             | `uuid`                     | Not Null          |                 | References `users(id)`                    |
| `account_id`          | `integer`                  | Not Null          |                 | References `accounts(id)`                 |
| `transaction_source_id` | `text`                   | Not Null          |                 | ID from the data source                   |
| `transaction_source`  | `text`                     | Not Null          |                 | Source of the transaction data            |
| `amount`              | `numeric(15,2)`            | Not Null          |                 | Transaction amount                        |
| `transaction_date`    | `date`                     | Not Null          |                 | Transaction date                          |
| `transaction_type`    | `text`                     |                   |                 | Transaction type                          |
| `authorized_date`     | `date`                     |                   |                 | Authorization date if applicable          |
| `description`         | `text`                     | Not Null          |                 | Transaction description                   |
| `category`            | `text[]`                   |                   |                 | Transaction categories                    |
| `pending`             | `boolean`                  |                   | `false`         | Pending status                            |
| `is_manual`           | `boolean`                  |                   | `false`         | Manually added transaction indicator      |
| `metadata`            | `jsonb`                    |                   | `'{}'`          | Additional metadata                       |
| `is_duplicate`        | `boolean`                  | Not Null          | `false`         | Duplicate transaction indicator           |
| `created_at`          | `timestamp with time zone` | Not Null          | `now()`         | Creation timestamp                        |
| `updated_at`          | `timestamp with time zone` | Not Null          | `now()`         | Last update timestamp                     |
| `last_modified`       | `timestamp with time zone` | Not Null          | `now()`         | Last modification timestamp               |

#### Constraints:

- **Primary Key:** `id`
- **Foreign Keys:**
  - `user_id` references `users(id)` on DELETE CASCADE
  - `account_id` references `accounts(id)` on DELETE CASCADE

#### Partitioning:

- **Partitioned By:** `RANGE (transaction_date)`
- **Partition Creation Trigger:** `create_transactions_partition_trigger` automatically creates monthly partitions.

#### Indexes:

- Composite Index on `user_id`, `account_id`, `transaction_date`

#### Triggers:

- `set_updated_at` trigger on `UPDATE`
- `create_transactions_partition_trigger` on `INSERT` to manage partitions.

#### Policies:

- **RLS:** Enabled
  - `select_transactions`: Allows users to select their own transactions.
  - `update_transactions`: Allows users to update their own transactions.

---

## 6. Widgets and Dashboards

### Table: `widgets`

- **Description:** Defines available widgets for dashboards.

#### Columns:

| Column Name       | Data Type                  | Constraints       | Default | Comment                                 |
|-------------------|----------------------------|-------------------|---------|-----------------------------------------|
| `id`              | `serial`                   | Primary Key       |         | Auto-incrementing ID                    |
| `name`            | `text`                     | Not Null          |         | Widget name                             |
| `description`     | `text`                     |                   |         | Widget description                      |
| `default_settings`| `jsonb`                    | Not Null          | `'{}'`  | Default settings for the widget         |
| `is_active`       | `boolean`                  | Not Null          | `true`  | Active status                           |
| `widget_type`     | `text`                     | Not Null          |         | Type of widget                          |
| `min_width`       | `integer`                  | Not Null          | `1`     | Minimum width in grid units             |
| `min_height`      | `integer`                  | Not Null          | `1`     | Minimum height in grid units            |
| `max_width`       | `integer`                  |                   |         | Maximum width in grid units             |
| `max_height`      | `integer`                  |                   |         | Maximum height in grid units            |
| `default_width`   | `integer`                  | Not Null          | `2`     | Default width in grid units             |
| `default_height`  | `integer`                  | Not Null          | `2`     | Default height in grid units            |
| `resizable`       | `boolean`                  | Not Null          | `true`  | Resizable indicator                     |
| `draggable`       | `boolean`                  | Not Null          | `true`  | Draggable indicator                     |
| `static`          | `boolean`                  | Not Null          | `false` | Static widget indicator                 |
| `icon`            | `text`                     |                   |         | Widget icon                             |
| `created_at`      | `timestamp with time zone` | Not Null          | `now()` | Creation timestamp                      |
| `updated_at`      | `timestamp with time zone` | Not Null          | `now()` | Last update timestamp                   |
| `last_modified`   | `timestamp with time zone` | Not Null          | `now()` | Last modification timestamp             |

#### Constraints:

- **Primary Key:** `id`

#### Triggers:

- `set_updated_at` trigger on `UPDATE`

#### Policies:

- **RLS:** Enabled
  - `select_widgets`: Allows all users to select widgets.

---

### Table: `user_widgets`

- **Description:** Stores widgets added by users to their dashboards.

#### Columns:

| Column Name   | Data Type                  | Constraints       | Default | Comment                               |
|---------------|----------------------------|-------------------|---------|---------------------------------------|
| `id`          | `serial`                   | Primary Key       |         | Auto-incrementing ID                  |
| `user_id`     | `uuid`                     | Not Null          |         | References `users(id)`                |
| `widget_id`   | `integer`                  | Not Null          |         | References `widgets(id)`              |
| `settings`    | `jsonb`                    | Not Null          | `'{}'`  | User-specific widget settings         |
| `layout`      | `jsonb`                    | Not Null          | `'{}'`  | Layout information for the widget     |
| `is_active`   | `boolean`                  | Not Null          | `true`  | Active status                         |
| `created_at`  | `timestamp with time zone` | Not Null          | `now()` | Creation timestamp                    |
| `updated_at`  | `timestamp with time zone` | Not Null          | `now()` | Last update timestamp                 |
| `last_used`   | `timestamp with time zone` |                   |         | Last time the widget was used         |

#### Constraints:

- **Foreign Keys:**
  - `user_id` references `users(id)` on DELETE CASCADE
  - `widget_id` references `widgets(id)` on DELETE CASCADE

#### Indexes:

- Composite Index on `user_id`, `widget_id`

#### Triggers:

- `set_updated_at` trigger on `UPDATE`

#### Policies:

- **RLS:** Enabled
  - `select_user_widgets`: Allows users to select their own widgets.
  - `update_user_widgets`: Allows users to update their own widgets.

---

## 7. Journal Entries and AI Analysis

### Table: `journal_entries`

- **Description:** Stores user journal entries.

#### Columns:

| Column Name                | Data Type                  | Constraints       | Default    | Comment                                  |
|----------------------------|----------------------------|-------------------|------------|------------------------------------------|
| `id`                       | `serial`                   | Primary Key       |            | Auto-incrementing ID                     |
| `user_id`                  | `uuid`                     | Not Null          |            | References `users(id)`                   |
| `entry_comment`            | `text`                     | Not Null          |            | Content of the journal entry             |
| `is_ai_generated`          | `boolean`                  | Not Null          | `false`    | AI-generated indicator                   |
| `category`                 | `text`                     |                   |            | Entry category                           |
| `tags`                     | `text[]`                   |                   | `'{}'`     | Tags associated with the entry           |
| `time_frame_start`         | `date`                     |                   |            | Start date of the entry timeframe        |
| `time_frame_end`           | `date`                     |                   |            | End date of the entry timeframe          |
| `financial_performance_rating` | `integer`              |                   |            | User's rating of financial performance   |
| `sentiment`                | `text`                     |                   |            | Sentiment analysis result                |
| `metadata`                 | `jsonb`                    |                   | `'{}'`     | Additional metadata                      |
| `reading_time`             | `interval`                 |                   |            | Estimated reading time                   |
| `associated_goals`         | `text[]`                   |                   | `'{}'`     | Goals associated with the entry          |
| `mood`                     | `text`                     |                   |            | Mood during entry creation               |
| `location`                 | `point`                    |                   |            | Location coordinates                     |
| `attachments`              | `text[]`                   |                   | `'{}'`     | Attachments associated with the entry    |
| `is_private`               | `boolean`                  |                   | `true`     | Privacy status                           |
| `is_favorite`              | `boolean`                  |                   | `false`    | Favorite status                          |
| `last_edited_by`           | `uuid`                     |                   |            | References `users(id)`                   |
| `version`                  | `integer`                  |                   | `1`        | Version number for the entry             |
| `created_at`               | `timestamp with time zone` | Not Null          | `now()`    | Creation timestamp                       |
| `updated_at`               | `timestamp with time zone` | Not Null          | `now()`    | Last update timestamp                    |
| `last_modified`            | `timestamp with time zone` | Not Null          | `now()`    | Last modification timestamp              |

#### Constraints:

- **Foreign Keys:**
  - `user_id` references `users(id)` on DELETE CASCADE
  - `last_edited_by` references `users(id)`

#### Indexes:

- Composite Index on `user_id`, `time_frame_start`

#### Triggers:

- `set_updated_at` trigger on `UPDATE`

#### Policies:

- **RLS:** Enabled
  - `select_journal_entries`: Allows users to select their own entries.
  - `update_journal_entries`: Allows users to update their own entries.

---

### Table: `ai_analyses`

- **Description:** Stores AI analyses performed for users.

#### Columns:

| Column Name     | Data Type                  | Constraints       | Default      | Comment                             |
|-----------------|----------------------------|-------------------|--------------|-------------------------------------|
| `id`            | `serial`                   | Primary Key       |              | Auto-incrementing ID                |
| `user_id`       | `uuid`                     | Not Null          |              | References `users(id)`              |
| `analysis_type` | `text`                     | Not Null          |              | Type of AI analysis                 |
| `input_data`    | `jsonb`                    | Not Null          |              | Input data for analysis             |
| `output_data`   | `jsonb`                    | Not Null          |              | Result of the analysis              |
| `status`        | `text`                     | Not Null          | `'completed'` | Status of the analysis             |
| `error_message` | `text`                     |                   |              | Error message if any                |
| `created_at`    | `timestamp with time zone` | Not Null          | `now()`      | Creation timestamp                  |
| `updated_at`    | `timestamp with time zone` | Not Null          | `now()`      | Last update timestamp               |
| `last_modified` | `timestamp with time zone` | Not Null          | `now()`      | Last modification timestamp         |

#### Constraints:

- **Foreign Keys:**
  - `user_id` references `users(id)` on DELETE CASCADE

#### Indexes:

- Composite Index on `user_id`, `analysis_type`

#### Triggers:

- `set_updated_at` trigger on `UPDATE`

#### Policies:

- **RLS:** Enabled
  - `select_ai_analyses`: Allows users to select their own analyses.
  - `update_ai_analyses`: Allows users to update their own analyses.

---

## 8. Security and Audit

### Table: `audit_logs`

- **Description:** Stores audit logs for tracking changes and actions.

#### Columns:

| Column Name | Data Type                  | Constraints       | Default | Comment                               |
|-------------|----------------------------|-------------------|---------|---------------------------------------|
| `id`        | `serial`                   | Primary Key       |         | Auto-incrementing ID                  |
| `user_id`   | `uuid`                     |                   |         | References `users(id)`                |
| `action`    | `text`                     | Not Null          |         | Action performed                      |
| `table_name`| `text`                     |                   |         | Affected table                        |
| `record_id` | `bigint`                   |                   |         | Affected record ID                    |
| `changes`   | `jsonb`                    |                   |         | Changes made                          |
| `action_timestamp` | `timestamp with time zone` | Not Null          | `now()` | Timestamp of the action               |
| `ip_address`| `inet`                     |                   |         | IP address of the user                |
| `user_agent`| `text`                     |                   |         | User agent string                     |

#### Constraints:

- **Foreign Keys:**
  - `user_id` references `users(id)` on DELETE SET NULL

#### Indexes:

- Index on `user_id`
- Index on `action_timestamp`

---

## 9. Provider Tokens

### Table: `provider_tokens`

- **Description:** Stores tokens for provider authentication.

#### Columns:

| Column Name               | Data Type                  | Constraints       | Comment                            |
|---------------------------|----------------------------|-------------------|------------------------------------|
| `user_id`                 | `uuid`                     | Primary Key       | References `users(id)`             |
| `provider_id`             | `integer`                  | Primary Key       | References `data_providers(id)`    |
| `access_token_encrypted`  | `text`                     | Not Null          | Encrypted access token             |
| `refresh_token_encrypted` | `text`                     |                   | Encrypted refresh token            |
| `item_id`                 | `text`                     |                   | Unique identifier from the provider |
| `access_token_expires_at` | `timestamp with time zone` |                   | Access token expiration time       |
| `created_at`              | `timestamp with time zone` | Not Null          | Creation timestamp                 |
| `updated_at`              | `timestamp with time zone` | Not Null          | Last update timestamp              |
| `last_used`               | `timestamp with time zone` |                   | Last time the token was used       |

#### Constraints:

- **Primary Key:** (`user_id`, `provider_id`)
- **Foreign Keys:**
  - `user_id` references `users(id)` on DELETE CASCADE
  - `provider_id` references `data_providers(id)` on DELETE CASCADE

---

## Triggers and Functions

### Function: `set_updated_at`

- **Description:** Updates `updated_at` and `last_modified` timestamps before a record is updated.

#### Definition:

```sql
BEGIN
  NEW.updated_at = now();
  NEW.last_modified = now();
  RETURN NEW;
END;
```

#### Applied To Tables:

- `users`
- `user_settings`
- `roles`
- `permissions`
- `payment_plans`
- `data_providers`
- `user_provider_connections`
- `accounts`
- `transactions`
- `widgets`
- `user_widgets`
- `journal_entries`
- `ai_analyses`

### Function: `create_transactions_partition`

- **Description:** Automatically creates monthly partitions for the `transactions` table based on the `transaction_date` field.

#### Definition:

```sql
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
      'CREATE TABLE IF NOT EXISTS public.%I PARTITION OF transactions FOR VALUES FROM (%L) TO (%L)',
      partition_name,
      start_date,
      end_date
    );
  END IF;

  RETURN NEW;
END;