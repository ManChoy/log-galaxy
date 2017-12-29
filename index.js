'use strict';
const koa = require('koa');
const mongoose = require('mongoose');
const convert = require('koa-convert');
const bodyParser = require('koa-bodyparser');
const router = require('koa-simple-router');
const error = require('koa-json-error');
const logger = require('koa-logger');
const koaRes = require('koa-res');
const handleError = require('koa-handle-error');
const chalk = require('chalk');
const cors = require('koa2-cors');
const app = new koa();

/*
    Mongoose Config
*/
mongoose.Promise = require('bluebird');
mongoose
	.connect('mongodb://localhost/test', {
		useMongoClient: true,
	})
.then((response) => {
	//console.log('mongo connection created');
})
.catch((err) => {
    console.log("Error connecting to Mongo");
    console.log(err);
});

const LogSchema = mongoose.Schema = {
    message: String,
    level: String,
    raw: Object,
    created: Date,
};

const Log = mongoose.model('Log', LogSchema);

const saveLog = async (ctx) => {
    Log.create({
        message: ctx.request.body.params.message,
        level: ctx.request.body.params.level,
        raw: ctx.request.body.params,
        created: new Date(),
    });
}

/*
    Server Config
*/
// error handling
app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    ctx.status = err.status || 500
    ctx.body = err.message
    ctx.app.emit('error', err, ctx)
  }
});

app.use(cors({
    origin: 'http://localhost:8000',
    credentials: true,
}));

// logging
app.use(logger())
// body parsing
app.use(bodyParser())
// format response as JSON
app.use(convert(koaRes()))
// configure router
app.use(router(_ => {
    _.post('/incoming-http', async (ctx) => {
        ctx.body = 'post log received';
        saveLog(ctx);
        console.log(ctx.request.body);
    }),
    _.get('/logs', async (ctx) => {
        ctx.body = [
            {level: 'info', message: 'test 1'},
            {level: 'info', message: 'test 2'},
        ]
    })
}));

app.use(async ctx => {
    ctx.body = 'Server is running on port 3000';
});

app.listen(3000, () => {
	console.log("Log Galaxy server started and listened to port 3000");
	process.send({ok: true});
})
.on('error', (err) => {
    console.log(chalk.red("UNABLE TO START LOG GALAXY: ", err));
    process.send({ok: false, error: err});
    process.exit();
})
