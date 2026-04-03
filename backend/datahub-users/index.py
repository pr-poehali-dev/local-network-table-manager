"""
API управления пользователями: создание, обновление, удаление.
POST /  — создать или обновить (если передан id)
DELETE /?id=X — удалить пользователя
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


CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
}


def ok(data=None):
    return {"statusCode": 200, "headers": CORS, "body": json.dumps(data or {"ok": True}, ensure_ascii=False)}


def err(msg, code=400):
    return {"statusCode": code, "headers": CORS, "body": json.dumps({"error": msg}, ensure_ascii=False)}


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}

    conn = get_conn()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    try:
        if method == "DELETE":
            user_id = params.get("id")
            if not user_id:
                return err("id обязателен")
            cur.execute("DELETE FROM users WHERE id = %s RETURNING id", (int(user_id),))
            row = cur.fetchone()
            conn.commit()
            if not row:
                return err("Пользователь не найден", 404)
            return ok({"deleted": int(user_id)})

        if method == "POST":
            body = json.loads(event.get("body") or "{}")
            name = (body.get("name") or "").strip()
            email = (body.get("email") or "").strip()
            role = body.get("role", "Оператор")
            status = body.get("status", "Активен")
            dept = body.get("dept", "")
            user_id = body.get("id")

            if not name or not email:
                return err("Имя и email обязательны")

            if user_id:
                cur.execute("""
                    UPDATE users SET name=%s, email=%s, role=%s, status=%s, dept=%s
                    WHERE id=%s RETURNING id
                """, (name, email, role, status, dept, int(user_id)))
                row = cur.fetchone()
                conn.commit()
                if not row:
                    return err("Пользователь не найден", 404)
                return ok({"id": int(user_id), "action": "updated"})
            else:
                cur.execute("""
                    INSERT INTO users (name, email, role, status, dept, last_seen)
                    VALUES (%s, %s, %s, %s, %s, NOW())
                    RETURNING id
                """, (name, email, role, status, dept))
                row = cur.fetchone()
                conn.commit()
                return ok({"id": row["id"], "action": "created"})

        return err("Метод не поддерживается", 405)

    finally:
        cur.close()
        conn.close()
