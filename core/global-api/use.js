/*
 * @Author: Arthur
 * @Date: 2020-04-09 18:31:49
 * @Last Modified by: Arthur
 * @Last Modified time: 2020-04-09 18:42:21
 */
/* @flow */

// toArray: 将类数组转化成数组
import { toArray } from "../util/index";

/**
 * 初始化Vue.use方法 全局api
 * @param Vue
 */
export function initUse(Vue: GlobalAPI) {
  /**
   * 定义Vue静态方法 use
   * @param plugin {Function | Object}
   * 插件可以直接是一个函数fn(Vue,args), 也可以是有install属性的object(install === fn)
   */
  Vue.use = function (plugin: Function | Object) {
    //  this之下Vue, 初始化 installedPlugins
    const installedPlugins =
      this._installedPlugins || (this._installedPlugins = []);

    // 如果已安装，则直接返回this(链式调用)
    if (installedPlugins.indexOf(plugin) > -1) {
      return this;
    }

    // additional parameters  将Vue加入到args[0]的位置 args -> [Vue,...plugin]
    const args = toArray(arguments, 1);
    args.unshift(this);

    // call plugin
    if (typeof plugin.install === "function") {
      plugin.install.apply(plugin, args);
    } else if (typeof plugin === "function") {
      plugin.apply(null, args);
    }
    installedPlugins.push(plugin);
    return this;
  };
}
