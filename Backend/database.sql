-- =============================================
-- FinVest AI — MySQL Database Setup
-- Run: mysql -u root -p < database.sql
-- =============================================

--CREATE DATABASE IF NOT EXISTS finvest_ai;
--USE finvest_ai;

-- Users table with OTP verification fields
--CREATE TABLE IF NOT EXISTS users (
--   id              INT AUTO_INCREMENT PRIMARY KEY,
--    first_name      VARCHAR(100) NOT NULL,
--    last_name       VARCHAR(100) NOT NULL,
--    email           VARCHAR(255) NOT NULL UNIQUE,
--    password        VARCHAR(255) NOT NULL,
--    otp_code        VARCHAR(10)  DEFAULT NULL,
--    otp_expiry      DATETIME     DEFAULT NULL,
--    is_verified     BOOLEAN      DEFAULT FALSE,
--    created_at      DATETIME     DEFAULT CURRENT_TIMESTAMP
--);

-- Stocks portfolio table
--CREATE TABLE IF NOT EXISTS stocks (
--    id              INT AUTO_INCREMENT PRIMARY KEY,
--    user_id         INT NOT NULL,
--    stock_name      VARCHAR(50)  NOT NULL,
--    quantity        INT          NOT NULL,
--    purchase_price  DECIMAL(12,2) NOT NULL,
--    purchase_date   DATE         NOT NULL,
--    created_at      DATETIME     DEFAULT CURRENT_TIMESTAMP,
--    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
--);

-- Risk predictions table
--CREATE TABLE IF NOT EXISTS risk_predictions (
--    id              INT AUTO_INCREMENT PRIMARY KEY,
--    stock_id        INT NOT NULL,
--    risk_score      DECIMAL(5,2) NOT NULL,
--    risk_level      ENUM('Low','Medium','High') NOT NULL,
--    created_at      DATETIME     DEFAULT CURRENT_TIMESTAMP,
--    FOREIGN KEY (stock_id) REFERENCES stocks(id) ON DELETE CASCADE
--);







-- Users table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    otp_code TEXT,
    otp_expiry DATETIME,
    is_verified BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Stocks portfolio table
CREATE TABLE stocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    stock_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    purchase_price REAL NOT NULL,
    purchase_date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Risk predictions table
CREATE TABLE risk_predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stock_id INTEGER NOT NULL,
    risk_score REAL NOT NULL,
    risk_level TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (stock_id) REFERENCES stocks(id) ON DELETE CASCADE
);

-- AI Opportunity Alerts table
CREATE TABLE IF NOT EXISTS opportunity_alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    stock_symbol TEXT NOT NULL,
    signal_type TEXT NOT NULL,
    score REAL NOT NULL,
    expected_profit_min REAL NOT NULL,
    expected_profit_max REAL NOT NULL,
    reasoning TEXT NOT NULL,
    current_price REAL NOT NULL,
    risk_level TEXT NOT NULL,
    notified_at DATETIME,
    is_read BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);