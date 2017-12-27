const koa = require('koa');
const mongoose = require('mongoose');
const convert = require('koa-convert');
const bodyParser = require('koa-bodyparser');
const router = require('koa-simple-router');
const error = require('koa-json-error');
const logger = require('koa-logger');
const koaRes = require('koa-res');
const handleError = require('koa-handle-error');
//const task = require('./controller/task');
const app = new koa();

/*
    Mongoose Config
*/
mongoose.Promise = require('bluebird');
mongoose
.connect('mongodb://localhost/test')
.then((response) => {
    console.log('mongo connection created');
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
})
// logging
app.use(logger())
// body parsing
app.use(bodyParser())
// format response as JSON
app.use(convert(koaRes()))
// configure router
app.use(router(_ => {
    _.get('/saysomething', async (ctx) => {
        ctx.body = 'hello world';
    }),
    _.get('/throwerror', async (ctx) => {
        throw new Error('Aghh! An error!');
    }),
    _.post('/incoming-http', async (ctx) => {
        ctx.body = 'post log received';
        saveLog(ctx);
        console.log(ctx.request.body);
    }),
    _.get('/incoming-http', async (ctx) => {
        ctx.body = 'get log received';
    })
        //    _.get('/tasks', task.getTasks),
        //    _.post('/task', task.createTask),
        //    _.put('/task', task.updateTask),
        //    _.delete('/task', task.deleteTask),
        //    _.post('/task/multi', task.createConcurrentTasks),
        //    _.delete('/task/multi', task.deleteConcurrentTasks)
}));

app.use(async ctx => {
    console.log("MAIN");
    ctx.body = 'Server is running on port 3000';
});

app.listen(3000);
