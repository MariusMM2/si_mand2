const sqlite3 = require('sqlite3');
const {dbLocation} = require('../config');
const router = require('express').Router();

const db = new sqlite3.Database(dbLocation);

// user create
router.post('/', (req, res) => {
    const {nemId, cpr, genderId, email} = req.body;

    if (nemId === undefined || cpr === undefined || genderId === undefined || email === undefined) {
        return res.sendStatus(400);
    }

    const query = `insert into main.User(NemId, Cpr, CreatedAt, ModifiedAt, GenderId, Email)
                   values (?, ?, ?, ?, ?, ?)`;
    db.run(query, [nemId, cpr, new Date(), new Date(), genderId, email], (err) => {
        if (err) {
            console.log(err);
            return res.sendStatus(403);
        }

        console.log(`user '${cpr}' added`);
        res.sendStatus(200);
    });
});

// user read all
router.get('/', (req, res) => {
    const query = `select *
                   from main.User`;
    db.all(query, (err, rows) => {
        if (err) {
            console.log(err);
            return res.status(403).send();
        } else if (rows === 0) {
            return res.sendStatus(404);
        }

        res.json({
            'users': rows
        })
    });
});

// user read one
router.get('/:id', (req, res) => {
    const query = `select * from main.User where Id=${req.params.id}`;
    db.get(query, (err, row) => {
        if (err) {
            console.log(err);
            return res.sendStatus(403);
        } else if (row === undefined) {
            return res.sendStatus(404);
        }

        res.json(row);
    });
});

// user update
router.put('/:id', (req, res) => {
    const {nemId, cpr, genderId, email} = req.body;
    const {id} = req.params;

    if (nemId === undefined || cpr === undefined || genderId === undefined || email === undefined) {
        return res.sendStatus(400);
    }

    const query = `update main.User
                   set NemId = ?,
                       Cpr = ?,
                       GenderId = ?,
                       Email = ?
                   where Id = ?`;
    db.run(query, [nemId, cpr, genderId, email, id], (err) => {
        if (err) {
            console.log(err);
            return res.sendStatus(403);
        }

        res.sendStatus(200);
    });
});

// user delete
router.delete('/:id', (req, res) => {
    const query = `delete
                   from main.User
                   where Id = ?`;
    db.run(query, [req.params.id], (err) => {
        if (err) {
            console.log(err);
            return res.sendStatus(403);
        }

        res.sendStatus(200);
    });
});

module.exports = router;