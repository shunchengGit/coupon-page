const config = {
  cost: 250,
  deposit: 300,
  minProfit: 53
}

onload = function () {
  // const theId = config.priceMode + 'PriceMode';
  // document.getElementById(theId).checked = 1;
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
  
  let result;
  if (location === "location_unknown") {
    const r1 = calcImpl(consumption, "location_hall", discountPrice);
    const r2 = calcImpl(consumption, "location_privateRoom", discountPrice);
    result = { des: `${r1.des}<br/>${r2.des}` };
  } else {
    result = calcImpl(consumption, location, discountPrice);
  }

  document.getElementById("couponCount").value = result.couponCount;
  document.getElementById("cash").value = result.cash;
  document.getElementById("returnCoupon").value = result.returnCoupon;
  document.getElementById("deposit").value = result.deposit;
  document.getElementById("money").value = result.money;
  document.getElementById("des").innerHTML = result.des;
};

calcImpl = function (consumption, location, discountPrice) {
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
  function calcCost(couponCount, returnCoupon, discountPrice) {
    const couponDiff = couponCount - returnCoupon;
    let rate = discountPrice;
    let money = parseInt(couponDiff * rate / 1000.0);
    if (money % 10 !== 0) {
      money = money - money % 10 + 10;
    }
    const minMoney = parseInt(couponDiff * config.cost / 1000) + config.minProfit;
    money = money > minMoney ? money : minMoney;
    return money;
  }
  var money = calcCost(couponCount, returnCoupon, discountPrice);

  var locationDes = location === 'location_hall' ? '大厅' : '包间';
  const desList = [
    `[${locationDes}方案]`,
    `在${locationDes}，点${consumption}元及以上的菜，用${couponCount}的券，收费${money}元，预期返券${returnCoupon}，押金${deposit}元。`,
    ``,
    `[具体操作]`,
    `1. 首先，我在闲鱼建一个${couponCount}券，${money + deposit}元（收费${money}+押金${deposit}）。你拍下后我通过此订单把券寄给你。`,
    `2. 同时，你在闲鱼建一个${returnCoupon}返券，${deposit}元（押金${deposit}返还）。我拍一下，你吃完后通过此订单把券返给我。`,
    `3. 最后，我收到你的返券，我们同时确认两笔交易。双向确保，十分安全。`,
    ``,
    `[注意事项]`,
    `1. 谁寄出谁支付邮费。如果你想自取或者闪送，不需要我邮寄，则我补贴你10元邮费。`,
    `2. 返券只接受新券，不接受旧券，如果新券少了，按照比例扣押金~正常按照我的指导返券不会出错`,
    `3. 商家返券规则：除去用券抵扣的部分，包间每消费100元现金，返回50券，1000券封顶；大厅每消费100元现金，返80券，480券封顶。`
  ];
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