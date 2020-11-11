const sqlite3 = require('sqlite3');
const {dbLocation} = require('../config');
const router = require('express').Router();
const axios = require('axios');
const {port} = require('../config');

const db = new sqlite3.Database(dbLocation);
db.get("PRAGMA foreign_keys = ON");

router.post('/add-deposit', async (req, res) => {
    const {amount, bankUserId} = req.body;

    if (amount === undefined || bankUserId === undefined) {
        return res.sendStatus(400);
    }

    if (amount <= 0) {
        return res.status(400).send("'amount' cannot be zero or negative");
    }

    try {
        await axios.get(`http://localhost:${port}/bankUser/${bankUserId}`);
    } catch (e) {
        console.log(e);
        if (e.response.status === 404) {
            console.log(`found no BankUser with id "${bankUserId}"`);
            return res.sendStatus(400);
        }
        return res.sendStatus(500);
    }

    let resInterestRate;
    try {
        resInterestRate = await axios.post(`http://localhost:7071/api/InterestRate`, {amount: amount});
    } catch (e) {
        console.log(e);
        return res.sendStatus(500);
    }
    console.log(resInterestRate);
    const interestAmount = resInterestRate.data.amount;

    const depositQuery = "INSERT INTO Deposit(bankuserid, amount) VALUES (?, ?)";

    try {
        await new Promise((resolve, reject) => {
            db.run(depositQuery, [bankUserId, interestAmount], err => {
                if (err) {
                    reject(new Error(err));
                } else {
                    resolve(true);
                }
            })
        });
    } catch (e) {
        console.log(e);
        return res.sendStatus(500);
    }

    return res.sendStatus(204);
})

router.get('/list-deposits', async (req, res) => {
    const {bankUserId} = req.body;

    if (bankUserId === undefined) {
        return res.sendStatus(400);
    }

    try {
        await axios.get(`http://localhost:${port}/bankUser/${bankUserId}`);
    } catch (e) {
        console.error(e);
        if (e.response.status === 404) {
            console.log(`found no BankUser with id "${bankUserId}"`);
            return res.sendStatus(400);
        }
        return res.sendStatus(500);
    }

    const depositsQuery = "SELECT * FROM Deposit WHERE BankUserId = ?";

    let depositList;
    try {
        depositList = await new Promise((resolve, reject) => {
            db.all(depositsQuery, [bankUserId], (err, rows) => {
                if (err) {
                    reject(new Error(err));
                } else {
                    resolve(rows);
                }
            })
        });
    } catch (e) {
        console.log(e);
        return res.sendStatus(500);
    }

    return res.send(depositList);
})

router.post('/create-loan', async (req, res) => {
    const {bankUserId, loanAmount} = req.body;

    if (bankUserId === undefined || loanAmount === undefined) {
        console.log(`invalid parameters: bankUserId='${bankUserId}', loanAmount='${loanAmount}'`)
        return res.sendStatus(400);
    }

    try {
        await axios.get(`http://localhost:${port}/bankUser/${bankUserId}`);
    } catch (e) {
        console.error(e);
        if (e.response.status === 404) {
            console.log(`found no BankUser with id "${bankUserId}"`);
            return res.sendStatus(400);
        }
        return res.sendStatus(500);
    }

    let account;
    try {
        // console.log(axiosResponse.data);
        account = (await axios.get(`http://localhost:${port}/account`))
            .data.filter(account => account.BankUserId === parseInt(bankUserId))[0];
    } catch (e) {
        console.error(e);
        if (e.response.status === 404) {
            console.log(`found no account for BankUser with id "${bankUserId}"`);
            return res.sendStatus(400);
        }
        return res.sendStatus(500);
    }

    let resLoanAlgo;
    try {
        resLoanAlgo = await axios.post(`http://localhost:7071/api/LoanAlgo`, {
            loanAmount: loanAmount,
            accountAmount: account.Amount
        });
    } catch (e) {
        const {status, data} = e.response;
        if (status !== 403) {
            console.log(e);
            return res.sendStatus(500);
        }
        resLoanAlgo = {status, data};
    }

    if (resLoanAlgo.status === 403) {
        return res.status(403).send(resLoanAlgo.data);
    } else if (resLoanAlgo.status !== 200) {
        return res.sendStatus(500);
    }

    const loanSelectQuery = "SELECT * FROM Loan WHERE BankUserId = ?";
    const loanInsertQuery = "INSERT INTO Loan (BankUserId, Amount) VALUES (?, ?)";
    const loanUpdateQuery = "UPDATE Loan SET Amount = ?, ModifiedAt = CURRENT_TIMESTAMP WHERE BankUserId = ?";

    let loan;
    try {
        loan = await new Promise((resolve, reject) => {
            db.get(loanSelectQuery, [bankUserId], (err, row) => {
                if (err) {
                    reject(new Error(err));
                } else {
                    resolve(row);
                }
            })
        });
    } catch (e) {
        console.log(e);
        return res.sendStatus(500);
    }

    if (loan === undefined) {
        db.run(loanInsertQuery, [bankUserId, loanAmount], err => {
            if (err) {
                res.sendStatus(500);
            } else {
                res.sendStatus(204);
            }
        });
    } else {
        db.run(loanUpdateQuery, [loanAmount, bankUserId], err => {
            if (err) {
                res.sendStatus(500);
            } else {
                res.sendStatus(204);
            }
        });
    }
})

module.exports = router;