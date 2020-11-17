const sqlite3 = require('sqlite3');
const {dbLocation} = require('../config');
const router = require('express').Router();

const db = new sqlite3.Database(dbLocation);
db.get("PRAGMA foreign_keys = ON");

/**
 * A SkatUser
 * @typedef {{id: number, userId: number, createdAt: Date, isActive: boolean}} SkatUser
 */

// skatUser create
router.post('/', (req, res) => {
    if (req.body.userId === undefined) {
        return res.sendStatus(400);
    }
    const query = `INSERT INTO main.SkatUser(UserId)
                   VALUES (?)`;

    db.run(query, [req.body.userId], (err) => {
        if (err) {
            console.log(err);
            return res.sendStatus(500);
        }

        console.log(`skatUser '${req.body.userId}' added`);
        res.sendStatus(201);
    });
});

// skatUser read all
router.get('/', (req, res) => {
    const query = `SELECT *
                   FROM main.SkatUser`;
    db.all(query, (err, rows) => {
        if (err) {
            console.log(err);
            return res.sendStatus(500);
        } else if (rows === 0) {
            return res.sendStatus(404);
        }

        res.json(rows);
    });
});

// skatUser read one
router.get('/:id', (req, res) => {
    const query = `SELECT *
                   FROM main.SkatUser
                   WHERE Id = ?`;

    db.get(query, [req.params.id], (err, row) => {
        if (err) {
            console.log(err);
            return res.sendStatus(500);
        } else if (row === undefined) {
            return res.sendStatus(404);
        }

        res.json(row);
    });
});

// skatUser update
router.patch('/:id', (req, res) => {
    const {userId, isActive} = req.body;

    let query = "UPDATE main.SkatUser ";
    let args = [];

    if (userId !== undefined && isActive !== undefined) {
        query += 'SET UserId = ?, IsActive = ? ';
        args.push(parseInt(userId), isActive === 'true');
    } else if (isActive !== undefined) {
        query += 'SET IsActive = ? ';
        args.push(isActive === 'true');
    } else if (userId !== undefined) {
        query += 'SET UserId = ? ';
        args.push(parseInt(userId));
    } else {
        return res.sendStatus(400);
    }

    query += 'WHERE Id = ?';
    args.push(req.params.id);

    db.run(query, args, (err) => {
        if (err) {
            console.log(err);
            return res.sendStatus(500);
        }

        res.sendStatus(204);
    });
});

// skatUser delete
router.delete('/:id', (req, res) => {
    const query = `DELETE
                   FROM main.SkatUser
                   WHERE Id = ?`;
    db.run(query, [req.params.id], (err) => {
        if (err) {
            console.log(err);
            return res.sendStatus(500);
        }

        res.sendStatus(204);
    });
});

module.exports = router;