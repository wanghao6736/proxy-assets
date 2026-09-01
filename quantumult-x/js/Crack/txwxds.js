/******************************

脚本功能：微信读书+解锁无限卡会员
下载地址：https://is.gd/wvRG1o
特别说明：该版本只支持6.0.1或者5.4.3版本❣️
软件版本：7.0.0
脚本作者：彭于晏💞
更新时间：2022-9-30
问题反馈：QQ+89996462
QQ会员群：779392027💞
TG反馈群：https://t.me/plus8889
TG频道群：https://t.me/py996
使用声明：⚠️此脚本仅供学习与交流，请勿转载与贩卖！⚠️⚠️⚠️

*******************************

[rewrite_local]

^https:\/\/i\.weread\.qq\.com\/pay\/memberCardSummary url script-response-body https://raw.githubusercontent.com/89996462/Quantumult-X/main/ycdz/txwxds.js

[mitm] 

hostname = i.weread.qq.com

*******************************/

var obj = {
    "startTime": 1664518736,
    "expiredTime": 253394245384,
    "expired": 0,
    "isPaying": 0,
    "permanent": 0,
    "day": 48,
    "remainTime": 2998743249,
    "payingRemainTime": 0,
    "canUseDiscount": 0,
    "payingUsedDay": 0,
    "mcardHint": "已解锁",
    "timestamp": 1664518998,
    "random": 6024,
    "signature": "63e6257faa3498333df963aff22884ddfb205c5cc0d7761bc84eac4b21de4edb",
    "isAutoRenewable": 0,
    "historyAutoRenewable": 0,
    "autoRenewableChannel": 0,
    "autoRenewableTime": 0,
    "autoRenewablePrice": 1900,
    "savedMoney": 2213,
    "totalFreeReadDay": 0,
    "remainCoupon": 0,
    "remainCount": 0,
    "hintsForRecharge": {
        "predictedSavedMoney": 10315,
        "predictedChapterPrice": 15,
        "pricePerMonth": 900,
        "sendCoupons": 0,
        "buttonTitle": "已解锁",
        "buttonSubtitle": "已解锁"
    },
    "freeBookIds": ["25514495"]
};
$done({ "body": JSON.stringify(obj) });
