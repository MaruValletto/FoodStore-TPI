"""Comprueba la conexión y guarda la contraseña local sin mostrarla."""
from getpass import getpass
from pathlib import Path

import psycopg2
from dotenv import dotenv_values, set_key
from sqlalchemy.engine import URL, make_url


def main():
    env_path = Path(__file__).resolve().parent / '.env'
    values = dotenv_values(env_path)
    try:
        current = make_url(values.get('DATABASE_URL') or '')
        host = current.host or 'localhost'
        port = current.port or 5432
        username = current.username or 'postgres'
        database = current.database or 'foodstore_tpi'
    except Exception:
        print('No se pudo leer DATABASE_URL. Revisá su formato en .env.')
        return 1

    print(f'Conexión: {host}:{port} · usuario {username} · base {database}')
    print('Escribí la misma contraseña que acabás de usar en pgAdmin.')
    print('Mientras la escribís no se mostrarán letras ni asteriscos: es normal.')
    password = getpass('Contraseña de PostgreSQL: ')
    try:
        connection = psycopg2.connect(
            host=host, port=port, user=username, password=password,
            dbname=database, connect_timeout=5,
        )
        try:
            with connection.cursor() as cursor:
                cursor.execute('SELECT 1')
                assert cursor.fetchone() == (1,)
        finally:
            connection.close()
    except (psycopg2.Error, UnicodeError):
        print('No se pudo conectar con esos datos. No se modificó el archivo .env.')
        return 1

    url = URL.create(
        'postgresql+psycopg2', username=username, password=password,
        host=host, port=port, database=database,
    )
    set_key(str(env_path), 'DATABASE_URL', url.render_as_string(hide_password=False))
    print('Conexión comprobada. .env actualizado; SECRET_KEY se conserva.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
