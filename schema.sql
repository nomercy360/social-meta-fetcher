-- sqlite3 schema.sql

CREATE table IF NOT EXISTS audio (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    path TEXT NOT NULL,
    duration INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO audio (name, path, duration) VALUES ('audio1', '/path/to/audio1', 10);
INSERT INTO audio (name, path, duration) VALUES ('audio2', '/path/to/audio2', 20);
INSERT INTO audio (name, path, duration) VALUES ('audio3', '/path/to/audio3', 30);
INSERT INTO audio (name, path, duration) VALUES ('audio4', '/path/to/audio4', 40);
INSERT INTO audio (name, path, duration) VALUES ('audio5', '/path/to/audio5', 50);
INSERT INTO audio (name, path, duration) VALUES ('audio6', '/path/to/audio6', 60);