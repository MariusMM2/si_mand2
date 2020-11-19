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

    /**
     * A SkatUserYearSkatYearJoin
     * @typedef {{Id: number, StartDate: Date, EndDate: Date}} SkatUserYearSkatYearJoin
     */
    const userYearsSelectQuery = `
        SELECT SkatUserYear.Id, SkatYear.StartDate, SkatYear.EndDate
        FROM SkatUserYear
                 JOIN SkatYear ON SkatYear.Id = SkatUserYear.SkatYearId
        WHERE UserId = ?
          AND IsPaid = FALSE`;

    let skatUserYears;
    try {
        skatUserYears = await new Promise((resolve, reject) => {
            db.all(userYearsSelectQuery, [userId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    } catch (e) {
        console.log("skatUserYearSelectQuery");
        console.log(e);
        if (e.response) {
            console.log(e.response);
            return res.status(e.response.status).send(e.response.data);
        } else {
            return res.sendStatus(500);
        }
    }

    if (skatUserYears === undefined || skatUserYears.length === 0) {
        return res.status(403).send(`No unpaid tax years found for user '${userId}'`);
    }

    let skatUserYear = undefined;

    for (let i = 0; i < skatUserYears.length; i++) {
        const skatYear = skatUserYears[i];

        const currentDate = new Date();
        const startDate = new Date(skatYear.StartDate);
        const endDate = new Date(skatYear.EndDate);

        if (currentDate.getTime() > startDate.getTime() &&
            currentDate.getTime() < endDate.getTime()) {
            skatUserYear = skatYear;
            break;
        }
    }

    if (skatUserYear === undefined) {
        console.log("'skatUserYear' cannot be undefined");
        return res.sendStatus(500);
    }

    let taxAmount;
    try {
        taxAmount = (await axios.post('http://localhost:7071/api/Skat_Tax_Calculator', {money: amount}))
            .data['tax_money'];
    } catch (e) {
        console.log("taxAmount");
        console.log(e);
        return res.sendStatus(500);
    }

    const skatUserYearUpdateQuery = `UPDATE SkatUserYear
                                     SET IsPaid = TRUE,
                                         Amount = ?
                                     WHERE Id = ?`;

    try {
        await axios.patch('http://localhost:8000/bank/withdraw-money', {userId: userId, amount: taxAmount});
        await new Promise((resolve, reject) => {
            db.run(skatUserYearUpdateQuery, [taxAmount, skatUserYear.Id], err => {
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