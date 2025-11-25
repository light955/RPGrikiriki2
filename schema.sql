CREATE DATABASE IF NOT EXISTS rpg_game;

USE rpg_game;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    player_id INT,
    currency INT DEFAULT 1000,
    hp INT DEFAULT 100,
    attack INT DEFAULT 10,
    defense INT DEFAULT 5,
    experience INT DEFAULT 0,
    level INT DEFAULT 1
);

-- Add currency column if it doesn't exist (for existing databases)
ALTER TABLE users ADD COLUMN IF NOT EXISTS currency INT DEFAULT 1000;
-- Add combat/level-up stats if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS hp INT DEFAULT 100;
ALTER TABLE users ADD COLUMN IF NOT EXISTS attack INT DEFAULT 10;
ALTER TABLE users ADD COLUMN IF NOT EXISTS defense INT DEFAULT 5;
ALTER TABLE users ADD COLUMN IF NOT EXISTS experience INT DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS level INT DEFAULT 1;

CREATE TABLE IF NOT EXISTS user_stocks (
    user_id INT NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, symbol),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);