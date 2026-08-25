 
// eslint-disable-file no-console
const isProd = import.meta.env.PROD;

export const logger = {
  log: (...args: unknown[]): void => {
    if (!isProd) console.log(...args);
  },
  error: (...args: unknown[]): void => {
    if (!isProd) console.error(...args);
  },
  warn: (...args: unknown[]): void => {
    if (!isProd) console.warn(...args);
  },
  info: (...args: unknown[]): void => {
    if (!isProd) console.info(...args);
  },
  debug: (...args: unknown[]): void => {
    if (!isProd) console.debug(...args);
  },
};