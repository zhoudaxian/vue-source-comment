/*
 * @Author: Arthur
 * @Date: 2020-04-09 19:24:57
 * @Last Modified by: Arthur
 * @Last Modified time: 2020-04-09 21:41:49
 */
/* @flow */

import config from "../config";
import { noop } from "shared/util";
// function noop (a?: any, b?: any, c?: any) {}  noop主要是类型定义？？
export let warn = noop;
export let tip = noop;
export let generateComponentTrace = (noop: any); // work around flow check
export let formatComponentName = (noop: any);

// 如果是生成环境 prod
if (process.env.NODE_ENV !== "production") {
  const hasConsole = typeof console !== "undefined";

  const classifyRE = /(?:^|[-_])(\w)/g;

  const classify = (str) =>
    str.replace(classifyRE, (c) => c.toUpperCase()).replace(/[-_]/g, "");

  warn = (msg, vm) => {
    const trace = vm ? generateComponentTrace(vm) : "";

    if (config.warnHandler) {
      config.warnHandler.call(null, msg, vm, trace);
    } else if (hasConsole && !config.silent) {
      console.error(`[Vue warn]: ${msg}${trace}`);
    }
  };

  tip = (msg, vm) => {
    if (hasConsole && !config.silent) {
      console.warn(
        `[Vue tip]: ${msg}` + (vm ? generateComponentTrace(vm) : "")
      );
    }
  };

  /**
   * 格式化组件名称
   * @param vm
   * @param includeFile
   */
  formatComponentName = (vm, includeFile) => {
    // 如果当前组件是root组件
    if (vm.$root === vm) {
      return "<Root>";
    }

    /**
     * 取得组件的 options属性
     * 如果是函数组件，则直接取options
     * 如果是实例组件则取实例$option, 或向上取其constructor.options
     * 如果都不是则options为传入的vm
     */
    const options =
      typeof vm === "function" && vm.cid != null
        ? vm.options
        : vm._isVue
        ? vm.$options || vm.constructor.options
        : vm;

    let name = options.name || options._componentTag;
    const file = options.__file;

    // 格式化名称
    if (!name && file) {
      const match = file.match(/([^/\\]+)\.vue$/);
      name = match && match[1];
    }

    return (
      (name ? `<${classify(name)}>` : `<Anonymous>`) +
      (file && includeFile !== false ? ` at ${file}` : "")
    );
  };

  // 定义repeat方法 等同于string.repeat方法
  const repeat = (str, n) => {
    let res = "";
    while (n) {
      if (n % 2 === 1) res += str;
      if (n > 1) str += str;
      n >>= 1; // n>>1 约等于 n-1
    }
    return res;
  };

  /**
   * 子组件向上遍历至根节点(root)
   */
  generateComponentTrace = (vm) => {
    // 子组件
    if (vm._isVue && vm.$parent) {
      const tree = [];
      let currentRecursiveSequence = 0;

      while (vm) {
        if (tree.length > 0) {
          const last = tree[tree.length - 1];
          if (last.constructor === vm.constructor) {
            currentRecursiveSequence++;
            vm = vm.$parent;
            continue;
          } else if (currentRecursiveSequence > 0) {
            tree[tree.length - 1] = [last, currentRecursiveSequence];
            currentRecursiveSequence = 0;
          }
        }
        tree.push(vm);
        vm = vm.$parent;
      }
      return (
        "\n\nfound in\n\n" +
        tree
          .map(
            (vm, i) =>
              `${i === 0 ? "---> " : repeat(" ", 5 + i * 2)}${
                Array.isArray(vm)
                  ? `${formatComponentName(vm[0])}... (${
                      vm[1]
                    } recursive calls)`
                  : formatComponentName(vm)
              }`
          )
          .join("\n")
      );
    } else {
      return `\n\n(found in ${formatComponentName(vm)})`;
    }
  };
}
