import functools
import os

import psycopg2


@functools.lru_cache(maxsize=1)
def get_db_connection() -> "psycopg2.connection":
    if "POSTGRES_PASSWORD_FILE" in os.environ:
        postgres_password_file = os.environ.get("POSTGRES_PASSWORD_FILE")
        if postgres_password_file is None:
            raise Exception("Missing path to postgres password secret")

        with open(postgres_password_file) as pass_file:
            postgres_password = pass_file.readline().strip()
            conn = psycopg2.connect(
                host="database",
                database=os.environ.get("POSTGRES_DB"),
                user="postgres",
                password=postgres_password,
            )
    else:
        conn = psycopg2.connect(
            host="database", database=os.environ.get("POSTGRES_DB"), user="postgres"
        )

    conn.autocommit = True
    return conn


def get_cursor() -> "psycopg2.cursor":
    db_connection = get_db_connection()

    try:
        cur = db_connection.cursor()
    except psycopg2.InterfaceError:
        get_db_connection.cache_clear()
        db_connection = get_db_connection()
        cur = db_connection.cursor()

    return cur
