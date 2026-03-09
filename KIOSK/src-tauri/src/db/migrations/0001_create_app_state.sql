CREATE TABLE IF NOT EXISTS `app_state` (
    `key`   TEXT PRIMARY KEY NOT NULL,
    `value` TEXT NOT NULL
);

-- Seed defaults
INSERT OR IGNORE INTO `app_state` (`key`, `value`) VALUES ('position', 'DISTANCE');
