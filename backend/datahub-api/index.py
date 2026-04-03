"""
API для DataHub: получение данных из таблиц users, data_tables, reports.
Поддерживает поиск и фильтрацию.
"""
import json
import os
import psycopg2
import psycopg2.extras


def get_conn():
    dsn = os.environ["DATABASE_URL"]
    if "sslmode" not in dsn:
        dsn += ("&" if "?" in dsn else "?") + "sslmode=disable"
    return psycopg2.connect(dsn)


def handler(event: dict, context) -> dict:
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": headers, "body": ""}

    params = event.get("queryStringParameters") or {}
    resource = params.get("resource", "tables")
    search = params.get("search", "").strip().lower()

    conn = get_conn()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    try:
        if resource == "users":
            cur.execute("""
                SELECT
                    id,
                    name,
                    email,
                    role,
                    status,
                    dept,
                    CASE
                        WHEN last_seen > NOW() - INTERVAL '1 hour'
                            THEN EXTRACT(EPOCH FROM (NOW() - last_seen))::int / 60 || ' мин. назад'
                        WHEN last_seen > NOW() - INTERVAL '24 hours'
                            THEN EXTRACT(EPOCH FROM (NOW() - last_seen))::int / 3600 || ' ч. назад'
                        ELSE TO_CHAR(last_seen, 'DD.MM.YYYY')
                    END AS last_seen,
                    TO_CHAR(created_at, 'DD.MM.YYYY') AS created
                FROM users
                ORDER BY name
            """)

        elif resource == "reports":
            cur.execute("""
                SELECT
                    id,
                    name,
                    type,
                    rows_count AS rows,
                    status,
                    CASE
                        WHEN updated_at > NOW() - INTERVAL '24 hours'
                            THEN 'Сегодня ' || TO_CHAR(updated_at, 'HH24:MI')
                        ELSE 'Вчера ' || TO_CHAR(updated_at, 'HH24:MI')
                    END AS updated
                FROM reports
                ORDER BY updated_at DESC
            """)

        else:
            cur.execute("""
                SELECT
                    id,
                    name,
                    rows_count AS rows,
                    CAST(size_mb AS TEXT) || ' MB' AS size,
                    status,
                    CASE
                        WHEN updated_at > NOW() - INTERVAL '1 hour'
                            THEN EXTRACT(EPOCH FROM (NOW() - updated_at))::int / 60 || ' мин. назад'
                        WHEN updated_at > NOW() - INTERVAL '24 hours'
                            THEN EXTRACT(EPOCH FROM (NOW() - updated_at))::int / 3600 || ' ч. назад'
                        ELSE TO_CHAR(updated_at, 'DD.MM.YYYY')
                    END AS updated
                FROM data_tables
                ORDER BY name
            """)

        rows = cur.fetchall()
        data = [dict(r) for r in rows]

        if search:
            data = [r for r in data if any(
                search in str(v).lower() for v in r.values()
            )]

        return {
            "statusCode": 200,
            "headers": headers,
            "body": json.dumps({"data": data, "total": len(data)}, ensure_ascii=False, default=str),
        }
    finally:
        cur.close()
        conn.close()
