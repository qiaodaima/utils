/**
 * 按照区间生成随机数
 *
 * example: getRoundNumber(5, 15, 3)
 * return: [9, 6, 13]
 *
 * example: getRoundNumber(6, 20, 1)
 * return: 10
 *
 * @param {number} min 最小值 默认值 0
 * @param {number} max 最大值 默认值 1
 * @param {number} number 要生成几个随机数，默认生成1个
 * @returns {number|array} 生成的随机数 [min, max] 左闭右闭区间
 */
export const getRoundNumber = (min: number = 0, max: number = 1, number: number = 1): number | number[] => {
  const tempMin = Math.ceil(min);
  const tempMax = Math.floor(max);
  const result = [];

  for (let i = 0; i < number; i++) {
    const temp1 = Math.random() * (tempMax - tempMin + 1);
    const temp2 = Math.floor(temp1) + tempMin;

    result.push(temp2);
  }

  return number === 1 ? result[0] : result;
};
