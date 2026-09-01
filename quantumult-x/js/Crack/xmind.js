/******************************

更新时间：2022-12-02
使用声明：⚠️此脚本仅供学习与交流，请勿转载与贩卖！⚠️⚠️⚠️

[rewrite_local]


^https?:\/\/www\.xmind\.(cn|net|app)\/\_res\/devices url script-response-body https://raw.githubusercontent.com/wanghao6736/proxy-assets/main/quantumult-x/js/Crack/xmind.js

[mitm] 

hostname = www.xmind.cn, www.xmind.net, www.xmind.app

*******************************/

//var obj = JSON.parse($response.body);
//obj = {"raw_data": "S0MY6Wu5wpkW52RE5XmMkSMfTBvnytTwIJODrtVDjnA0axrORbnv9gh1RC4W3/ejTfQhNBb7CVxxpbYnBBk2tHc4gAODhsuGpHkltYNL/P5dfORSpdbiNkAZr5aBBbHS/dNlaYjLYyBkq9Ohfe0QS9PeXOWLbDdNA6kqidLJysw=", "license":{"status":"sub","expireTime":9999999999999}, "_code": 200};

var obj=JSON.parse($response.body);
obj.license.status='sub';
obj.license.expireTime=1893427200000;

$done({ body: JSON.stringify(obj) });
