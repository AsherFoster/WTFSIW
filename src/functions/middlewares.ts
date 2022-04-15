import type {WTFSIWFunction} from './types';
import {Storage} from './storage';
import {initSentry} from './sentry';
import {CF_KV_BINDING, ENVIRONMENT} from '../shared/config';
import {createErrorResponse} from './response';

export const sentryMiddleware: WTFSIWFunction = async (context) => {
  const {request, next} = context;
  const sentry = initSentry(request, context);

  try {
    return await next();
  } catch (e: any) {
    if (ENVIRONMENT !== 'production') console.error(e.stack);
    sentry.captureException(e);
    return createErrorResponse('ERR_INTERNAL_ERROR', 'Internal Error');
  }
};

export const storageMiddleware: WTFSIWFunction = async ({data, env, next}) => {
  data.storage = new Storage(env[CF_KV_BINDING]);
  return next();
};
