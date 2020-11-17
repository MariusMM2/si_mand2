const express = require('express');
const bodyParser = require('body-parser');
const skatUserRouter = require('./routers/skatUserRouter');
const skatYearRouter = require('./routers/skatYearRouter');
// const indexRouter = require('./routers/indexRouter');
const {port} = require('./config');
const logging = require('morgan');

const app = express();

app.use(bodyParser.json());

app.use(logging());
// app.use('/', indexRouter);
app.use('/user', skatUserRouter);
app.use('/year', skatYearRouter);

app.listen(port, () => {
    console.log(`listening on ${port}`);
});