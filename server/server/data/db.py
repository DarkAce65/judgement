import os

import psycopg2

if "POSTGRES_PASSWORD_FILE" in os.environ:
    postgres_password_file = os.environ.get("POSTGRES_PASSWORD_FILE")
    if postgres_password_file is None:
        raise Exception("Missing path to postgres password secret")

    with open(postgres_password_file) as f:
        postgres_password = f.readline().strip()
        db_connection = psycopg2.connect(
            host="database",
            database=os.environ.get("POSTGRES_DB"),
            user="postgres",
            password=postgres_password,
        )
else:
    db_connection = psycopg2.connect(
        host="database", database=os.environ.get("POSTGRES_DB"), user="postgres"
    )
db_connection.autocommit = True
