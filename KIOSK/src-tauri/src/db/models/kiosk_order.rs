use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OrderLineItem {
    #[serde(rename = "productId")]
    pub product_id: String,
    pub name: String,
    pub price: f64,
    pub qty: i64,
    pub subtotal: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TerminalIdentity {
    #[serde(rename = "terminalId")]
    pub terminal_id: String,
    #[serde(rename = "type")]
    pub terminal_type: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KioskOrder {
    #[serde(rename = "orderId")]
    pub order_id: String,
    #[serde(rename = "orderNumber")]
    pub order_number: String,
    pub status: String,
    pub items: Vec<OrderLineItem>,
    pub subtotal: f64,
    pub tax: f64,
    pub total: f64,
    #[serde(rename = "originTerminal")]
    pub origin_terminal: TerminalIdentity,
    #[serde(rename = "ownerTerminal")]
    pub owner_terminal: Option<TerminalIdentity>,
    #[serde(rename = "createdAt")]
    pub created_at: i64,
    #[serde(rename = "updatedAt")]
    pub updated_at: i64,
    #[serde(rename = "expiresAt")]
    pub expires_at: i64,
    #[serde(rename = "completedAt")]
    pub completed_at: Option<i64>,
    #[serde(rename = "paymentMethod")]
    pub payment_method: Option<String>,
    pub notes: Option<String>,
}
