const nodeConstellation = require('node-constellation');

const chineseLunar = require('chinese-lunar');

const dataAddress = require('../data/data.json');

function nullOrUndefined(obj) {
  return obj === null || obj === undefined;
}

// 字典
const dict = {
  week(year, month, date) {
    const i = new Date(year, month - 1, date).getUTCDay();
    const day = {
      0: '星期一',
      1: '星期二',
      2: '星期三',
      3: '星期四',
      4: '星期五',
      5: '星期六',
      6: '星期天',
    };
    return day[i];
  },
  zodiac_zh(year) {
    const arr = '鼠牛虎兔龙蛇马羊猴鸡狗猪';
    let lunarYear = (year % 12) - 4;
    if (lunarYear < 0) {
      lunarYear += 12;
    }
    return arr[lunarYear];
  },
  zodiac(month, date) {
    if (!nullOrUndefined(month) && !nullOrUndefined(date)) {
      return nodeConstellation(month, date, 'zh-cn');
    }
    if (nullOrUndefined(date) && !nullOrUndefined(month)) {
      if (month.length === 4) {
        return nodeConstellation(month.substr(0, 2), month.substr(2, 2), 'zh-cn');
      }
      const monthSplit = month.split(/\/|\\|-/);
      return nodeConstellation(monthSplit[0], monthSplit[1], 'zh-cn');
    }
    return undefined;
  },
};

/**
 * 计算最后一位应该是多少
 * @param idCard 身份证号
 * @returns {*}
 */
function endNum(idCard) {
  const card = String(idCard);
  const factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  const parity = [1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  let ai = 0;
  let wi = 0;
  for (let i = 0; i < 17; i += 1) {
    ai = card[i];
    wi = factor[i];
    sum += ai * wi;
  }
  const last = parity[sum % 11];
  return last;
}

/**
 * 农历转换
 * @param birthday
 * @returns {string}
 */
function solarToLunar(birthday) {
  try {
    const lunar = chineseLunar.solarToLunar(new Date(birthday));
    return `${lunar.year}/${String(lunar.month).padStart(2, '0')}/${String(lunar.day).padStart(2, '0')}`;
  } catch (err) {
    throw err;
  }
}

/**
 * 解析生日信息
 * @param idCard
 * @returns {{
 *    date: string,
 *    lunar: string,
 *    year: string,
 *    month: string,
 *    day: string,
 *    week: *,
 *    zodiac: *,
 *    zodiac_zh: *
 *  }}
 */
function birthDay(idCard) {
  const card = String(idCard);
  const year = card.substr(6, 4);
  const month = card.substr(10, 2);
  const day = card.substr(12, 2);
  const birthday = `${year}/${month}/${day}`;
  const lunar = solarToLunar(birthday);
  const lunaryear = lunar.substr(0, 4);
  return {
    date: birthday,
    lunar,
    year,
    month,
    day,
    week: dict.week(year, month, day), // 星期几
    zodiac: dict.zodiac(month, day), // 星座
    zodiac_zh: dict.zodiac_zh(lunaryear), // 生肖
  };
}

/**
 * 验证身份证号是否正确
 * @param idCard
 * @returns {boolean}
 */
function checkIdCard(idCard) {
  const card = String(idCard);
  if (/(^\d{18}$)/.test(card) && String(endNum(card)) === card[17].toUpperCase()) {
    return true;
  }
  return false;
}

/**
 * 补全身份证号
 * @param idCard
 * @returns {string}
 */
function repairIdCard(idCard) {
  const card = String(idCard);
  if (/(^\d{17}$)/.test(card)) {
    return card + endNum(card);
  }
  if (/(^\d{18}$)/.test(card)) {
    return card.slice(0, 17) + endNum(card);
  }
  return card;
}

/**
 * 15位转换18位
 * @param idCard
 * @returns {string}
 */
function num15to18(idCard) {
  const card = String(idCard);
  if (/(^\d{15}$)/.test(card)) {
    return repairIdCard(`${card.slice(0, 6)}19${card.slice(6, 15)}`);
  }
  return repairIdCard(card);
}

/**
 * 地址信息解析
 * @param idCard
 * @returns {{address, province, city, area, all: string}}
 */
function address(idCard) {
  const card = String(idCard);
  const addressId = card.slice(0, 6);
  const data = dataAddress[addressId];
  if (!nullOrUndefined(data)) {
    const all = [];
    if (data.province !== '无') {
      all.push(data.province);
    }
    if (data.city !== '无') {
      all.push(data.city);
    }
    if (data.area !== '无') {
      all.push(data.area);
    }
    return {
      address: data.address,
      province: data.province,
      city: data.city,
      area: data.area,
      all: all.join('-'),
    };
  }
  return data;
}

/**
 * 性别解析
 * @param idCard
 * @returns {string}
 */
function sex(idCard) {
  const card = String(idCard);
  if (card[16] % 2) return '男';
  return '女';
}

module.exports = {
  endNum,
  birthDay,
  checkIdCard,
  repairIdCard,
  num15to18,
  sex,
  address,
  all(idCard) {
    return {
      endNum: endNum(idCard),
      birthDay: birthDay(idCard),
      checkIdCard: checkIdCard(idCard),
      sex: sex(idCard),
      address: address(idCard),
    };
  },
};
