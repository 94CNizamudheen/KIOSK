CREATE TABLE `orders` (
	`order_id` text PRIMARY KEY NOT NULL,
	`order_number` text NOT NULL,
	`status` text NOT NULL,
	`items_json` text NOT NULL DEFAULT '[]',
	`subtotal` real NOT NULL,
	`tax` real NOT NULL,
	`total` real NOT NULL,
	`origin_terminal_id` text NOT NULL,
	`origin_type` text NOT NULL,
	`owner_terminal_id` text,
	`owner_type` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`expires_at` integer NOT NULL,
	`completed_at` integer,
	`payment_method` text,
	`notes` text
);

CREATE INDEX IF NOT EXISTS `idx_orders_order_number` ON `orders` (`order_number`);
CREATE INDEX IF NOT EXISTS `idx_orders_status` ON `orders` (`status`);
