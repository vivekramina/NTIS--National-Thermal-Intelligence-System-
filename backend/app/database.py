import os
import logging
from pathlib import Path
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker, scoped_session
from .config import Config

logger = logging.getLogger('thermal_watch.database')

Base = declarative_base()

_engine = None
_session_factory = None
_db_status = {
    'type': 'uninitialized',
    'status': 'pending',
    'uri': '',
    'error': None
}

def get_engine():
    global _engine, _db_status
    if _engine is not None:
        return _engine

    primary_url = Config.DATABASE_URL
    sqlite_path = Path(__file__).resolve().parent.parent / 'thermal_watch.db'
    sqlite_url = f'sqlite:///{sqlite_path}'

    # Attempt primary PostgreSQL connection
    if primary_url and primary_url.startswith('postgresql'):
        try:
            logger.info(f'Attempting connection to PostgreSQL: {primary_url}')
            test_engine = create_engine(primary_url, pool_pre_ping=True, connect_args={'connect_timeout': 3})
            with test_engine.connect() as conn:
                conn.execute(text('SELECT 1'))
            _engine = test_engine
            _db_status = {
                'type': 'postgresql+postgis',
                'status': 'connected',
                'uri': primary_url.split('@')[-1] if '@' in primary_url else 'postgresql',
                'error': None
            }
            logger.info('Connected successfully to PostgreSQL database.')
            return _engine
        except Exception as e:
            logger.warning(f'PostgreSQL connection failed ({e}). Falling back to local SQLite: {sqlite_url}')
            _db_status['error'] = str(e)

    # SQLite fallback
    _engine = create_engine(sqlite_url, connect_args={'check_same_thread': False})
    _db_status = {
        'type': 'sqlite',
        'status': 'connected (fallback mode)',
        'uri': str(sqlite_path.name),
        'error': _db_status.get('error')
    }
    logger.info(f'Using local SQLite database at {sqlite_path}')
    return _engine

def get_db_session():
    global _session_factory
    if _session_factory is None:
        engine = get_engine()
        _session_factory = scoped_session(sessionmaker(autocommit=False, autoflush=False, expire_on_commit=False, bind=engine))
    return _session_factory()

def get_database_status():
    get_engine()
    return _db_status

def init_db():
    engine = get_engine()
    # Import all models before creating tables
    from . import models  # noqa: F401
    Base.metadata.create_all(bind=engine)
    logger.info('Database schema tables verified and ready.')
