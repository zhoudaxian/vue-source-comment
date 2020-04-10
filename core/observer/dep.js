/*
 * @Author: Arthur
 * @Date: 2020-04-09 21:47:29
 * @Last Modified by: Arthur
 * @Last Modified time: 2020-04-09 21:59:52
 * Dependances <- 依赖收集容器（watcher）
 */
/* @flow */

import type Watcher from "./watcher";
import { remove } from "../util/index";
import config from "../config";

let uid = 0;

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */
export default class Dep {
  static target: ?Watcher;
  id: number;
  subs: Array<Watcher>;

  constructor() {
    this.id = uid++;
    this.subs = [];
  }

  // 添加订阅 additon subscrible
  addSub(sub: Watcher) {
    this.subs.push(sub);
  }

  // 删除订阅 remove subscrible
  removeSub(sub: Watcher) {
    remove(this.subs, sub);
  }

  // 收集依赖
  depend() {
    // Dep.target 如果存在 则为watcher实例
    if (Dep.target) {
      Dep.target.addDep(this); // watcher.addDep(dep实例)
    }
  }

  // 通知watcher更新
  notify() {
    // stabilize the subscriber list first
    const subs = this.subs.slice();
    // 如果是非生成环境且非异步渲染模式 对watcher按添加顺序排序
    if (process.env.NODE_ENV !== "production" && !config.async) {
      // subs aren't sorted in scheduler if not running async
      // we need to sort them now to make sure they fire in correct
      // order
      subs.sort((a, b) => a.id - b.id);
    }
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update();
    }
  }
}

// The current target watcher being evaluated.
// This is globally unique because only one watcher
// can be evaluated at a time.
Dep.target = null;

// target stack
const targetStack = [];

// push target
export function pushTarget(target: ?Watcher) {
  targetStack.push(target);
  Dep.target = target;
}

// pop target
export function popTarget() {
  targetStack.pop();
  Dep.target = targetStack[targetStack.length - 1];
}
