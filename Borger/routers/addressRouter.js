const sqlite3 = require('sqlite3');
const {dbLocation, port} = require('../config');
const router = require('express').Router();
const axios = require('axios');

const db = new sqlite3.Database(dbLocation);
db.get("PRAGMA foreign_keys = ON");

/**
 * An Address
 * @typedef {{id: number, borgerUserId: number, createdAt: Date, isValid: boolean}} Address
 */

// address create
router.post('/', (req, res) => {
    const {borgerUserId} = req.body;
    if (borgerUserId === undefined) {
        return res.sendStatus(400);
    }

    const query = `INSERT INTO main.Address(BorgerUserId)
                   VALUES (?)`;
    db.run(query, [borgerUserId], (err) => {
        if (err) {
            console.log(err);
            if (err.errno === 19) { // SQLITE_CONSTRAINT
                return res.status(400).send(`BorgerUser with id "${borgerUserId}" does not exist.`);
            }
            return res.sendStatus(500);
        }

        console.log(`address for BorgerUser '${borgerUserId}' added`);
        res.sendStatus(204);
    });
});

// address read all
router.get('/', (req, res) => {
    const query = `SELECT *
                   FROM main.Address`;
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

// address read one
router.get('/:id', (req, res) => {
    const query = `SELECT * FROM main.Address WHERE Id=${req.params.id}`;
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

// address update
router.patch('/:id', async (req, res) => {
    const {borgerUserId} = req.body;
    const {id} = req.params;

    if (borgerUserId === undefined) {
        return res.sendStatus(400);
    }

    try {
        await axios.get(`http://localhost:${port}/address/${id}`);
    } catch (e) {
        console.log(e);
        if (e.response.status === 404) {
            console.log(`found no Address with id "${id}"`);
            return res.sendStatus(404);
        }
        return res.sendStatus(500);
    }

    const query = `UPDATE main.Address
                   SET BorgerUserId = ?
                   WHERE Id = ?`;
    db.run(query, [borgerUserId, id], (err) => {
        if (err) {
            console.log(err);
            if (err.errno === 19) { // SQLITE_CONSTRAINT
                return res.status(400).send(`BorgerUser with id "${borgerUserId}" does not exist.`);
            }
            return res.sendStatus(500);
        }

        res.sendStatus(204);
    });
});

// address delete
router.delete('/:id', async (req, res) => {
    const {id} = req.params;
    try {
        await axios.get(`http://localhost:${port}/address/${id}`);
    } catch (e) {
        console.log(e);
        if (e.response.status === 404) {
            console.log(`found no Address with id "${id}"`);
            return res.sendStatus(404);
        }
        return res.sendStatus(500);
    }

    const query = `DELETE
                   FROM main.Address
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