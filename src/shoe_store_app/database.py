from __future__ import annotations

import sqlite3
from pathlib import Path
from typing import Any


SCHEMA_SQL = """
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    login TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role_id INTEGER NOT NULL,
    FOREIGN KEY (role_id) REFERENCES roles (id)
);

CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS manufacturers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS units (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS products (
    article TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    unit_id INTEGER NOT NULL,
    price REAL NOT NULL CHECK (price >= 0),
    supplier_id INTEGER NOT NULL,
    manufacturer_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    discount_percent INTEGER NOT NULL CHECK (discount_percent >= 0 AND discount_percent <= 100),
    stock_qty INTEGER NOT NULL CHECK (stock_qty >= 0),
    description TEXT NOT NULL,
    image_path TEXT,
    FOREIGN KEY (unit_id) REFERENCES units (id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers (id),
    FOREIGN KEY (manufacturer_id) REFERENCES manufacturers (id),
    FOREIGN KEY (category_id) REFERENCES categories (id)
);

CREATE TABLE IF NOT EXISTS pickup_points (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    address TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS order_statuses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY,
    order_date TEXT NOT NULL,
    delivery_date TEXT NOT NULL,
    pickup_point_id INTEGER NOT NULL,
    client_user_id INTEGER,
    receive_code TEXT,
    status_id INTEGER NOT NULL,
    FOREIGN KEY (pickup_point_id) REFERENCES pickup_points (id),
    FOREIGN KEY (client_user_id) REFERENCES users (id),
    FOREIGN KEY (status_id) REFERENCES order_statuses (id)
);

CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_article TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    UNIQUE (order_id, product_article),
    FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
    FOREIGN KEY (product_article) REFERENCES products (article)
);
"""


class Database:
    def __init__(self, db_path: Path) -> None:
        self._db_path = db_path
        self._db_path.parent.mkdir(parents=True, exist_ok=True)

    def connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self._db_path)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON;")
        return conn

    def init_schema(self) -> None:
        with self.connect() as conn:
            conn.executescript(SCHEMA_SQL)
            conn.executemany(
                "INSERT OR IGNORE INTO roles (id, name) VALUES (?, ?)",
                [(1, "Администратор"), (2, "Менеджер"), (3, "Авторизованный клиент")],
            )

    def authenticate(self, login: str, password: str) -> dict[str, Any] | None:
        with self.connect() as conn:
            row = conn.execute(
                """
                SELECT users.id, users.full_name, users.login, roles.name AS role
                FROM users
                JOIN roles ON roles.id = users.role_id
                WHERE users.login = ? AND users.password = ?
                """,
                (login.strip(), password.strip()),
            ).fetchone()
            return dict(row) if row else None

    def list_suppliers(self) -> list[str]:
        with self.connect() as conn:
            rows = conn.execute("SELECT name FROM suppliers ORDER BY name").fetchall()
            return [row[0] for row in rows]

    def _product_query(self) -> str:
        return """
            SELECT
                p.article,
                p.name,
                u.name AS unit,
                p.price,
                s.name AS supplier,
                m.name AS manufacturer,
                c.name AS category,
                p.discount_percent,
                p.stock_qty,
                p.description,
                p.image_path
            FROM products p
            JOIN units u ON u.id = p.unit_id
            JOIN suppliers s ON s.id = p.supplier_id
            JOIN manufacturers m ON m.id = p.manufacturer_id
            JOIN categories c ON c.id = p.category_id
        """

    def list_products(
        self,
        *,
        search: str = "",
        supplier: str = "Все поставщики",
        stock_sort: str = "none",
    ) -> list[dict[str, Any]]:
        query = [self._product_query()]
        params: list[Any] = []
        where_parts: list[str] = []

        if search.strip():
            term = f"%{search.strip().lower()}%"
            where_parts.append(
                "(" + " OR ".join(
                    [
                        "LOWER(p.article) LIKE ?",
                        "LOWER(p.name) LIKE ?",
                        "LOWER(s.name) LIKE ?",
                        "LOWER(m.name) LIKE ?",
                        "LOWER(c.name) LIKE ?",
                        "LOWER(p.description) LIKE ?",
                        "LOWER(u.name) LIKE ?",
                    ]
                ) + ")"
            )
            params.extend([term] * 7)

        if supplier != "Все поставщики":
            where_parts.append("s.name = ?")
            params.append(supplier)

        if where_parts:
            query.append("WHERE " + " AND ".join(where_parts))

        if stock_sort == "asc":
            query.append("ORDER BY p.stock_qty ASC, p.name ASC")
        elif stock_sort == "desc":
            query.append("ORDER BY p.stock_qty DESC, p.name ASC")
        else:
            query.append("ORDER BY p.name ASC")

        with self.connect() as conn:
            rows = conn.execute("\n".join(query), params).fetchall()
            return [dict(row) for row in rows]

    def _upsert_lookup(self, conn: sqlite3.Connection, table: str, name: str) -> int:
        conn.execute(f"INSERT OR IGNORE INTO {table} (name) VALUES (?)", (name,))
        row = conn.execute(f"SELECT id FROM {table} WHERE name = ?", (name,)).fetchone()
        if row is None:
            raise ValueError(f"Не удалось получить ID из {table}")
        return int(row[0])

    def add_product(self, payload: dict[str, Any]) -> None:
        with self.connect() as conn:
            unit_id = self._upsert_lookup(conn, "units", payload["unit"])
            supplier_id = self._upsert_lookup(conn, "suppliers", payload["supplier"])
            manufacturer_id = self._upsert_lookup(conn, "manufacturers", payload["manufacturer"])
            category_id = self._upsert_lookup(conn, "categories", payload["category"])
            conn.execute(
                """
                INSERT INTO products (
                    article, name, unit_id, price, supplier_id, manufacturer_id, category_id,
                    discount_percent, stock_qty, description, image_path
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    payload["article"],
                    payload["name"],
                    unit_id,
                    payload["price"],
                    supplier_id,
                    manufacturer_id,
                    category_id,
                    payload["discount_percent"],
                    payload["stock_qty"],
                    payload["description"],
                    payload.get("image_path"),
                ),
            )

    def update_product(self, old_article: str, payload: dict[str, Any]) -> None:
        with self.connect() as conn:
            unit_id = self._upsert_lookup(conn, "units", payload["unit"])
            supplier_id = self._upsert_lookup(conn, "suppliers", payload["supplier"])
            manufacturer_id = self._upsert_lookup(conn, "manufacturers", payload["manufacturer"])
            category_id = self._upsert_lookup(conn, "categories", payload["category"])
            conn.execute(
                """
                UPDATE products
                SET article = ?,
                    name = ?,
                    unit_id = ?,
                    price = ?,
                    supplier_id = ?,
                    manufacturer_id = ?,
                    category_id = ?,
                    discount_percent = ?,
                    stock_qty = ?,
                    description = ?,
                    image_path = ?
                WHERE article = ?
                """,
                (
                    payload["article"],
                    payload["name"],
                    unit_id,
                    payload["price"],
                    supplier_id,
                    manufacturer_id,
                    category_id,
                    payload["discount_percent"],
                    payload["stock_qty"],
                    payload["description"],
                    payload.get("image_path"),
                    old_article,
                ),
            )

    def can_delete_product(self, article: str) -> bool:
        with self.connect() as conn:
            row = conn.execute(
                "SELECT 1 FROM order_items WHERE product_article = ? LIMIT 1", (article,)
            ).fetchone()
            return row is None

    def delete_product(self, article: str) -> None:
        with self.connect() as conn:
            conn.execute("DELETE FROM products WHERE article = ?", (article,))

    def get_product(self, article: str) -> dict[str, Any] | None:
        with self.connect() as conn:
            row = conn.execute(
                self._product_query() + " WHERE p.article = ?",
                (article,),
            ).fetchone()
            return dict(row) if row else None

    def list_lookup_values(self, table: str) -> list[str]:
        if table not in {"units", "suppliers", "manufacturers", "categories", "order_statuses"}:
            raise ValueError("Недопустимая таблица")
        with self.connect() as conn:
            rows = conn.execute(f"SELECT name FROM {table} ORDER BY name").fetchall()
            return [row[0] for row in rows]

    def list_pickup_points(self) -> list[dict[str, Any]]:
        with self.connect() as conn:
            rows = conn.execute("SELECT id, address FROM pickup_points ORDER BY id").fetchall()
            return [dict(row) for row in rows]

    def list_clients(self) -> list[dict[str, Any]]:
        with self.connect() as conn:
            rows = conn.execute(
                """
                SELECT id, full_name
                FROM users
                WHERE role_id = 3
                ORDER BY full_name
                """
            ).fetchall()
            return [dict(row) for row in rows]

    def list_orders(self) -> list[dict[str, Any]]:
        with self.connect() as conn:
            rows = conn.execute(
                """
                SELECT
                    o.id,
                    o.order_date,
                    o.delivery_date,
                    o.receive_code,
                    os.name AS status,
                    pp.address AS pickup_address,
                    u.full_name AS client_name,
                    COALESCE(
                        (
                            SELECT GROUP_CONCAT(oi.product_article || ' x' || oi.quantity, '; ')
                            FROM order_items oi
                            WHERE oi.order_id = o.id
                        ),
                        ''
                    ) AS items
                FROM orders o
                JOIN order_statuses os ON os.id = o.status_id
                JOIN pickup_points pp ON pp.id = o.pickup_point_id
                LEFT JOIN users u ON u.id = o.client_user_id
                ORDER BY o.id
                """
            ).fetchall()
            return [dict(row) for row in rows]

    def get_order(self, order_id: int) -> dict[str, Any] | None:
        with self.connect() as conn:
            row = conn.execute(
                """
                SELECT id, order_date, delivery_date, pickup_point_id, client_user_id, receive_code, status_id
                FROM orders
                WHERE id = ?
                """,
                (order_id,),
            ).fetchone()
            if row is None:
                return None
            order = dict(row)
            items = conn.execute(
                "SELECT product_article, quantity FROM order_items WHERE order_id = ?",
                (order_id,),
            ).fetchall()
            order["items"] = [dict(item) for item in items]
            return order

    def save_order(self, payload: dict[str, Any], edit_id: int | None = None) -> None:
        with self.connect() as conn:
            if edit_id is None:
                conn.execute(
                    """
                    INSERT INTO orders (
                        id, order_date, delivery_date, pickup_point_id, client_user_id, receive_code, status_id
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        payload["id"],
                        payload["order_date"],
                        payload["delivery_date"],
                        payload["pickup_point_id"],
                        payload.get("client_user_id"),
                        payload["receive_code"],
                        payload["status_id"],
                    ),
                )
            else:
                conn.execute(
                    """
                    UPDATE orders
                    SET id = ?, order_date = ?, delivery_date = ?, pickup_point_id = ?,
                        client_user_id = ?, receive_code = ?, status_id = ?
                    WHERE id = ?
                    """,
                    (
                        payload["id"],
                        payload["order_date"],
                        payload["delivery_date"],
                        payload["pickup_point_id"],
                        payload.get("client_user_id"),
                        payload["receive_code"],
                        payload["status_id"],
                        edit_id,
                    ),
                )
                conn.execute("DELETE FROM order_items WHERE order_id = ?", (payload["id"],))

            conn.executemany(
                "INSERT INTO order_items (order_id, product_article, quantity) VALUES (?, ?, ?)",
                [(payload["id"], item["product_article"], item["quantity"]) for item in payload["items"]],
            )

    def delete_order(self, order_id: int) -> None:
        with self.connect() as conn:
            conn.execute("DELETE FROM orders WHERE id = ?", (order_id,))

    def next_order_id(self) -> int:
        with self.connect() as conn:
            row = conn.execute("SELECT COALESCE(MAX(id), 0) + 1 FROM orders").fetchone()
            return int(row[0])

    def next_product_article(self) -> str:
        with self.connect() as conn:
            row = conn.execute(
                """
                SELECT article
                FROM products
                ORDER BY LENGTH(article) DESC, article DESC
                LIMIT 1
                """
            ).fetchone()
            if row is None:
                return "P1000"
            article = str(row[0])
            prefix = "".join(ch for ch in article if not ch.isdigit()) or "P"
            digits = "".join(ch for ch in article if ch.isdigit())
            next_value = int(digits or "0") + 1
            return f"{prefix}{next_value}"
