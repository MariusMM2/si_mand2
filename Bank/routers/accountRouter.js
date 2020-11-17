const sqlite3 = require('sqlite3');
const {dbLocation, port} = require('../config');
const router = require('express').Router();
const axios = require('axios');

const db = new sqlite3.Database(dbLocation);
db.get("PRAGMA foreign_keys = ON");

/**
 * An Account
 * @typedef {{id: number, bankUserId: number, accountNo: string, isStudent: boolean, createdAt: Date, modifiedAt: Date, interestRate: number, amount: number}} Account
 */

// account create
router.post('/', (req, res) => {
    const {bankUserId, accountNo, isStudent, interestRate} = req.body;
    if (bankUserId === undefined || accountNo === undefined || isStudent === undefined || interestRate === undefined) {
        return res.sendStatus(400);
    }

    const query = `INSERT INTO main.Account(BankUserId, AccountNo, IsStudent, InterestRate)
                   VALUES (?, ?, ?, ?)`;
    db.run(query, [bankUserId, accountNo, isStudent, interestRate], (err) => {
        if (err) {
            console.log(err);
            if (err.errno === 19) { // SQLITE_CONSTRAINT
                return res.status(400).send(`BankUser with id "${bankUserId}" does not exist.`);
            }
            return res.sendStatus(500);
        }

        console.log(`account for  '${bankUserId}' added`);
        res.sendStatus(201);
    });
});

// account read all
router.get('/', (req, res) => {
    const query = `SELECT *
                   FROM main.Account`;
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

// account read one
router.get('/:id', (req, res) => {
    const query = `SELECT * FROM main.Account WHERE Id=${req.params.id}`;
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

// account update
router.patch('/:id', async (req, res) => {
    const {bankUserId, accountNo, isStudent, interestRate, amount} = req.body;
    const {id} = req.params;

    if (bankUserId === accountNo === isStudent === interestRate === amount === undefined) {
        return res.sendStatus(400);
    }

    try {
        await axios.get(`http://localhost:${port}/account/${id}`);
    } catch (e) {
        console.log(e);
        if (e.response.status === 404) {
            console.log(`found no Account with id "${id}"`);
            return res.sendStatus(404);
        }
        return res.sendStatus(500);
    }

    let query = "UPDATE main.Account SET ModifiedAt = CURRENT_TIMESTAMP";
    let args = [];

    if (bankUserId !== undefined) {
        query += ', BankUserId = ?';
        args.push(bankUserId);
    }
    if (accountNo !== undefined) {
        query += `, AccountNo = ?`;
        args.push(accountNo);
    }
    if (isStudent !== undefined) {
        query += `, IsStudent = ?`;
        args.push(isStudent === 'true');
    }
    if (interestRate !== undefined) {
        query += `, InterestRate = ?`;
        args.push(parseFloat(interestRate));
    }
    if (amount !== undefined) {
        query += `, Amount = ?`;
        args.push(parseInt(amount));
    }

    query += ' WHERE Id = ?';
    args.push(id);

    db.run(query, args, (err) => {
        if (err) {
            console.log(err);
            if (err.errno === 19) { // SQLITE_CONSTRAINT
                return res.status(400).send(`BankUser with id "${bankUserId}" does not exist.`);
            }
            return res.sendStatus(500);
        }

        res.sendStatus(204);
    });
});

// account delete
router.delete('/:id', async (req, res) => {
    const {id} = req.params;
    try {
        await axios.get(`http://localhost:${port}/account/${id}`);
    } catch (e) {
        console.log(e);
        if (e.response.status === 404) {
            console.log(`found no Account with id "${id}"`);
            return res.sendStatus(404);
        }
        return res.sendStatus(500);
    }

    const query = `DELETE
                   FROM main.Account
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