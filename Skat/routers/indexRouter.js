const sqlite3 = require('sqlite3');
const {dbLocation} = require('../config');
const router = require('express').Router();
const axios = require('axios');

const db = new sqlite3.Database(dbLocation);
db.get("PRAGMA foreign_keys = ON");

router.post('/pay-taxes', async (req, res) => {
    const {userId, amount} = req.body;

    if (userId === undefined || amount === undefined) {
        return res.sendStatus(400);
    }

    const userYearSelectQuery = "SELECT * FROM SkatUserYear WHERE UserId = ?";

    let skatUserYear;
    try {
        skatUserYear = await new Promise((resolve, reject) => {
            db.get(userYearSelectQuery, [userId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    if (row === undefined) {
                        reject(404);
                    } else {
                        resolve(row);
                    }
                }
            });
        });
    } catch (e) {
        console.log("skatUserYearSelectQuery");
        console.log(e);
        if (e === 404) {
            return res.status(404).send(`SkatUserYear for user '${userId}' not found`);
        } else if (e.response) {
            console.log(e.response);
            return res.status(e.response.status).send(e.response.data);
        } else {
            console.log(e);
            return res.sendStatus(500);
        }
    }

    if (skatUserYear.Amount >= 0) {
        return res.status(403).send("No taxes need to be paid by this User.");
    }

    let taxAmount;
    try {
        taxAmount = (await axios.post('http://localhost:7071/api/Skat_Tax_Calculator', {money: amount}))
            .data['tax_money'];
    } catch (e) {
        console.log("taxAmount");
        console.log(e);
    }

    const skatUserYearUpdateQuery = `UPDATE SkatUserYear
                                     SET Amount = ?
                                     WHERE Id = ?`;

    try {
        await axios.patch('http://localhost:8000/bank/withdraw-money', {userId: userId, amount: taxAmount});
        await new Promise((resolve, reject) => {
            db.run(skatUserYearUpdateQuery, [skatUserYear.Amount + taxAmount, skatUserYear.Id], err => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            })
        })

        return res.sendStatus(204);
    } catch (e) {
        console.log("skatUserYearUpdateQuery");
        if (e.response) {
            console.log(e.response);
            return res.status(e.response.status).send(e.response.data);
        } else if (e.request) {
            console.log(e);
            return res.sendStatus(500);
        }
        console.log(e);
        return res.sendStatus(500);
    }
});

module.exports = router;