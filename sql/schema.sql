DROP DATABASE IF EXISTS skilltracker;
CREATE DATABASE skilltracker;
USE skilltracker;

CREATE TABLE category (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

