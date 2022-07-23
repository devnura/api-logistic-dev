const moment = require("moment");
const winston = require("winston");
require('winston-daily-rotate-file');
const { combine, timestamp, printf, colorize, align, json } = winston.format;

const logLevels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5,
};
let logger;

//
// Replaces the previous transports with those in the
// new configuration wholesale.
//
// const DailyRotateFile = require("winston-daily-rotate-file");
// logger.configure({
//   level: "verbose",
//   transports: [new DailyRotateFile()],
// });

// const fileRotateTransport = new winston.transports.DailyRotateFile({
//   filename: "./%DATE%-onlinetopup.log",
//   datePattern: "YYYY-MM-DD",
//   maxFiles: "1d",
// });

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV == "production") {
  let logger = winston.createLogger({
    levels: logLevels,
    level: process.env.LOG_LEVEL || "info",
    exitOnError: false,
    //   format: combine(timestamp(), json()),
    format: combine(
      // colorize({ all: true }),
      timestamp({
        format: "YYYY-MM-DD HH:mm:ss.SSS",
      }),
      align(),
      printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
    ),
    defaultMeta: { service: "project-service" },
    transports: [
      // fileRotateTransport,
      //
      // - Write all logs with importance level of `error` or less to `error.log`
      // - Write all logs with importance level of `info` or less to `onlinetopup.log`
      //
      new winston.transports.File({
        filename: `app/logs/error.log`,
        level: "error",
      }),
      new winston.transports.File({
        filename: `app/logs/${moment().format("YYYY-MM-DD")}-project.log`,
      }),
    ],
  });
} else {
  logger = winston.createLogger({
    levels: logLevels,
    level: process.env.LOG_LEVEL || "info",
    exitOnError: false,
    //   format: combine(timestamp(), json()),
    format: combine(
      // colorize({ all: true }),
      timestamp({
        format: "YYYY-MM-DD HH:mm:ss.SSS",
      }),
      align(),
      printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
    ),
    defaultMeta: { service: "project-service" },
    transports: [
      // fileRotateTransport,
      //
      // - Write all logs with importance level of `error` or less to `error.log`
      // - Write all logs with importance level of `info` or less to `onlinetopup.log`
      //
      new winston.transports.File({
        filename: `app/logs/error.log`,
        level: "error",
      }),
      new winston.transports.File({
        filename: `app/logs/debug/${moment().format("YYYY-MM-DD")}.log`,
        level: "debug",
      }),
      new winston.transports.File({
        filename: `app/logs/${moment().format("YYYY-MM-DD")}-project.log`,
      }),
    ],
  });

  logger.add(
    new winston.transports.Console({
      //   format: winston.format.cli(),
      format: combine(
        colorize({ all: true }),
        timestamp({
          format: "YYYY-MM-DD HH:mm:ss.SSS",
        }),
        align(),
        printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
      ),
    })
  );
}

module.exports = {
  logger,
};
