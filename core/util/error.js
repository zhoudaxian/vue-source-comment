/*
 * @Author: Arthur
 * @Date: 2020-04-09 21:46:44
 * @Last Modified by: Arthur
 * @Last Modified time: 2020-04-09 22:02:40
 */
/* @flow */

import config from "../config";
import { warn } from "./debug";
import { inBrowser, inWeex } from "./env";
import { isPromise } from "shared/util";
import { pushTarget, popTarget } from "../observer/dep";

export function handleError(err: Error, vm: any, info: string) {
  // Deactivate deps tracking while processing error handler to avoid possible infinite rendering.
  // See: https://github.com/vuejs/vuex/issues/1505

  // 将Dep.target设为undefined
  pushTarget();

  // 将错误跑向全局 交由globalHandleError处理
  try {
    if (vm) {
      let cur = vm;
      while ((cur = cur.$parent)) {
        const hooks = cur.$options.errorCaptured;
        if (hooks) {
          for (let i = 0; i < hooks.length; i++) {
            try {
              const capture = hooks[i].call(cur, err, vm, info) === false;
              if (capture) return;
            } catch (e) {
              globalHandleError(e, cur, "errorCaptured hook");
            }
          }
        }
      }
    }
    globalHandleError(err, vm, info);
  } finally {
    // globalHandleError处理错误以后，将之前设置Dep.target为undefined的值去掉
    popTarget();
  }
}

export function invokeWithErrorHandling(
  handler: Function,
  context: any,
  args: null | any[],
  vm: any,
  info: string
) {
  let res;
  try {
    res = args ? handler.apply(context, args) : handler.call(context);
    if (res && !res._isVue && isPromise(res) && !res._handled) {
      res.catch((e) => handleError(e, vm, info + ` (Promise/async)`));
      // issue #9511
      // avoid catch triggering multiple times when nested calls
      res._handled = true;
    }
  } catch (e) {
    handleError(e, vm, info);
  }
  return res;
}

function globalHandleError(err, vm, info) {
  if (config.errorHandler) {
    try {
      return config.errorHandler.call(null, err, vm, info);
    } catch (e) {
      // if the user intentionally throws the original error in the handler,
      // do not log it twice
      if (e !== err) {
        logError(e, null, "config.errorHandler");
      }
    }
  }
  logError(err, vm, info);
}

function logError(err, vm, info) {
  if (process.env.NODE_ENV !== "production") {
    warn(`Error in ${info}: "${err.toString()}"`, vm);
  }
  /* istanbul ignore else */
  if ((inBrowser || inWeex) && typeof console !== "undefined") {
    console.error(err);
  } else {
    throw err;
  }
}
