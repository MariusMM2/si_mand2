const express = require('express');
const bodyParser = require('body-parser');
const borgerUserRouter = require('./routers/borgerUserRouter');
// const addressRouter = require('./routers/addressRouter');
const {port} = require('./config');

const app = express();

app.use(bodyParser.json());

app.use('/borgerUser', borgerUserRouter);
// app.use('/address', addressRouter);

app.listen(port, () => {
    console.log(`listening on ${port}`);
});