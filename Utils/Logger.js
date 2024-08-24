//Logger
import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';


const fileTransport = new transports.DailyRotateFile({
  filename: 'Data/Logs/%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d'
});

const consoleTransport = new transports.Console({
  format: format.combine(
    format.colorize(),
    format.simple()
  )
});

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: [
    fileTransport,
    consoleTransport
  ]
});

export default logger;