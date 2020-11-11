const express = require('express');
const bodyParser = require('body-parser');
const bankUserRouter = require('./routers/bankUserRouter');
const accountRouter = require('./routers/accountRouter');
const indexRouter = require('./routers/indexRouter');
const {port} = require('./config');
const logging = require('morgan');

const app = express();

app.use(bodyParser.json());

app.use(logging());
app.use('/', indexRouter);
app.use('/bankUser', bankUserRouter);
app.use('/account', accountRouter);

app.listen(port, () => {
    console.log(`listening on ${port}`);
});