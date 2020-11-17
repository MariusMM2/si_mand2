-- SQLite
PRAGMA FOREIGN_KEYS = ON;

DROP TABLE IF EXISTS SkatUserYear;
DROP TABLE IF EXISTS SkatYear;
DROP TABLE IF EXISTS SkatUser;
CREATE TABLE SkatUser
(
    Id        INTEGER PRIMARY KEY AUTOINCREMENT,
    UserId    INTEGER NOT NULL,
    CreatedAt DATE    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    IsActive  BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE SkatYear
(
    Id         INTEGER PRIMARY KEY AUTOINCREMENT,
    Label      TEXT NOT NULL,
    CreatedAt  DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ModifiedAt DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    StartDate  DATE NOT NULL,
    EndDate    DATE NOT NULL
);

CREATE TABLE SkatUserYear
(
    Id         INTEGER PRIMARY KEY AUTOINCREMENT,
    SkatUserId INTEGER NOT NULL,
    SkatYearId INTEGER NOT NULL,
    UserId     INTEGER NOT NULL,
    IsPaid     BOOLEAN NOT NULL DEFAULT FALSE,
    Amount     INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (SkatUserId) REFERENCES SkatUser (Id),
    FOREIGN KEY (SkatYearId) REFERENCES SkatYear (Id)
);

CREATE TRIGGER create_user_years
    AFTER INSERT
    ON SkatYear
    FOR EACH ROW
BEGIN
    INSERT INTO SkatUserYear(SkatUserId, SkatYearId, UserId)
    SELECT SkatUser.Id, NEW.Id, SkatUser.UserId FROM SkatUser;
END;

INSERT INTO SkatUser (UserId)
VALUES (0),
       (1),
       (2),
       (3);

INSERT INTO SkatYear (Label, StartDate, EndDate)
VALUES (STRFTIME('%Y', 'now'), DATE('now', '+1 month', 'start of month'),
        DATE('now', '+1 month', 'start of month', '+1 year')),
       ('2019', DATE('2019-04-01'), DATE('2020-04-01')),
       ('2018', DATE('2018-04-01'), DATE('2019-04-01'));