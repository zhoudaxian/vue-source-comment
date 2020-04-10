/*
 * @Author: Arthur
 * @Date: 2020-04-09 18:29:35
 * @Last Modified by:   Arthur
 * @Last Modified time: 2020-04-09 18:29:35
 */
// 导入Vue构造器
import Vue from "./instance/index";

/*
 * 导入Vue全局API
 *
 */
import { initGlobalAPI } from "./global-api/index";
import { isServerRendering } from "core/util/env";
import { FunctionalRenderContext } from "core/vdom/create-functional-component";

initGlobalAPI(Vue);

Object.defineProperty(Vue.prototype, "$isServer", {
  get: isServerRendering,
});

Object.defineProperty(Vue.prototype, "$ssrContext", {
  get() {
    /* istanbul ignore next */
    return this.$vnode && this.$vnode.ssrContext;
  },
});

// expose FunctionalRenderContext for ssr runtime helper installation
Object.defineProperty(Vue, "FunctionalRenderContext", {
  value: FunctionalRenderContext,
});

Vue.version = "__VERSION__";

export default Vue;
