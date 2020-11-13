const sqlite3 = require('sqlite3');
const {dbLocation} = require('../config');
const router = require('express').Router();

const db = new sqlite3.Database(dbLocation);
db.get("PRAGMA foreign_keys = ON");

/**
 * A BorgerUser
 * @typedef {{id: number, userId: number, createdAt: Date}} BorgerUser
 */

// borgerUser create
router.post('/', (req, res) => {
    if (req.body.userId === undefined) {
        return res.sendStatus(400);
    }
    const query = `insert into main.BorgerUser(UserId)
                   values (?)`;
    console.log(query);
    db.run(query, [req.body.userId], (err) => {
        if (err) {
            console.log(err);
            return res.sendStatus(500);
        }

        console.log(`borgerUser '${req.body.userId}' added`);
        res.sendStatus(204);
    });
});

// borgerUser read all
router.get('/', (req, res) => {
    const query = `select *
                   from main.BorgerUser`;
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

// borgerUser read one
router.get('/:id', (req, res) => {
    const query = `select * from main.BorgerUser where Id=${req.params.id}`;
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

// borgerUser update
router.patch('/:id', (req, res) => {
    if (req.body.userId === undefined) {
        return res.sendStatus(400);
    }

    const query = `update main.BorgerUser
                   set UserId = ?
                   where Id = ?`;
    db.run(query, [req.body.userId, req.params.id], (err) => {
        if (err) {
            console.log(err);
            return res.sendStatus(500);
        }

        res.sendStatus(201);
    });
});

// borgerUser delete
router.delete('/:id', (req, res) => {
    const query = `delete
                   from main.BorgerUser
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