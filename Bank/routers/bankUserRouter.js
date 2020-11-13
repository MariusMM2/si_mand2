const sqlite3 = require('sqlite3');
const {dbLocation} = require('../config');
const router = require('express').Router();

const db = new sqlite3.Database(dbLocation);
db.get("PRAGMA foreign_keys = ON");

/**
 * A BankUser
 * @typedef {{id: number, userId: number, createdAt: Date, modifiedAt: Date}} BankUser
 */

// bankUser create
router.post('/', (req, res) => {
    if (req.body.userId === undefined) {
        return res.sendStatus(400);
    }
    const query = `insert into main.BankUser(UserId)
                   values (?)`;
    console.log(query);
    db.run(query, [req.body.userId], (err) => {
        if (err) {
            console.log(err);
            return res.sendStatus(500);
        }

        console.log(`bankUser '${req.body.userId}' added`);
        res.sendStatus(201);
    });
});

// bankUser read all
router.get('/', (req, res) => {
    const query = `select *
                   from main.BankUser`;
    db.all(query, (err, rows) => {
        if (err) {
            console.log(err);
            return res.status(500).send();
        } else if (rows === 0) {
            return res.sendStatus(404);
        }

        res.json(rows);
    });
});

// bankUser read one
router.get('/:id', (req, res) => {
    const query = `select * from main.BankUser where Id=${req.params.id}`;
    db.get(query, (err, row) => {
        if (err) {
            console.log(err);
            return res.sendStatus(500);
        } else if (row === undefined) {
            return res.sendStatus(404);
        }

        res.json(row);
    });
});

// bankUser update
router.patch('/:id', (req, res) => {
    if (req.body.userId === undefined) {
        return res.sendStatus(400);
    }

    const query = `update main.BankUser
                   set UserId = ?, ModifiedAt = CURRENT_TIMESTAMP
                   where Id = ?`;
    db.run(query, [req.body.userId, req.params.id], (err) => {
        if (err) {
            console.log(err);
            return res.sendStatus(500);
        }

        res.sendStatus(204);
    });
});

// bankUser delete
router.delete('/:id', (req, res) => {
    const query = `delete
                   from main.BankUser
                   where Id = ?`;
    db.run(query, [req.params.id], (err) => {
        if (err) {
            console.log(err);
            return res.sendStatus(500);
        }

        res.sendStatus(204);
    });
});

module.exports = router;