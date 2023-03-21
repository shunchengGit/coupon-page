const config = {
  cost: 240,
  deposit: 300,
  minProfit: 53,
  defaultDiscountPrice: 400,
  singleSoldPrice:300,
}

onload = function () {
  document.getElementById("discountPrice").value = config.defaultDiscountPrice;
  document.getElementById("singlePrice").value = config.singleSoldPrice;
  calc()
}

const calc = () => {
  const getCheckedValue = (name) => {
    const element = document.querySelector(`input[name=${name}]:checked`);
    return element ? element.id : '';
  };

  const consumption = parseInt(document.getElementById("consumption").value);
  const discountPrice = parseInt(document.getElementById("discountPrice").value);
  const location = getCheckedValue("location");
  const source = getCheckedValue("source");
  const priceType = getCheckedValue("priceType");

  let result;
  if (location === "location_unknown") {
    const r1 = calcImpl(consumption, "location_hall", discountPrice, source, priceType);
    const r2 = calcImpl(consumption, "location_privateRoom", discountPrice, source, priceType);
    result = { des: `${r1.des}<br/>${r2.des}` };
  } else {
    result = calcImpl(consumption, location, discountPrice, source, priceType);
  }

  document.getElementById("couponCount").value = result.couponCount;
  document.getElementById("cash").value = result.cash;
  document.getElementById("returnCoupon").value = result.returnCoupon;
  document.getElementById("deposit").value = result.deposit;
  document.getElementById("money").value = result.money;
  document.getElementById("des").innerHTML = result.des;
};

calcImpl = function (consumption, location, discountPrice, source, priceType) {
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

  // 计算线性价格
  function calcLinearCost(couponCount, returnCoupon, discountPrice, bottomLineStrategy = true) {
    const couponDiff = couponCount - returnCoupon;
    let rate = discountPrice;
    let money = parseInt(couponDiff * rate / 1000.0);
    if (bottomLineStrategy) {
      if (money % 10 !== 0) {
        money = money - money % 10 + 10;
      }
      const minMoney = parseInt(couponDiff * config.cost / 1000) + config.minProfit;
      money = money > minMoney ? money : minMoney;
    }
    return money;
  }

  // 券费
  function calcCost(couponCount, returnCoupon, discountPrice, location, priceType) {
    let money = calcLinearCost(couponCount, returnCoupon, discountPrice);
    if (priceType === 'priceType_tiered') {
      // 超过上限的部分使用单出价格计算
      if (location === 'location_hall' && returnCoupon === 480 && couponCount > 1000) {
        money = calcLinearCost(couponCount, 1000, config.singleSoldPrice, false) + calcLinearCost(1000, 480, discountPrice);
      } else if (location === 'location_privateRoom' && returnCoupon === 1000 && couponCount > 2000) {
        money = calcLinearCost(couponCount, 2000, config.singleSoldPrice, false) + calcLinearCost(2000, 1000, discountPrice);
      }
    }
    return money;
  }

  var money = calcCost(couponCount, returnCoupon, discountPrice, location, priceType);

  var locationDes = location === 'location_hall' ? '大厅' : '包间';
  let desList = null;
  if (source === 'source_wechat') {
    desList = [
      `[${locationDes}方案]`,
      `在${locationDes}，点${consumption}元及以上的菜，用${couponCount}的券，收费${money}元，预期返券${returnCoupon}，微信渠道，无押金。`,
      ``,
      `[具体操作]`,
      `1. 首先，我在闲鱼建一个${couponCount}券，0.1元订单，方便我给你邮寄。你通过此订单拍下（邮寄地址和联系电话要填对），我通过此订单把券寄给你。`,
      `2. 其次，你在收到我的券后给我转${money}元。`,
      `3. 最后，在你消费完成以后，通过快递把${returnCoupon}返券寄给我。联系人：程先生 联系方式：18600003671 邮寄地址：北京昌平回龙观流星花园3区35号楼菜鸟柜。`,
      ``,
      `[注意事项]`,
      `谁寄出谁支付邮费。如果你想自取或者闪送，不需要我邮寄，则我补贴你10元邮费。`,
    ];
  } else {
    desList = [
      `[${locationDes}方案]`,
      `在${locationDes}，点${consumption}元及以上的菜，用${couponCount}的券，收费${money}元，预期返券${returnCoupon}，押金${deposit}元。`,
      ``,
      `[具体操作]`,
      `1. 首先，我在闲鱼建一个${couponCount}券，${money + deposit}元（收费${money}+押金${deposit}）。你拍下后我通过此订单把券寄给你。（邮寄地址和联系电话要填对）`,
      `2. 同时，你在闲鱼建一个${returnCoupon}返券，${deposit}元（押金${deposit}返还）。我拍一下，你吃完后通过此订单把券返给我。（订单上有我的地址和电话）`,
      `3. 最后，我收到你的返券，我们同时确认两笔交易。双向确保，十分安全。`,
      ``,
      `[注意事项]`,
      `1. 谁寄出谁支付邮费。如果你想自取或者闪送，不需要我邮寄，则我补贴你10元邮费。`,
      `2. 返券只接受新券，不接受旧券，如果新券少了，按照比例扣押金~正常按照我的指导返券不会出错`
    ];
  }
  var des = "";
  desList.forEach(function (item, index) {
    des = `${des} ${item}<br/>`
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

const copy = () => {
  let text = document.getElementById("des").innerHTML;
  text = text.replaceAll("<br>", "\n")
  copyText(text);
  alert("已复制到剪切板");
}

String.prototype.replaceAll = function(search, replacement) {
  return this.replace(new RegExp(search, 'g'), replacement);
};

//复制文本
function copyText(text) {
  var element = createElement(text);
  element.select();
  element.setSelectionRange(0, element.value.length);
  document.execCommand('copy');
  element.remove();
}

//创建临时的输入框元素
function createElement(text) {
  var isRTL = document.documentElement.getAttribute('dir') === 'rtl';
  var element = document.createElement('textarea');
  // 防止在ios中产生缩放效果
  element.style.fontSize = '12pt';
  // 重置盒模型
  element.style.border = '0';
  element.style.padding = '0';
  element.style.margin = '0';
  // 将元素移到屏幕外
  element.style.position = 'absolute';
  element.style[isRTL ? 'right' : 'left'] = '-9999px';
  // 移动元素到页面底部
  let yPosition = window.pageYOffset || document.documentElement.scrollTop;
  element.style.top = `${yPosition}px`;
  //设置元素只读
  element.setAttribute('readonly', '');
  element.value = text;
  document.body.appendChild(element);
  return element;
}