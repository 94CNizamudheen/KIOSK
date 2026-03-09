use rusqlite::{params, Connection, Error as SqlError, Result as SqlResult};
use super::kiosk_order::{KioskOrder, OrderLineItem, TerminalIdentity};

fn row_to_order(row: &rusqlite::Row<'_>) -> rusqlite::Result<KioskOrder> {
    let items_json: String = row.get("items_json")?;
    let items: Vec<OrderLineItem> = serde_json::from_str(&items_json).unwrap_or_default();

    let owner_terminal_id: Option<String> = row.get("owner_terminal_id")?;
    let owner_terminal = if let Some(id) = owner_terminal_id {
        let owner_type: String = row.get("owner_type")?;
        Some(TerminalIdentity { terminal_id: id, terminal_type: owner_type })
    } else {
        None
    };

    Ok(KioskOrder {
        order_id: row.get("order_id")?,
        order_number: row.get("order_number")?,
        status: row.get("status")?,
        items,
        subtotal: row.get("subtotal")?,
        tax: row.get("tax")?,
        total: row.get("total")?,
        origin_terminal: TerminalIdentity {
            terminal_id: row.get("origin_terminal_id")?,
            terminal_type: row.get("origin_type")?,
        },
        owner_terminal,
        created_at: row.get("created_at")?,
        updated_at: row.get("updated_at")?,
        expires_at: row.get("expires_at")?,
        completed_at: row.get("completed_at")?,
        payment_method: row.get("payment_method")?,
        notes: row.get("notes")?,
    })
}

pub fn upsert_order(conn: &Connection, order: &KioskOrder) -> SqlResult<()> {
    let items_json = serde_json::to_string(&order.items).unwrap_or_default();
    conn.execute(
        "INSERT INTO orders (
            order_id, order_number, status, items_json,
            subtotal, tax, total,
            origin_terminal_id, origin_type,
            owner_terminal_id, owner_type,
            created_at, updated_at, expires_at,
            completed_at, payment_method, notes
        ) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17)
        ON CONFLICT(order_id) DO UPDATE SET
            status=excluded.status,
            items_json=excluded.items_json,
            subtotal=excluded.subtotal,
            tax=excluded.tax,
            total=excluded.total,
            owner_terminal_id=excluded.owner_terminal_id,
            owner_type=excluded.owner_type,
            updated_at=excluded.updated_at,
            expires_at=excluded.expires_at,
            completed_at=excluded.completed_at,
            payment_method=excluded.payment_method,
            notes=excluded.notes",
        params![
            order.order_id,
            order.order_number,
            order.status,
            items_json,
            order.subtotal,
            order.tax,
            order.total,
            order.origin_terminal.terminal_id,
            order.origin_terminal.terminal_type,
            order.owner_terminal.as_ref().map(|t| &t.terminal_id),
            order.owner_terminal.as_ref().map(|t| &t.terminal_type),
            order.created_at,
            order.updated_at,
            order.expires_at,
            order.completed_at,
            order.payment_method,
            order.notes,
        ],
    )?;
    Ok(())
}

pub fn get_order(conn: &Connection, order_id: &str) -> SqlResult<Option<KioskOrder>> {
    let mut stmt = conn.prepare("SELECT * FROM orders WHERE order_id = ?1")?;
    match stmt.query_row(params![order_id], |row| row_to_order(row)) {
        Ok(order) => Ok(Some(order)),
        Err(SqlError::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(e),
    }
}

pub fn get_active_orders(conn: &Connection) -> SqlResult<Vec<KioskOrder>> {
    let mut stmt = conn.prepare(
        "SELECT * FROM orders WHERE status NOT IN ('COMPLETED','CANCELLED','EXPIRED')",
    )?;
    let orders = stmt
        .query_map([], |row| row_to_order(row))?
        .filter_map(|r| r.ok())
        .collect();
    Ok(orders)
}

pub fn update_order_status(conn: &Connection, order_id: &str, status: &str) -> SqlResult<bool> {
    let now = chrono::Utc::now().timestamp_millis();
    let changes = conn.execute(
        "UPDATE orders SET status=?1, updated_at=?2 WHERE order_id=?3",
        params![status, now, order_id],
    )?;
    Ok(changes > 0)
}

pub fn mark_completed(
    conn: &Connection,
    order_id: &str,
    payment_method: Option<&str>,
) -> SqlResult<bool> {
    let now = chrono::Utc::now().timestamp_millis();
    let changes = conn.execute(
        "UPDATE orders SET status='COMPLETED', completed_at=?1, payment_method=?2, updated_at=?3 WHERE order_id=?4",
        params![now, payment_method, now, order_id],
    )?;
    Ok(changes > 0)
}

pub fn delete_order(conn: &Connection, order_id: &str) -> SqlResult<bool> {
    let changes = conn.execute("DELETE FROM orders WHERE order_id=?1", params![order_id])?;
    Ok(changes > 0)
}

/// Find a non-terminal order by its human-readable order number (e.g. "A047").
pub fn get_order_by_number(conn: &Connection, order_number: &str) -> SqlResult<Option<KioskOrder>> {
    let mut stmt = conn.prepare(
        "SELECT * FROM orders WHERE order_number = ?1 AND status NOT IN ('COMPLETED','CANCELLED','EXPIRED') LIMIT 1",
    )?;
    match stmt.query_row(params![order_number], |row| row_to_order(row)) {
        Ok(order) => Ok(Some(order)),
        Err(SqlError::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(e),
    }
}
