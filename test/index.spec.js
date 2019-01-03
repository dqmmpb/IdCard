const idCard = require('../src/index');
const expect = require('chai').expect;

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
  describe('#num15to18()', function() {
    it('411403960314001 转18位 411403199603140010', function () {
      expect(idCard.num15to18('411403960314001')).to.be.equal('411403199603140010');
    });
  });
  describe('#checkIdCard()', function() {
    it('411403199603140010 验证 true', function () {
      expect(idCard.checkIdCard('411403199603140010')).to.be.equal(true);
    });
    it('41140319960314001X 验证 false', function () {
      expect(idCard.checkIdCard('41140319960314001X')).to.be.equal(false);
    });
  });
});

