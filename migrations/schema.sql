create table pgmigrations
(
    id     serial
        primary key,
    name   varchar(255) not null,
    run_on timestamp    not null
);

alter table pgmigrations
    owner to postgres;

create table users
(
    id                 uuid                     default gen_random_uuid() not null
        primary key,
    firebase_uid       text                                               not null
        unique,
    email              text                                               not null
        unique,
    display_name       text,
    photo_url          text,
    bio                text,
    is_email_verified  boolean                  default false,
    phone_number       text,
    date_of_birth      date,
    country            text,
    preferred_currency text                     default 'USD'::text,
    created_at         timestamp with time zone default now()             not null,
    updated_at         timestamp with time zone default now()             not null
);

comment on table users is 'Users table storing user profile information';

comment on column users.id is 'Primary key, generated UUID';

comment on column users.firebase_uid is 'Unique identifier from Firebase';

comment on column users.email is 'User email address';

comment on column users.display_name is 'Display name of the user';

comment on column users.photo_url is 'URL to user profile photo';

comment on column users.bio is 'User biography';

comment on column users.is_email_verified is 'Email verification status';

comment on column users.phone_number is 'User phone number';

comment on column users.date_of_birth is 'User date of birth';

comment on column users.country is 'Country of the user';

comment on column users.preferred_currency is 'Preferred currency';

comment on column users.created_at is 'Creation timestamp';

comment on column users.updated_at is 'Last update timestamp';

alter table users
    owner to postgres;

create trigger set_updated_at
    before update
    on users
    for each row
execute procedure set_updated_at();

create trigger set_updated_at
    before update
    on users
    for each row
execute procedure ???();

create policy select_user on users
    as permissive
    for select
    using (id = (current_setting('app.current_user'::text))::uuid);

create policy update_user on users
    as permissive
    for update
    using (id = (current_setting('app.current_user'::text))::uuid);

create policy select_user on users
    as permissive
    for select
    using (id = (current_setting('app.current_user'::text))::uuid);

create policy update_user on users
    as permissive
    for update
    using (id = (current_setting('app.current_user'::text))::uuid);

create table user_settings
(
    user_id                  uuid                                                        not null
        primary key
        references users
            on delete cascade,
    theme                    text                     default 'default'::text            not null,
    language                 text                     default 'en'::text                 not null,
    notification_preferences jsonb                    default '{}'::jsonb                not null,
    customizations           jsonb                    default '{}'::jsonb                not null,
    timezone                 text                     default 'UTC'::text                not null,
    date_format              text                     default 'YYYY-MM-DD'::text         not null,
    time_format              text                     default 'HH:mm:ss'::text           not null,
    currency_display         text                     default 'symbol'::text             not null,
    number_format            text                     default 'thousand_separated'::text not null,
    created_at               timestamp with time zone default now()                      not null,
    updated_at               timestamp with time zone default now()                      not null,
    primary key ()
);

comment on table user_settings is 'Table storing user-specific settings';

comment on column user_settings.user_id is 'Foreign key to users table';

comment on column user_settings.theme is 'UI theme preference';

comment on column user_settings.language is 'Language preference';

comment on column user_settings.notification_preferences is 'Notification settings in JSON format';

comment on column user_settings.customizations is 'Custom UI settings in JSON format';

comment on column user_settings.timezone is 'Timezone preference';

comment on column user_settings.date_format is 'Preferred date format';

comment on column user_settings.time_format is 'Preferred time format';

comment on column user_settings.currency_display is 'Currency display preference';

comment on column user_settings.number_format is 'Number formatting preference';

comment on column user_settings.created_at is 'Creation timestamp';

comment on column user_settings.updated_at is 'Last update timestamp';

alter table user_settings
    owner to postgres;

create trigger set_updated_at
    before update
    on user_settings
    for each row
execute procedure set_updated_at();

create trigger set_updated_at
    before update
    on user_settings
    for each row
execute procedure ???();

create policy select_user_settings on user_settings
    as permissive
    for select
    using (user_id = (current_setting('app.current_user'::text))::uuid);

create policy update_user_settings on user_settings
    as permissive
    for update
    using (user_id = (current_setting('app.current_user'::text))::uuid);

create policy select_user_settings on user_settings
    as permissive
    for select
    using (user_id = (current_setting('app.current_user'::text))::uuid);

create policy update_user_settings on user_settings
    as permissive
    for update
    using (user_id = (current_setting('app.current_user'::text))::uuid);

create table roles
(
    id          serial
        primary key,
    name        text                                   not null
        unique,
    description text,
    created_at  timestamp with time zone default now() not null,
    updated_at  timestamp with time zone default now() not null
);

comment on table roles is 'Roles available in the system';

comment on column roles.name is 'Role name';

comment on column roles.description is 'Role description';

comment on column roles.created_at is 'Creation timestamp';

comment on column roles.updated_at is 'Last update timestamp';

alter table roles
    owner to postgres;

create trigger set_updated_at
    before update
    on roles
    for each row
execute procedure set_updated_at();

create policy select_roles on roles
    as permissive
    for select
    using true;

create table permissions
(
    id          serial
        primary key,
    action      text                                   not null
        unique,
    description text,
    created_at  timestamp with time zone default now() not null,
    updated_at  timestamp with time zone default now() not null
);

comment on table permissions is 'Permissions that can be assigned to roles';

comment on column permissions.action is 'Permission action identifier';

comment on column permissions.description is 'Permission description';

comment on column permissions.created_at is 'Creation timestamp';

comment on column permissions.updated_at is 'Last update timestamp';

alter table permissions
    owner to postgres;

create trigger set_updated_at
    before update
    on permissions
    for each row
execute procedure set_updated_at();

create policy select_permissions on permissions
    as permissive
    for select
    using true;

create table role_permissions
(
    role_id       integer not null
        references roles
            on delete cascade,
    permission_id integer not null
        references permissions
            on delete cascade,
    primary key (role_id, permission_id)
);

comment on table role_permissions is 'Associates permissions with roles';

comment on column role_permissions.role_id is 'Foreign key to roles table';

comment on column role_permissions.permission_id is 'Foreign key to permissions table';

alter table role_permissions
    owner to postgres;

create policy select_role_permissions on role_permissions
    as permissive
    for select
    using true;

create table user_roles
(
    user_id uuid    not null
        references users
            on delete cascade,
    role_id integer not null
        references roles
            on delete cascade,
    primary key (user_id, role_id)
);

comment on table user_roles is 'Associates users with roles';

comment on column user_roles.user_id is 'Foreign key to users table';

comment on column user_roles.role_id is 'Foreign key to roles table';

alter table user_roles
    owner to postgres;

create policy select_user_roles on user_roles
    as permissive
    for select
    using (user_id = (current_setting('app.current_user'::text))::uuid);

create table payment_plans
(
    id          serial
        primary key,
    name        text                                         not null
        unique,
    description text,
    price_cents integer                                      not null,
    features    jsonb                    default '{}'::jsonb not null,
    is_active   boolean                  default true        not null,
    created_at  timestamp with time zone default now()       not null,
    updated_at  timestamp with time zone default now()       not null
);

comment on table payment_plans is 'Available payment plans';

comment on column payment_plans.name is 'Payment plan name';

comment on column payment_plans.description is 'Payment plan description';

comment on column payment_plans.price_cents is 'Price in cents';

comment on column payment_plans.features is 'Features included in the plan';

comment on column payment_plans.is_active is 'Active status of the plan';

comment on column payment_plans.created_at is 'Creation timestamp';

comment on column payment_plans.updated_at is 'Last update timestamp';

alter table payment_plans
    owner to postgres;

create trigger set_updated_at
    before update
    on payment_plans
    for each row
execute procedure set_updated_at();

create policy select_payment_plans on payment_plans
    as permissive
    for select
    using true;

create table user_payment_plans
(
    user_id             uuid                                            not null
        references users
            on delete cascade,
    payment_plan_id     integer                                         not null
        references payment_plans
            on delete cascade,
    subscription_start  timestamp with time zone default now()          not null,
    subscription_end    timestamp with time zone,
    status              text                     default 'active'::text not null,
    last_payment        timestamp with time zone,
    payment_method      text,
    transaction_id      text,
    auto_renew          boolean                  default true,
    next_billing_date   timestamp with time zone,
    cancellation_date   timestamp with time zone,
    cancellation_reason text,
    created_at          timestamp with time zone default now()          not null,
    updated_at          timestamp with time zone default now()          not null,
    primary key (user_id, payment_plan_id)
);

comment on table user_payment_plans is 'Associates users with payment plans';

comment on column user_payment_plans.user_id is 'Foreign key to users table';

comment on column user_payment_plans.payment_plan_id is 'Foreign key to payment_plans table';

comment on column user_payment_plans.subscription_start is 'Subscription start date';

comment on column user_payment_plans.subscription_end is 'Subscription end date';

comment on column user_payment_plans.status is 'Subscription status';

comment on column user_payment_plans.last_payment is 'Timestamp of last payment';

comment on column user_payment_plans.payment_method is 'Payment method used';

comment on column user_payment_plans.transaction_id is 'Transaction identifier';

comment on column user_payment_plans.auto_renew is 'Auto-renewal status';

comment on column user_payment_plans.next_billing_date is 'Next billing date';

comment on column user_payment_plans.cancellation_date is 'Cancellation date';

comment on column user_payment_plans.cancellation_reason is 'Reason for cancellation';

comment on column user_payment_plans.created_at is 'Creation timestamp';

comment on column user_payment_plans.updated_at is 'Last update timestamp';

alter table user_payment_plans
    owner to postgres;

create table data_providers
(
    id                      serial
        primary key,
    name                    text                                   not null
        unique,
    description             text,
    is_active               boolean                  default true  not null,
    provider_type           text                                   not null,
    api_base_url            text,
    api_version             text,
    auth_method             text,
    required_credentials    jsonb,
    supported_account_types jsonb,
    logo_url                text,
    website                 text,
    support_email           text,
    rate_limit              integer,
    created_at              timestamp with time zone default now() not null,
    updated_at              timestamp with time zone default now() not null
);

comment on table data_providers is 'External data providers';

comment on column data_providers.name is 'Provider name';

comment on column data_providers.description is 'Provider description';

comment on column data_providers.is_active is 'Active status';

comment on column data_providers.provider_type is 'Type of provider (e.g., API, Manual)';

comment on column data_providers.api_base_url is 'API base URL';

comment on column data_providers.api_version is 'API version';

comment on column data_providers.auth_method is 'Authentication method (e.g., OAuth)';

comment on column data_providers.required_credentials is 'Required credentials for authentication';

comment on column data_providers.supported_account_types is 'Supported account types';

comment on column data_providers.logo_url is 'URL to provider logo';

comment on column data_providers.website is 'Provider website';

comment on column data_providers.support_email is 'Support email address';

comment on column data_providers.rate_limit is 'API rate limit (requests per minute)';

comment on column data_providers.created_at is 'Creation timestamp';

comment on column data_providers.updated_at is 'Last update timestamp';

alter table data_providers
    owner to postgres;

create trigger set_updated_at
    before update
    on data_providers
    for each row
execute procedure set_updated_at();

create policy select_data_providers on data_providers
    as permissive
    for select
    using true;

create table user_provider_connections
(
    id                   serial
        primary key,
    user_id              uuid
        references users
            on delete cascade,
    provider_id          integer
        references data_providers
            on delete cascade,
    connection_status    text                     default 'active'::text not null,
    settings             jsonb                    default '{}'::jsonb    not null,
    institution_id       text,
    item_id              text,
    error_code           text,
    error_message        text,
    refresh_token        text,
    access_token_expiry  timestamp with time zone,
    last_successful_sync timestamp with time zone,
    sync_frequency       interval,
    created_at           timestamp with time zone default now()          not null,
    updated_at           timestamp with time zone default now()          not null,
    sync_cursor          text
);

comment on table user_provider_connections is 'User connections to data providers';

comment on column user_provider_connections.user_id is 'Foreign key to users table';

comment on column user_provider_connections.provider_id is 'Foreign key to data_providers table';

comment on column user_provider_connections.connection_status is 'Connection status';

comment on column user_provider_connections.settings is 'Provider-specific settings';

comment on column user_provider_connections.institution_id is 'Financial institution identifier';

comment on column user_provider_connections.item_id is 'Provider item identifier';

comment on column user_provider_connections.error_code is 'Error code if any';

comment on column user_provider_connections.error_message is 'Detailed error message';

comment on column user_provider_connections.refresh_token is 'Encrypted refresh token';

comment on column user_provider_connections.access_token_expiry is 'Access token expiration';

comment on column user_provider_connections.last_successful_sync is 'Last successful sync timestamp';

comment on column user_provider_connections.sync_frequency is 'Data sync frequency';

comment on column user_provider_connections.created_at is 'Creation timestamp';

comment on column user_provider_connections.updated_at is 'Last update timestamp';

alter table user_provider_connections
    owner to postgres;

create index user_provider_connections_user_id_provider_id_index
    on user_provider_connections (user_id, provider_id);

create trigger set_updated_at
    before update
    on user_provider_connections
    for each row
execute procedure set_updated_at();

create policy select_user_provider_connections on user_provider_connections
    as permissive
    for select
    using (user_id = (current_setting('app.current_user'::text))::uuid);

create policy update_user_provider_connections on user_provider_connections
    as permissive
    for update
    using (user_id = (current_setting('app.current_user'::text))::uuid);

create table provider_tokens
(
    user_id                 uuid                                   not null
        references users
            on delete cascade,
    provider_id             integer                                not null
        references data_providers
            on delete cascade,
    access_token_encrypted  text                                   not null,
    refresh_token_encrypted text,
    item_id                 text,
    access_token_expires_at timestamp with time zone,
    created_at              timestamp with time zone default now() not null,
    updated_at              timestamp with time zone default now() not null,
    primary key (user_id, provider_id)
);

comment on table provider_tokens is 'Tokens for provider authentication';

comment on column provider_tokens.user_id is 'Foreign key to users table';

comment on column provider_tokens.provider_id is 'Foreign key to data_providers table';

comment on column provider_tokens.access_token_encrypted is 'Encrypted access token';

comment on column provider_tokens.refresh_token_encrypted is 'Encrypted refresh token';

comment on column provider_tokens.item_id is 'Unique identifier from the provider';

comment on column provider_tokens.access_token_expires_at is 'Access token expiration time';

comment on column provider_tokens.created_at is 'Creation timestamp';

comment on column provider_tokens.updated_at is 'Last update timestamp';

alter table provider_tokens
    owner to postgres;

create table accounts
(
    id                     serial
        primary key,
    user_id                uuid                                   not null
        references users
            on delete cascade,
    provider_connection_id integer
                                                                  references user_provider_connections
                                                                      on delete set null,
    account_source_id      text                                   not null,
    account_source         text                                   not null,
    name                   text                                   not null,
    official_name          text,
    type                   text,
    subtype                text,
    currency_code          text                     default 'USD'::text,
    balance                numeric(15, 2)           default 0     not null,
    available_balance      numeric(15, 2),
    credit_limit           numeric(15, 2),
    is_active              boolean                  default true  not null,
    is_manual              boolean                  default false not null,
    institution_name       text,
    mask                   text,
    last_four              text,
    created_at             timestamp with time zone default now() not null,
    updated_at             timestamp with time zone default now() not null,
    last_sync              timestamp with time zone,
    constraint unique_account_source
        unique (account_source_id, account_source),
    constraint unique_account_per_user_source
        unique (user_id, account_source_id, account_source)
);

comment on table accounts is 'User financial accounts';

comment on column accounts.user_id is 'Foreign key to users table';

comment on column accounts.provider_connection_id is 'Foreign key to user_provider_connections';

comment on column accounts.account_source_id is 'ID from the data source';

comment on column accounts.account_source is 'Source of the account data';

comment on column accounts.name is 'Account name';

comment on column accounts.official_name is 'Official account name';

comment on column accounts.type is 'Account type';

comment on column accounts.subtype is 'Account subtype';

comment on column accounts.currency_code is 'Currency code';

comment on column accounts.balance is 'Current balance';

comment on column accounts.available_balance is 'Available balance';

comment on column accounts.credit_limit is 'Account credit limit if applicable';

comment on column accounts.is_active is 'Active status of the account';

comment on column accounts.is_manual is 'Whether the account is manually added';

comment on column accounts.institution_name is 'Name of the financial institution';

comment on column accounts.mask is 'Account mask';

comment on column accounts.last_four is 'Last four digits of account';

comment on column accounts.created_at is 'Creation timestamp';

comment on column accounts.updated_at is 'Last update timestamp';

comment on column accounts.last_sync is 'Last sync timestamp';

alter table accounts
    owner to postgres;

create index accounts_user_id_account_source_id_index
    on accounts (user_id, account_source_id);

create index accounts_user_id_index
    on accounts (user_id);

create trigger set_updated_at
    before update
    on accounts
    for each row
execute procedure set_updated_at();

create policy select_accounts on accounts
    as permissive
    for select
    using (user_id = (current_setting('app.current_user'::text))::uuid);

create policy update_accounts on accounts
    as permissive
    for update
    using (user_id = (current_setting('app.current_user'::text))::uuid);

create table investments
(
    id                   serial
        primary key,
    user_id              uuid                                   not null
        references users
            on delete cascade,
    holding_id           text                                   not null,
    account_id           integer                                not null
        references accounts
            on delete cascade,
    security_id          text,
    security_name        text                                   not null,
    security_type        text,
    ticker_symbol        text,
    quantity             numeric                                not null,
    cost_basis           numeric(15, 2),
    current_market_value numeric(15, 2)                         not null,
    is_active            boolean                  default true  not null,
    created_at           timestamp with time zone default now() not null,
    updated_at           timestamp with time zone default now() not null,
    constraint unique_investment_per_user_account_security_holding
        unique (user_id, account_id, security_id, holding_id)
);

comment on table investments is 'Table storing user investment holdings';

comment on column investments.user_id is 'Foreign key to users table';

comment on column investments.holding_id is 'Unique identifier for the holding from the provider';

comment on column investments.account_id is 'Foreign key to accounts table';

comment on column investments.security_id is 'Unique identifier for the security';

comment on column investments.security_name is 'Name of the security';

comment on column investments.security_type is 'Type of security (e.g., stock, bond, mutual fund)';

comment on column investments.ticker_symbol is 'Ticker symbol of the security';

comment on column investments.quantity is 'Quantity of the security held';

comment on column investments.cost_basis is 'Total cost basis of the investment';

comment on column investments.current_market_value is 'Current market value of the investment';

comment on column investments.is_active is 'Whether the investment is currently active';

comment on column investments.created_at is 'Creation timestamp';

comment on column investments.updated_at is 'Last update timestamp';

alter table investments
    owner to postgres;

create index investments_user_id_index
    on investments (user_id);

create index investments_account_id_index
    on investments (account_id);

create index investments_user_id_account_id_index
    on investments (user_id, account_id);

create trigger set_updated_at
    before update
    on investments
    for each row
execute procedure set_updated_at();

create policy select_investments on investments
    as permissive
    for select
    using (user_id = (current_setting('app.current_user'::text))::uuid);

create policy update_investments on investments
    as permissive
    for update
    using (user_id = (current_setting('app.current_user'::text))::uuid);

create table widgets
(
    id               serial
        primary key,
    name             text                                         not null,
    description      text,
    default_settings jsonb                    default '{}'::jsonb not null,
    is_active        boolean                  default true        not null,
    widget_type      text                                         not null,
    min_width        integer                  default 1           not null,
    min_height       integer                  default 1           not null,
    max_width        integer,
    max_height       integer,
    default_width    integer                  default 2           not null,
    default_height   integer                  default 2           not null,
    resizable        boolean                  default true        not null,
    draggable        boolean                  default true        not null,
    static           boolean                  default false       not null,
    icon             text,
    created_at       timestamp with time zone default now()       not null,
    updated_at       timestamp with time zone default now()       not null
);

comment on table widgets is 'Available widgets for dashboards';

comment on column widgets.name is 'Widget name';

comment on column widgets.description is 'Widget description';

comment on column widgets.default_settings is 'Default settings for the widget';

comment on column widgets.is_active is 'Active status';

comment on column widgets.widget_type is 'Type of widget';

comment on column widgets.min_width is 'Minimum width in grid units';

comment on column widgets.min_height is 'Minimum height in grid units';

comment on column widgets.max_width is 'Maximum width in grid units';

comment on column widgets.max_height is 'Maximum height in grid units';

comment on column widgets.default_width is 'Default width in grid units';

comment on column widgets.default_height is 'Default height in grid units';

comment on column widgets.resizable is 'Whether the widget is resizable';

comment on column widgets.draggable is 'Whether the widget is draggable';

comment on column widgets.static is 'Whether the widget is static';

comment on column widgets.icon is 'Icon representing the widget';

comment on column widgets.created_at is 'Creation timestamp';

comment on column widgets.updated_at is 'Last update timestamp';

alter table widgets
    owner to postgres;

create trigger set_updated_at
    before update
    on widgets
    for each row
execute procedure set_updated_at();

create policy select_widgets on widgets
    as permissive
    for select
    using true;

create table user_widgets
(
    id         serial
        primary key,
    user_id    uuid                                         not null
        references users
            on delete cascade,
    widget_id  integer                                      not null
        references widgets
            on delete cascade,
    settings   jsonb                    default '{}'::jsonb not null,
    layout     jsonb                    default '{}'::jsonb not null,
    is_active  boolean                  default true        not null,
    created_at timestamp with time zone default now()       not null,
    updated_at timestamp with time zone default now()       not null
);

comment on table user_widgets is 'Widgets added by users to their dashboards';

comment on column user_widgets.user_id is 'Foreign key to users table';

comment on column user_widgets.widget_id is 'Foreign key to widgets table';

comment on column user_widgets.settings is 'User-specific widget settings';

comment on column user_widgets.layout is 'Layout information for the widget';

comment on column user_widgets.is_active is 'Active status';

comment on column user_widgets.created_at is 'Creation timestamp';

comment on column user_widgets.updated_at is 'Last update timestamp';

alter table user_widgets
    owner to postgres;

create index user_widgets_user_id_widget_id_index
    on user_widgets (user_id, widget_id);

create trigger set_updated_at
    before update
    on user_widgets
    for each row
execute procedure set_updated_at();

create policy select_user_widgets on user_widgets
    as permissive
    for select
    using (user_id = (current_setting('app.current_user'::text))::uuid);

create policy update_user_widgets on user_widgets
    as permissive
    for update
    using (user_id = (current_setting('app.current_user'::text))::uuid);

create table journal_entries
(
    id                           serial
        primary key,
    user_id                      uuid                                   not null
        references users
            on delete cascade,
    content                      text                                   not null,
    is_ai_generated              boolean                  default false not null,
    category                     text,
    tags                         text[]                   default '{}'::text[],
    time_frame_start             date,
    time_frame_end               date,
    financial_performance_rating integer,
    sentiment                    text,
    metadata                     jsonb                    default '{}'::jsonb,
    reading_time                 interval,
    associated_goals             text[]                   default '{}'::text[],
    mood                         text,
    location                     point,
    attachments                  text[]                   default '{}'::text[],
    is_private                   boolean                  default true,
    is_favorite                  boolean                  default false,
    last_edited_by               uuid
        references users,
    version                      integer                  default 1,
    created_at                   timestamp with time zone default now() not null,
    updated_at                   timestamp with time zone default now() not null
);

comment on table journal_entries is 'User journal entries';

comment on column journal_entries.user_id is 'Foreign key to users table';

comment on column journal_entries.content is 'Content of the journal entry';

comment on column journal_entries.is_ai_generated is 'Whether the entry was generated by AI';

comment on column journal_entries.category is 'Entry category';

comment on column journal_entries.tags is 'Tags associated with the entry';

comment on column journal_entries.time_frame_start is 'Start date of the entry timeframe';

comment on column journal_entries.time_frame_end is 'End date of the entry timeframe';

comment on column journal_entries.financial_performance_rating is 'User''s rating of financial performance';

comment on column journal_entries.sentiment is 'Sentiment analysis result';

comment on column journal_entries.metadata is 'Additional metadata';

comment on column journal_entries.reading_time is 'Estimated reading time';

comment on column journal_entries.associated_goals is 'Goals associated with the entry';

comment on column journal_entries.mood is 'Mood during entry creation';

comment on column journal_entries.location is 'Location coordinates';

comment on column journal_entries.attachments is 'Attachments associated with the entry';

comment on column journal_entries.is_private is 'Privacy status';

comment on column journal_entries.is_favorite is 'Favorite status';

comment on column journal_entries.last_edited_by is 'User who last edited the entry';

comment on column journal_entries.version is 'Version number for the entry';

comment on column journal_entries.created_at is 'Creation timestamp';

comment on column journal_entries.updated_at is 'Last update timestamp';

alter table journal_entries
    owner to postgres;

create index journal_entries_user_id_time_frame_start_index
    on journal_entries (user_id, time_frame_start);

create trigger set_updated_at
    before update
    on journal_entries
    for each row
execute procedure set_updated_at();

create policy select_journal_entries on journal_entries
    as permissive
    for select
    using (user_id = (current_setting('app.current_user'::text))::uuid);

create policy update_journal_entries on journal_entries
    as permissive
    for update
    using (user_id = (current_setting('app.current_user'::text))::uuid);

create table ai_analyses
(
    id            serial
        primary key,
    user_id       uuid                                               not null
        references users
            on delete cascade,
    analysis_type text                                               not null,
    input_data    jsonb                                              not null,
    output_data   jsonb                                              not null,
    status        text                     default 'completed'::text not null,
    error_message text,
    created_at    timestamp with time zone default now()             not null,
    updated_at    timestamp with time zone default now()             not null
);

comment on table ai_analyses is 'AI analyses performed for users';

comment on column ai_analyses.user_id is 'Foreign key to users table';

comment on column ai_analyses.analysis_type is 'Type of AI analysis';

comment on column ai_analyses.input_data is 'Input data for analysis';

comment on column ai_analyses.output_data is 'Result of the analysis';

comment on column ai_analyses.status is 'Status of the analysis';

comment on column ai_analyses.error_message is 'Error message if any';

comment on column ai_analyses.created_at is 'Creation timestamp';

comment on column ai_analyses.updated_at is 'Last update timestamp';

alter table ai_analyses
    owner to postgres;

create index ai_analyses_user_id_analysis_type_index
    on ai_analyses (user_id, analysis_type);

create trigger set_updated_at
    before update
    on ai_analyses
    for each row
execute procedure set_updated_at();

create policy select_ai_analyses on ai_analyses
    as permissive
    for select
    using (user_id = (current_setting('app.current_user'::text))::uuid);

create policy update_ai_analyses on ai_analyses
    as permissive
    for update
    using (user_id = (current_setting('app.current_user'::text))::uuid);

create table audit_logs
(
    id               serial
        primary key,
    user_id          uuid
                                                            references users
                                                                on delete set null,
    action           text                                   not null,
    table_name       text,
    record_id        bigint,
    changes          jsonb,
    action_timestamp timestamp with time zone default now() not null,
    ip_address       inet,
    user_agent       text
);

comment on table audit_logs is 'Audit logs for tracking changes and actions';

comment on column audit_logs.user_id is 'Foreign key to users table';

comment on column audit_logs.action is 'Action performed';

comment on column audit_logs.table_name is 'Affected table';

comment on column audit_logs.record_id is 'Affected record ID';

comment on column audit_logs.changes is 'Changes made';

comment on column audit_logs.action_timestamp is 'Timestamp of the action';

comment on column audit_logs.ip_address is 'IP address of the user';

comment on column audit_logs.user_agent is 'User agent string';

alter table audit_logs
    owner to postgres;

create index audit_logs_user_id_index
    on audit_logs (user_id);

create index audit_logs_action_timestamp_index
    on audit_logs (action_timestamp);

create table transactions
(
    id                    integer                  default nextval('transactions_id_seq'::regclass) not null,
    user_id               uuid                                                                      not null
        references users
            on delete cascade,
    account_id            integer                                                                   not null
        references accounts
            on delete cascade,
    transaction_source_id text                                                                      not null,
    transaction_source    text                                                                      not null,
    amount                numeric(15, 2)                                                            not null,
    transaction_date      date                                                                      not null,
    authorized_date       date,
    description           text                                                                      not null,
    category              text[],
    transaction_type      text,
    pending               boolean                  default false,
    is_manual             boolean                  default false,
    metadata              jsonb                    default '{}'::jsonb,
    is_duplicate          boolean                  default false                                    not null,
    created_at            timestamp with time zone default now()                                    not null,
    updated_at            timestamp with time zone default now()                                    not null,
    primary key (id, transaction_date),
    constraint unique_transaction_per_user
        unique (user_id, account_id, transaction_source_id, transaction_date)
)
    partition by RANGE (transaction_date);

comment on column transactions.transaction_source_id is 'ID from the data source';

comment on column transactions.transaction_source is 'Source of the transaction data';

comment on column transactions.amount is 'Transaction amount';

comment on column transactions.transaction_date is 'Transaction date';

comment on column transactions.authorized_date is 'Authorization date if applicable';

comment on column transactions.description is 'Transaction description';

comment on column transactions.category is 'Transaction categories';

comment on column transactions.transaction_type is 'Transaction type';

comment on column transactions.pending is 'Pending status';

comment on column transactions.is_manual is 'Whether the transaction was manually added';

comment on column transactions.metadata is 'Additional metadata';

comment on column transactions.is_duplicate is 'Duplicate transaction indicator';

comment on column transactions.created_at is 'Creation timestamp';

comment on column transactions.updated_at is 'Last update timestamp';

alter table transactions
    owner to postgres;

create index idx_transactions_user_account_date
    on transactions (user_id, account_id, transaction_date);

create trigger create_transactions_partition_trigger
    before insert
    on transactions
    for each row
execute procedure create_transactions_partition();

create table transactions_2024_09
    partition of transactions
        (
            constraint transactions_account_id_fkey
                foreign key (account_id) references accounts
                    on delete cascade,
            constraint transactions_user_id_fkey
                foreign key (user_id) references users
                    on delete cascade
            )
        FOR VALUES FROM ('2024-09-01') TO ('2024-10-01');

alter table transactions_2024_09
    owner to postgres;

create table transactions_2024_08
    partition of transactions
        (
            constraint transactions_account_id_fkey
                foreign key (account_id) references accounts
                    on delete cascade,
            constraint transactions_user_id_fkey
                foreign key (user_id) references users
                    on delete cascade
            )
        FOR VALUES FROM ('2024-08-01') TO ('2024-09-01');

alter table transactions_2024_08
    owner to postgres;

create table transactions_2024_07
    partition of transactions
        (
            constraint transactions_account_id_fkey
                foreign key (account_id) references accounts
                    on delete cascade,
            constraint transactions_user_id_fkey
                foreign key (user_id) references users
                    on delete cascade
            )
        FOR VALUES FROM ('2024-07-01') TO ('2024-08-01');

alter table transactions_2024_07
    owner to postgres;

create table transactions_2024_06
    partition of transactions
        (
            constraint transactions_account_id_fkey
                foreign key (account_id) references accounts
                    on delete cascade,
            constraint transactions_user_id_fkey
                foreign key (user_id) references users
                    on delete cascade
            )
        FOR VALUES FROM ('2024-06-01') TO ('2024-07-01');

alter table transactions_2024_06
    owner to postgres;

