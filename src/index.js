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

// 计算最后一位应该是多少
function idCardEndNum(idCard) {
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

// 左补位
function leftPad(val, num, pad) {
  const str = String(val);
  const padStr = String(pad).length > 0
    ? String(pad)
    : ' ';
  let padding = '';
  let diff = num - str.length;

  if (diff > 0) {
    const padLen = padStr.length;
    do {
      if (diff < padLen) {
        padding = padStr.slice(padStr.length - diff) + padding;
      } else {
        padding = padStr + padding;
      }
      diff -= padLen;
    } while (diff > 0);
  }

  return padding + str;
}

// 右补位
function rightPad(val, num, pad) {
  const str = String(val);
  const padStr = String(pad).length > 0
    ? String(pad)
    : ' ';
  let padding = '';
  let diff = num - str.length;

  if (diff > 0) {
    const padLen = padStr.length;
    do {
      if (diff < padLen) {
        padding += padStr.slice(0, diff);
      } else {
        padding += padStr;
      }
      diff -= padLen;
    } while (diff > 0);
  }

  return str + padding;
}

// 农历转换
function Lunar(birthday) {
  try {
    const lunar = chineseLunar.solarToLunar(new Date(birthday));
    return `${lunar.year}/${leftPad(lunar.month, 2, '0')}/${leftPad(lunar.day, 2, '0')}`;
  } catch (err) {
    throw err;
  }
}

// 解析生日信息
function birthDay(idCard) {
  const card = String(idCard);
  const year = card.substr(6, 4);
  const month = card.substr(10, 2);
  const day = card.substr(12, 2);
  const birthday = `${year}/${month}/${day}`;
  const lunar = Lunar(birthday);
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

// 验证身份证号是否正确
function checkIdCard(idCard) {
  const card = String(idCard);
  if (/(^\d{18}$)/.test(card) && String(idCardEndNum(card)) === card[17].toUpperCase()) {
    return true;
  }
  return false;
}

// 补全身份证号
function repairIdCard(idCard) {
  const card = String(idCard);
  if (/(^\d{17}$)/.test(card)) {
    return card + idCardEndNum(card);
  }
  if (/(^\d{18}$)/.test(card)) {
    return card.slice(0, 17) + idCardEndNum(card);
  }
  return card;
}

// 15位转换18位
function num15to18(idCard) {
  const card = String(idCard);
  if (/(^\d{15}$)/.test(card)) {
    return repairIdCard(`${card.slice(0, 6)}19${card.slice(6, 15)}`);
  }
  return repairIdCard(card);
}

// 地址信息解析
function address(idCard) {
  const card = String(idCard);
  const addressId = card.slice(0, 6);
  const data = dataAddress[addressId];
  if (nullOrUndefined(data)) {
    return data;
  }
  data.all = (`${data.provinces}-${data.citiy}-${data.areas}`).replace('无', '');
  return data;
}

/* 地址信息返回格式
{
  "address": "地址",
  "provinces": "省/直辖市",
  "citiy": "市",
  "areas": "县/区",
  "all": "省-市-县"
}
*/

// 性别解析
function sex(idCard) {
  const card = String(idCard);
  if (card[16] % 2) return '男';
  return '女';
}

module.exports = {
  endNum: idCardEndNum,
  birthDay,
  checkIdCard,
  repairIdCard,
  num15to18,
  sex,
  address,
  all(idCard) {
    return {
      endNum: idCardEndNum(idCard),
      birthDay: birthDay(idCard),
      checkIdCard: checkIdCard(idCard),
      address: address(idCard),
      sex: sex(idCard),
    };
  },
  leftPad,
  rightPad,
};
