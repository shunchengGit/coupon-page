const config = {
    priceMode:"normal", // "normal"、"discount"
    discountPrice:380,
    normalPrice: 440,
    cost: 240,
    deposit: 360,
}

  onload = function () {
    const theId = config.priceMode + 'PriceMode';
    document.getElementById(theId).checked  = 1;
    calc()
  }

  calc = function () {
    var mode = "";
    document.getElementsByName("mode").forEach(function (item) {
      if (item.checked) {
        mode = item.id;
      }
    });

    var consumption = parseInt(document.getElementById("consumption").value);

    var location = "";
    document.getElementsByName("location").forEach(function (item) {
      if (item.checked) {
        location = item.id;
      }
    });



    let discountPriceMode = document.getElementById("discountPriceMode").checked ? 0 : 1;

    var time = "";
    document.getElementsByName("time").forEach(function (item) {
      if (item.checked) {
        time = item.id;
      }
    });

    var result;
    if (location === "location_unknown") {
      var r1 = calcImpl(consumption, "location_hall", discountPriceMode);
      var r2 = calcImpl(consumption, "location_privateRoom", discountPriceMode);
      var result = {};
      result.des = r1.des + "<br/>" + r2.des;
    } else {
      result = calcImpl(consumption, location, discountPriceMode);
    }

    document.getElementById("couponCount").value = result.couponCount;
    document.getElementById("cash").value = result.cash;
    document.getElementById("returnCoupon").value = result.returnCoupon;
    document.getElementById("deposit").value = result.deposit;
    document.getElementById("money").value = result.money;
    document.getElementById("des").innerHTML = result.des;
  }

  calcImpl = function (consumption, location, discountPriceMode) {
    // 用券
    var couponCount = parseInt(consumption / 2 / 50) * 50;
    // 现金
    var cash = consumption - couponCount;
    // 返券
    var returnCoupon = 0;
    cashIndex = parseInt(cash / 100) * 100;
    if (location === 'location_hall') {
      returnCoupon = cashIndex * 0.8;
      returnCoupon = returnCoupon > 480 ? 480 : returnCoupon;
    } else {
      returnCoupon = cashIndex * 0.5;
      returnCoupon = returnCoupon > 1000 ? 1000 : returnCoupon;
    }
    // 押金
    function calcDeposit(returnCoupon) {
      let money = parseInt(returnCoupon * config.deposit / 1000);
      money = money - money % 10;
      return money;
    }
    var deposit = calcDeposit(returnCoupon);
    // 券费
    function calcCost(couponCount, returnCoupon, discountPriceMode) {
      const couponDiff = couponCount - returnCoupon;
      let rate = config.normalPrice;
      switch (discountPriceMode) {
        case 0:
          rate = config.discountPrice;
          break;
        case 1:
          rate = config.normalPrice;
          break;
        default:
          rate = config.normalPrice;
          break;
      }
      let money = parseInt(couponDiff * rate / 1000.0);
      if (money % 10 !== 0) {
        money = money - money % 10 + 10;
      }
      const minMoney = parseInt(couponDiff * config.cost / 1000) + 53;
      money = money > minMoney ? money : minMoney;
      return money;
    }
    var money = calcCost(couponCount, returnCoupon, discountPriceMode);

    var locationDes = location === 'location_hall' ? '大厅' : '包间';
    var peopleDes = '';
    var des0 = `${peopleDes}在${locationDes}，点${consumption}元及以上的菜，`
    var des1 = `用${couponCount}的券，收费${money}元，预期返券${returnCoupon}，押金${deposit}元。`;
    var des2 = `我在闲鱼建一个${couponCount}券，${money + deposit}元（收费${money}+押金${deposit}）的商品，你拍下后我通过此订单把券寄给你。`;
    var des3 = `你在闲鱼建一个${returnCoupon}返券，${deposit}元（押金${deposit}返还）的商品，我拍一下。你吃完后通过此订单把券返给我。`;
    var des4 = "我收到你的返券，我们同时确认两笔交易。双向确保，比较公平。";
    var des5 = "谁寄出谁支付邮费。如果你想自取或者闪送，不需要我邮寄，则我补贴你10元邮费。";
    var des6 = "返券只接受新券，不接受旧券，如果新券少了，按照比例扣押金~正常按照我的指导不会出错";
    var des = "";
    [des0 + des1, des2, des3, des4, des5, des6].forEach(function (item, index) {
      des = `${des}${index+1}. ${item}<br/>`
    });

    return {
      couponCount,
      cash,
      returnCoupon,
      money,
      deposit,
      des,
    }
  }