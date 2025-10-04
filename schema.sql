-- Optional: run this manually if you prefer creating schema via SQL instead of automatic creation.
CREATE DATABASE IF NOT EXISTS `lost_and_found`;
USE `lost_and_found`;

CREATE TABLE IF NOT EXISTS `lost_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `item_name` VARCHAR(255) NOT NULL,
  `color` VARCHAR(100) NOT NULL,
  `location` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `found_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `item_name` VARCHAR(255) NOT NULL,
  `color` VARCHAR(100) NOT NULL,
  `location` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `finder_contact` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
