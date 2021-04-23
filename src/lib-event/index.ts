import { Listener } from './type';


/**
 * 让函数只运行一次
 *
 * @param {Function} fn 需要被处理的函数
 */
const _once = (fn: Function) => {
  let used = false; // 标记函数是否使用过

  return (...params: any[]) => {
    // 如果使用过，则直接中断
    if (used) {
      return;
    }

    used = true;
    fn.call(this, ...params);
  };
};

// FIXME: 属性的方法都是用箭头函数来实现，需要注意实际使用时this指向问题
export class Event {
  // 事件中心
  private _events : Listener = {}

  /**
   * 订阅事件
   *
   * @param {String} type 事件名称
   * @param {Function} handler 回调函数
   */
  on = (type: string, handler: Function) => {
    const listener = this._events[type];

    // 如果没有这个事件
    if (!listener) {
      this._events[type] = [handler];
    }

    // 事件已经存在，则继续追加
    if (listener) {
      listener.push(handler);

      // 避免重复订阅相同事件
      this._events[type] = [...new Set(listener)];
    }

    return this;
  };

  /**
   * 订阅事件 - 只触发一次
   *
   * @param {String} type 事件名称
   * @param {Function} handler 回调函数
   */
  once = (type: string, handler: Function) => {
    // FIXME: 这样外面没有办法取消订阅，会永驻事件中心
    // 需要考虑是不是会造成内存泄漏隐患
    this.on(type, _once(handler));
    return this;
  };

  /**
   * 发布事件
   *
   * @param {String} type 事件名称
   * @param {*} params 发布信息时携带的参数
   */
  emit = (type: string, ...params: any[]) => {
    const listener = this._events[type];

    // 没有订阅该事件类型 或者 事件列表为空
    if (!listener || !listener?.length) {
      console.warn(`${type}事件没有订阅，发布无效！`);
      return this;
    }

    listener.forEach((handlerItem: Function) => {
      handlerItem.call(this, ...params);
    });

    return this;
  };

  /**
   * 指定移除订阅事件
   *
   * @param {String} type 事件名称
   * @param {Function} handler 需要移除的回调函数，不传递则移除该事件类型的所有订阅
   */
  remove = (type: string, handler?: Function) => {
    const listener = this._events[type];

    // 该事件类型还没注册，不需要被移除
    if (!listener) {
      console.warn(`${type}事件没有订阅，移除无效！`);
      return this;
    }

    // 移除该事件类型的所有订阅
    if (!handler) {
      this._events[type] = [];
      return this;
    }

    this._events[type] = listener.filter((handlerItem: Function) => handlerItem !== handler);
    return this;
  };

  /**
   * 清除所有订阅事件
   */
  clear = () => {
    this._events = {};
    return this;
  };
}
