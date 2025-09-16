/* eslint-disable no-console */

const LEVEL_PRIORITY = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

/** @typedef {'error' | 'warn' | 'info' | 'debug'} LogLevel */

let activeLevel = 'info';

const isValidLevel = (level) => Object.prototype.hasOwnProperty.call(LEVEL_PRIORITY, level);

const shouldLog = (level) => LEVEL_PRIORITY[level] <= LEVEL_PRIORITY[activeLevel];

const formatMessage = (level, namespace, message) => {
  const time = new Date().toISOString();
  const scope = namespace ? ` [${namespace}]` : '';
  return `[${time}] [${level.toUpperCase()}]${scope} ${message}`;
};

const getConsoleWriter = (level) => {
  switch (level) {
    case 'error':
      return console.error.bind(console);
    case 'warn':
      return console.warn.bind(console);
    case 'info':
      return (console.info ?? console.log).bind(console);
    case 'debug':
    default:
      return (console.debug ?? console.log).bind(console);
  }
};

const normalizeOverlayPayload = (payload) => {
  if (!payload) {
    return payload;
  }
  if (payload instanceof Error) {
    return {
      name: payload.name,
      message: payload.message,
      stack: payload.stack ?? undefined,
    };
  }
  if (Array.isArray(payload)) {
    return payload.map((entry) => normalizeOverlayPayload(entry));
  }
  if (typeof payload === 'object') {
    const normalized = { ...payload };
    for (const [key, value] of Object.entries(normalized)) {
      if (value instanceof Error) {
        normalized[key] = {
          name: value.name,
          message: value.message,
          stack: value.stack ?? undefined,
        };
      }
    }
    return normalized;
  }
  return payload;
};

const pushToDebugOverlay = (level, namespace, message, payload) => {
  if (typeof window === 'undefined') {
    return;
  }
  const api = window.deadTrainDebug;
  if (!api || typeof api.log !== 'function') {
    return;
  }
  const scopedMessage = namespace ? `${namespace}.${message}` : message;
  const overlayLevel = level === 'debug' ? 'info' : level;
  try {
    api.log(scopedMessage, normalizeOverlayPayload(payload), overlayLevel);
  } catch (error) {
    // Swallow overlay errors to avoid recursive logging loops.
  }
};

const logWithLevel = (level, namespace, message, payload) => {
  if (!isValidLevel(level) || !shouldLog(level)) {
    return;
  }
  const writer = getConsoleWriter(level);
  const line = formatMessage(level, namespace, message);
  if (payload !== undefined) {
    writer(line, payload);
  } else {
    writer(line);
  }
  pushToDebugOverlay(level, namespace, message, payload);
};

/**
 * @param {LogLevel} level
 */
export const setLogLevel = (level) => {
  if (!isValidLevel(level)) {
    console.warn(formatMessage('warn', 'core.logging', `Invalid log level "${level}" requested`));
    return;
  }
  activeLevel = level;
};

export const getLogLevel = () => activeLevel;

export const createLogger = (namespace) => {
  const scope = namespace ?? '';
  return {
    /**
     * @param {string} message
     * @param {*} [payload]
     */
    debug(message, payload) {
      logWithLevel('debug', scope, message, payload);
    },
    /**
     * @param {string} message
     * @param {*} [payload]
     */
    info(message, payload) {
      logWithLevel('info', scope, message, payload);
    },
    /**
     * @param {string} message
     * @param {*} [payload]
     */
    warn(message, payload) {
      logWithLevel('warn', scope, message, payload);
    },
    /**
     * @param {string} message
     * @param {*} [payload]
     */
    error(message, payload) {
      logWithLevel('error', scope, message, payload);
    },
    child(childScope) {
      return createLogger(scope ? `${scope}.${childScope}` : childScope);
    },
  };
};

export const logger = createLogger('app');

