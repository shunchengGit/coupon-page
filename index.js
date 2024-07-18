const config = {
  cost: 300,
  deposit: 400,
  minProfit: 55,
  defaultDiscountPrice: 600,
  singleSoldPrice:320,
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
  const singleSoldPrice = parseInt(document.getElementById("singlePrice").value);
  const location = getCheckedValue("location");
  const source = getCheckedValue("source");
  const priceType = getCheckedValue("priceType");
  const recoveryType = getCheckedValue("recoveryType");

  let result;
  result = calcImpl(consumption, location, discountPrice, singleSoldPrice, source, priceType, recoveryType);

  document.getElementById("couponCount").value = result.couponCount;
  document.getElementById("cash").value = result.cash;
  document.getElementById("returnCoupon").value = result.returnCoupon;
  document.getElementById("deposit").value = result.deposit;
  document.getElementById("money").value = result.money;
  document.getElementById("desDetail").innerHTML = result.detail;
  document.getElementById("desAbstract").innerHTML = result.abstract;
};

calcImpl = function (consumption, location, discountPrice, singleSoldPrice, source, priceType, recoveryType) {
  // 用券
  var couponCount = parseInt(consumption / 2 / 50) * 50;
  // 现金
  var cash = consumption - couponCount;
  // 返券
  var returnCoupon = 0;
  cashIndex = parseInt(cash / 100) * 100;
  returnCoupon = cashIndex * 0.5;
  returnCoupon = returnCoupon > 1000 ? 1000 : returnCoupon;

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
      if (returnCoupon === 1000 && couponCount > 2000) {
        money = calcLinearCost(couponCount, 2000, singleSoldPrice, false) + calcLinearCost(2000, 1000, discountPrice);
      } 
    }
    return money;
  }

  var money = calcCost(couponCount, returnCoupon, discountPrice, location, priceType);
  let desList = null;
  const abstract = `点${consumption}元及以上的菜，用${couponCount}的券，收费${money}元`;

  desList = [
    `${abstract}。预期返券${returnCoupon}，押金${deposit}元。`,
    ``,
    `[具体操作]`,
    `1. 首先，我在闲鱼建一个${couponCount}券，${money}元，你拍下；`,
    `2. 其次，我在闲鱼建一个押金订单，${deposit}元，你拍下，确保你把新发的券给我；`,
    `3. 吃饭时，到九十九毡房前台去拿${couponCount}的券；`,
    `4. 消费后，把新发的券继续放到前台，确认交易，我退你押金。`,
    ``,
    `[注意事项]`,
    `返券只接受新券，不接受旧券，如果新券少了，按照比例扣押金~正常按照我的指导返券不会出错`,
  ];

  if (recoveryType == 'recoveryType_y') {
    desList.push(`如果吃的非常多，返券超出预期返券数量，则按照${config.cost/20}一张新50券进行回收(即你把超出预期的券也给我，我每张给你${config.cost/20})`);
  }

  var detail = "";
  desList.forEach(function (item, index) {
    detail = `${detail} ${item}<br/>`
  });

  return {
    couponCount,
    cash,
    returnCoupon,
    money,
    deposit,
    detail,
    abstract,
  }
}

const copyAbstract = () => {
  let text = document.getElementById("desAbstract").innerHTML;
  text = text.replaceAll("<br>", "\n")
  copyText(text);
  alert("已复制到剪切板");
}

const copyDetail = () => {
  let text = document.getElementById("desDetail").innerHTML;
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