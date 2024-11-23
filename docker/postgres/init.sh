#!/bin/bash
set -e

cat /etc/banner.txt

echo "🚀 Initializing Zephyr PostgreSQL Development Instance..."

setup_database() {
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
        CREATE EXTENSION IF NOT EXISTS "pgcrypto";
        CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
        ALTER DATABASE $POSTGRES_DB SET timezone TO 'UTC';
EOSQL
}

setup_database
echo "✅ Database extensions initialized successfully"
