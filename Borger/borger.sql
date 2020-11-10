PRAGMA FOREIGN_KEYS = ON;

DROP TABLE IF EXISTS BorgerUser;
CREATE TABLE BorgerUser
(
    Id        INTEGER PRIMARY KEY AUTOINCREMENT,
    UserId    INTEGER NOT NULL,
    CreatedAt DATE DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS Address;
CREATE TABLE Address
(
    Id           INTEGER PRIMARY KEY AUTOINCREMENT,
    BorgerUserId INTEGER NOT NULL,
    Address      TEXT NOT NULL, 
    CreatedAt    DATE             DEFAULT CURRENT_TIMESTAMP,
    IsValid      INTEGER NOT NULL DEFAULT TRUE,
    FOREIGN KEY (BorgerUserId) REFERENCES BorgerUser (Id) ON DELETE CASCADE
);

DROP TRIGGER IF EXISTS disable_old_addresses;
CREATE TRIGGER disable_old_addresses
    BEFORE INSERT
    ON Address
    FOR EACH ROW
BEGIN
    UPDATE Address SET IsValid = FALSE WHERE BorgerUserId = NEW.BorgerUserId;
END;

INSERT INTO BorgerUser(UserId)
VALUES (0),
       (1),
       (2),
       (3),
       (4);

INSERT INTO Address(BorgerUserId, Address)
VALUES (1, 'asd'),
       (1, 'asd'),
       (2, 'asd'),
       (2, 'asd'),
       (2, 'asd'),
       (3, 'asd');