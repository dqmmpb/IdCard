var idCard = require('../src/idCard');
var expect = require('chai').expect;

describe('身份证验证测试', function() {
  describe('#birthDay()', function() {
    it('110226198501272116 的生日应该为 1985/01/27', function () {
      expect(idCard.birthDay('110226198501272116').date).to.be.equal('1985/01/27');
    });
    it('110226198501272116 的农历生日应该为 1984/12/07', function () {
      expect(idCard.birthDay('110226198501272116').lunar).to.be.equal('1984/12/07');
    });
    it('110226198501272116 的星座应该为 水瓶座', function () {
      expect(idCard.birthDay('110226198501272116').zodiac).to.be.equal('水瓶座');
    });
    it('110226198501272116 的生肖应该为 鼠', function () {
      expect(idCard.birthDay('110226198501272116').zodiac_zh).to.be.equal('鼠');
    });
  });
});

