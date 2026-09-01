/******************************

更新时间：2022-12-02
使用声明：⚠️此脚本仅供学习与交流，请勿转载与贩卖！⚠️⚠️⚠️

[rewrite_local]


^https:\/\/mobile-api\.adguard\.com\/api\/1\.0\/ios_validate_receipt$ url script-response-body https://github.com/langkhach270389/Quantumult-X-LK/raw/master/Scripts/langkhach/adguard.js

[mitm]

hostname = mobile-api.adguard.com

*******************************/
let obj = JSON.parse($response.body);
obj = {"products":[{"product_id":"com.adguard.lifetimePurchase","premium_status":"ACTIVE"}]};
$done({body: JSON.stringify(obj)});
