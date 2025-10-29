import os
import psycopg
from typing import Optional
from contextlib import asynccontextmanager


class DatabaseConnection:
    def __init__(self):
        self.dsn = os.getenv("DB_DSN", "postgresql://poker:poker@localhost:5432/pokerdb")
    
    @asynccontextmanager
    async def get_connection(self):
        conn = await psycopg.AsyncConnection.connect(self.dsn)
        try:
            yield conn
        finally:
            await conn.close()
