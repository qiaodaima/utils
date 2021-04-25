// 主要是为了消除魔术字符串的副作用
// 因为这边会把存储值进行加工 包装成 {v: '存储的值', t: '有效期时间戳'}
// 怕后期更改key，所以这边定义成变量的形式
const valueKey = 'v';
const timeStampKey = 't';

class Storage {
  private namespace: string = ''; // 命名空间
  private nativeStorage = window.localStorage; // localStorage 或者是 sessionStorage

  constructor(namespace: string, nativeStorage = window.localStorage) {
    this.namespace = namespace;
    this.nativeStorage = nativeStorage;
  }

  // 获取当前时间，单位秒
  private get currentSecond() : number {
    return Date.now() / 1000;
  }

  private handleKey = (key: string): string => `${this.namespace}-${key}`

  /**
   * 存储值
   *
   * @param key 键名
   * @param value 需要设置的值
   * @param expireTime 过期时间，单位秒, 以当前为参照，多少秒之后过期，小于等于0 视为永久
   */
  setItem = (key: string, value: any, expireTime?: number): void => {
    const data = {
      [valueKey]: value,
      [timeStampKey]: 0
    };

    // 如果设置了过期时间
    if (expireTime && expireTime > 0) {
      data[timeStampKey] = this.currentSecond + expireTime;
    }

    // 对自己的代码没信心哈哈~
    try {
      const toString = JSON.stringify(data);

      this.nativeStorage.setItem(this.handleKey(key), toString);
    } catch (error) {
      console.error(`lib-storage: setItem ${key}, ${error}`);
    }
  }

  /**
   * 获取存储值
   *
   * @param key 键名
   */
  getItem = (key: string) => {
    const valueString =  this.nativeStorage.getItem(this.handleKey(key));

    // 没有这个值
    if (!valueString) {
      return valueString;
    }

    // FIXME: 这边需要考虑一种特殊的情况: 就是获取的key, 当初在设置存储的时候走的不是这个方法，
    // 那么这个值的数据格式就会不符合我们这个方法的预期。这种现象应该是比较少见，但是我重构项目的时候遇到过，
    // 就是对一个已经上线的业务进行重构，这个时候用户浏览器是会存在我们之前设置的数据。比较好的方式就是换一个新的key,或者使用命名空间
    // 因此这边做一下兼容
    try {
      // 比如解析一个 JSON.parse('我是一个字符串') 会报错
      const value = JSON.parse(valueString);

      // 时间戳对比，看是否过期
      // 过期的话则直接删除键值对，并且返回null 保持和原生的方法返回的类型一致
      //
      // 这边也有可能会解析出错，比如 value 的值是数字
      // 也有一种情况，数据格式是不对的，但是也不会报错，比如 value 的值是一个【字符串】或者【对象】
      if ((value[timeStampKey] > 0) && (this.currentSecond > value[timeStampKey])) {
        this.removeItem(key);
        return null;
      }

      // 这里是为了保证 是我们自己加工过的数据
      // 如果碰到刚好不是我们加工过的数据，但是也是对象，刚好有键值对v ，哈哈哈哈 这个情况不考虑哈 太巧合了
      if (Object.keys(value).includes(valueKey)) {
        return value[valueKey];
      }

      // 走到这边说明数据不是我们加工过的，直接原样返回
      return value;
    } catch (error) {
      console.error(`lib-storage: getItem ${key}, ${error}`);
      return valueString;
    }
  }

  /**
   * 指定删除存储值
   *
   * @param key 键名
   */
  removeItem = (key: string): void => {
    this.nativeStorage.removeItem(this.handleKey(key));
  }

  /**
   * 删除所有存储值
   */
  clear = (): void => {
    this.nativeStorage.clear();
  }
}

export default Storage;
export const localStorage = new Storage('', window.localStorage);
export const sessionStorage = new Storage('', window.sessionStorage);
