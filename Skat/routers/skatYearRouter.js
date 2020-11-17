const sqlite3 = require('sqlite3');
const {dbLocation} = require('../config');
const router = require('express').Router();

const db = new sqlite3.Database(dbLocation);
db.get("PRAGMA foreign_keys = ON");

/**
 * A SkatYear
 * @typedef {{id: number, label: string, createdAt: Date, modifiedAt: Date, startDate: Date, endDate: Date}} SkatYear
 */

// skatYear create
router.post('/', (req, res) => {
    let {label, startDate, endDate} = req.body;
    if (label === undefined || startDate === undefined || endDate === undefined) {
        return res.sendStatus(400);
    }

    const query = `INSERT INTO main.SkatYear(Label, StartDate, EndDate)
                   VALUES (?, ?, ?)`;

    db.run(query, [label, startDate, endDate], (err) => {
        if (err) {
            console.log(err);
            return res.sendStatus(500);
        }

        console.log(`skatYear '${label}' added`);
        res.sendStatus(201);
    });
});

// skatYear read all
router.get('/', (req, res) => {
    const query = `SELECT *
                   FROM main.SkatYear`;
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

// skatYear read one
router.get('/:id', (req, res) => {
    const query = `SELECT *
                   FROM main.SkatYear
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

// skatYear update
router.patch('/:id', (req, res) => {
    const {label, startDate, endDate} = req.body;

    if (label === startDate === endDate === undefined) {
        return res.sendStatus(400);
    }

    let query = "UPDATE main.SkatYear SET ModifiedAt = CURRENT_TIMESTAMP";
    let args = [];

    if (label !== undefined) {
        query += ', Label = ?';
        args.push(label);
    }
    if (startDate !== undefined) {
        query += ', StartDate = ?';
        args.push(startDate);
    }
    if (endDate !== undefined) {
        query += ', EndDate = ?';
        args.push(endDate);
    }

    query += ' WHERE Id = ?';
    args.push(req.params.id);

    db.run(query, args, (err) => {
        if (err) {
            console.log(err);
            return res.sendStatus(500);
        }

        res.sendStatus(204);
    });
});

// skatYear delete
router.delete('/:id', (req, res) => {
    const query = `DELETE
                   FROM main.SkatYear
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