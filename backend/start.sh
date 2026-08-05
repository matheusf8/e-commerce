#!/bin/bash
set -e

echo "=========================================="
echo "  E-commerce API - Startup Script"
echo "=========================================="

# Aguardar o banco de dados estar pronto
echo "⏳ Waiting for database to be ready..."
python -c "
import time
import sys
try:
    from sqlalchemy import create_engine
    from sqlalchemy.exc import OperationalError
    import os
    
    db_url = os.getenv('DATABASE_URL', 'sqlite:///./ecommerce.db')
    print(f'  Database URL: {db_url}')
    
    # For PostgreSQL, wait for connection
    if 'postgresql' in db_url:
        engine = create_engine(db_url)
        for i in range(30):
            try:
                conn = engine.connect()
                conn.close()
                print('  ✅ Database is ready!')
                break
            except OperationalError as e:
                print(f'  ⏳ Waiting for database... ({i+1}/30)')
                time.sleep(2)
        else:
            print('  ❌ Failed to connect to database after 30 attempts')
            sys.exit(1)
    else:
        print('  ✅ Using SQLite (no wait needed)')
except Exception as e:
    print(f'  ⚠️ Error checking database: {e}')
    print('  ⏳ Continuing anyway...')
"

echo ""
echo "=========================================="
echo "  Running database migrations (Alembic)..."
echo "=========================================="
alembic upgrade head

echo ""
echo "=========================================="
echo "  Database seed..."
echo "=========================================="
# Opt-in only (SEED_DB=true). Off by default so a client's real catalog
# never risks a boot accidentally reintroducing the demo admin/products.
# docker-compose.yml sets SEED_DB=true for local dev convenience.
if [ "${SEED_DB:-false}" = "true" ]; then
    python seed_db.py
else
    echo "  ⏭️  SEED_DB não é 'true' — pulando seed."
fi

echo ""
echo "=========================================="
echo "  Starting Uvicorn server..."
echo "=========================================="
# No --reload: this is a running container, not a dev environment with a
# file watcher doing anything useful. ${PORT:-8000} so this also works
# unchanged on platforms (e.g. Render) that inject their own PORT.
exec uvicorn main:app --host 0.0.0.0 --port "${PORT:-8000}"

