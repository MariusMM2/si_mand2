-- SQLite
PRAGMA FOREIGN_KEYS = ON;

DROP TABLE IF EXISTS Account;
DROP TABLE IF EXISTS Loan;
DROP TABLE IF EXISTS Deposit;
DROP TABlE IF EXISTS BankUser;
CREATE TABLE BankUser
(
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    UserId INTEGER NOT NULL,
    CreatedAt DATE DEFAULT CURRENT_TIMESTAMP,
    ModifiedAt DATE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Loan
(
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    BankUserId INTEGER NOT NULL,
    CreatedAt DATE DEFAULT CURRENT_TIMESTAMP,
    ModifiedAt DATE DEFAULT CURRENT_TIMESTAMP,
    Amount INTEGER NOT NULL,
    FOREIGN KEY (BankUserId) REFERENCES BankUser(Id)
);

CREATE TABLE Account
(
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    BankUserId INTEGER NOT NULL UNIQUE,
    AccountNo TEXT NOT NULL,
    IsStudent BOOLEAN NOT NULL,
    CreatedAt DATE DEFAULT CURRENT_TIMESTAMP,
    ModifiedAt DATE DEFAULT CURRENT_TIMESTAMP,
    InterestRate INTEGER NOT NULL,
    Amount INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (BankUserId) REFERENCES BankUser (Id)

);

CREATE TABLE Deposit 
(
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    BankUserId INTEGER NOT NULL,
    CreatedAt DATE DEFAULT CURRENT_TIMESTAMP,
    Amount INTEGER NOT NULL,
    FOREIGN KEY (BankUserId) REFERENCES BankUser (Id)
);

INSERT INTO BankUser (UserId)
VALUES (0), (1), (2), (3);

INSERT INTO Loan (BankUserId, Amount)
VALUES (1, 100), (1, 200), (1, 500), (2, 300), (2, 340), (3, 950);

INSERT INTO Deposit (BankUserId, Amount)
VALUES (1, 60), (1, 950), (2, 52), (2, 591);

INSERT INTO Account (BankUserId, AccountNo, IsStudent, InterestRate, Amount)
VALUES (1, '7273', FALSE, 3, 400), (2, '8126', FALSE, 2, 850), (3, '1641', TRUE, 4, 461);