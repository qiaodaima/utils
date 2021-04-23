/**
 * 获取url上的查询参数（如果参数值是数字类型，会自动转换成number类型，将不再是字符串）
 *
 * example: query('https://www.baidu.com/?color=3&name=清华')
 * return: {color: 3, name: '清华'}
 *
 * example: query('https://www.baidu.com')
 * return: {}
 *
 * @param {string} url 不传递则表示获取当前url
 * @returns {object} url 参数对象集合
 */
export const query = (url: string = location.search): object => {
  let params = {};

  if (!url.includes("?")) {
    return params;
  }

  url
    .split("?")[1]
    .split("&")
    .map((item) => {
      const [key, value] = item.split("=");

      params[key] =
        Number(value).toString() === "NaN" ? decodeURI(value) : Number(value);
    });

  return params;
};
