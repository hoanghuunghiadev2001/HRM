/* eslint-disable @typescript-eslint/no-explicit-any */
export const logger = {
  info: (message: string, context?: any) => {
    console.log(`INFO: ${message}`, context || {});
  },
  warn: (message: string, context?: any) => {
    console.warn(`WARN: ${message}`, context || {});
  },
  error: (message: string, context?: any) => {
    console.error(`ERROR: ${message}`, context || {});
  },
  debug: (message: string, context?: any) => {
    console.debug(`DEBUG: ${message}`, context || {});
  },
};
