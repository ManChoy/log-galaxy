const koa = require('koa');
const winston = require('winston');
const debug = require('koa-logger');
const app = new koa();

const logger = new (winston.Logger)({
  level: 'debug',
    //format: winston.format.json(),
  transports: [
      new (winston.transports.Http)({
          host: 'localhost',
          port: '3000',
          path: '/incoming-http',
          data: 'some-random-data',
      }),
      new (winston.transports.Console),
  ]
});
//app.use(debug());
app.use(async ctx => {
    logger.debug("hello");
    console.log("CONSOLE");
    ctx.body = 'Server is running on port 3001';
});

app.listen(3001);
