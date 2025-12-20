DROP DATABASE IF EXISTS skilltracker;
CREATE DATABASE skilltracker;
USE skilltracker;

CREATE TABLE category (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE skill (
    skill_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(80) NOT NULL,
    category_id_fk INT NOT NULL,
    current_level TINYINT NOT NULL,
    target_level TINYINT NOT NULL,
    priority ENUM('Low','Medium','High') NOT NULL DEFAULT 'Medium',
    note VARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_skill_category
        FOREIGN KEY (category_id_fk) REFERENCES category(category_id)
            ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT chk_level_current CHECK (current_level BETWEEN 1 AND 5),
    CONSTRAINT chk_level_target CHECK (target_level BETWEEN 1 AND 5)
);

CREATE TABLE study_log (
    study_log_id INT AUTO_INCREMENT PRIMARY KEY,
    skill_id_fk INT NOT NULL,
    study_date DATE NOT NULL,
    minutes INT NOT NULL,
    note VARCHAR(255),

    CONSTRAINT fk_log_skill
        FOREIGN KEY (skill_id_fk) REFERENCES skill(skill_id)
            ON UPDATE CASCADE ON DELETE CASCADE,
    
    CONSTRAINT chk_minutes CHECK (minutes > 0 AND minutes <= 1440)
);

CREATE INDEX idx_log_date ON study_log(study_date);
CREATE INDEX idx_log_skill ON study_log(skill_id_fk);