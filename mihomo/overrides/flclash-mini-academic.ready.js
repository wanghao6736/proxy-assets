/**
 * FlClash / mihomo 覆写脚本 —— 精简分流 + 学术直连
 *
 * 本文件只有分组拓扑与 DNS,没有规则数据。规则本体在 resources/rules/ 下,由
 * `proxykit rules build` 烘焙,再由 `proxykit rules apply` 注入到文末标注的两段。
 *
 * 分组名与 resources/rules/rulesets.yaml 的 group 字段必须一致 —— 那是两者唯一的
 * 契约,改名时同时改两处。
 *
 * 本文件是**源**;FlClash 加载的是注入后的同名 .ready.js。用法与每处设计取舍的
 * 完整依据见 docs/overrides-notes.md(不追踪)。
 */

function main(config) {

  // 地区分组 —— 从订阅节点里按名称正则筛选。
  //
  // ⚠️ filter 失配的分组不会消失,而是只剩 COMPATIBLE 一个成员,等价 DIRECT。
  // 所以每个 filter 都带国旗 emoji 备选(部分订阅只把 emoji 写进节点名),两字母
  // 国家码一律加 \b 词界(否则 us 命中 Russia、kr 命中 Krypton)。改完用
  // `GET /proxies` 核对每个分组 all 长度 > 1,别只看分组在不在。
  //
  // 台湾是地区,显示名不用国旗;filter 里保留 🇹🇼 只为匹配订阅给出的节点名。
  const REGIONS = [
    { name: "🇭🇰 香港", filter: "(?i)🇭🇰|港|\\bhk\\b|hongkong|hong kong" },
    { name: "🏝 台湾", filter: "(?i)🇹🇼|台|\\btw\\b|taiwan" },
    { name: "🇸🇬 新加坡", filter: "(?i)🇸🇬|新加坡|坡|狮城|\\bsg\\b|singapore" },
    { name: "🇯🇵 日本", filter: "(?i)🇯🇵|日本|川日|东京|大阪|\\bjp\\b|japan" },
    { name: "🇺🇸 美国", filter: "(?i)🇺🇸|美|\\bus\\b|\\busa\\b|united states|洛杉矶|圣何塞|西雅图|芝加哥" },
    { name: "🇰🇷 韩国", filter: "(?i)🇰🇷|韩|\\bkr\\b|korea|首尔" },
  ];

  const REGION_NAMES = REGIONS.map((r) => r.name);

  // 按首次出现去重:功能分组常写成「几个偏好项 + 全部地区兜底」,而偏好项本身就在
  // 地区表里。mihomo 不会替你去重,重复项会在 FlClash 下拉框里出现两个同名分组。
  const uniq = (names) => [...new Set(names)];

  // 分组拓扑。每个 name 必须与 rulesets.yaml 中引用它的 group 字段一致。
  config["proxy-groups"] = [
    {
      name: "节点选择",
      type: "select",
      proxies: uniq(["⚡ 自动选择", ...REGION_NAMES, "DIRECT"]),
    },
    {
      name: "⚡ 自动选择",
      type: "url-test",
      "include-all": true,
      interval: 300,
      tolerance: 50,
    },

    // 学术:默认 DIRECT 用机构 IP 认订阅权限;离校时切到 VPN 或节点。
    {
      name: "🎓 学术直连",
      type: "select",
      proxies: uniq(["DIRECT", "节点选择", ...REGION_NAMES]),
    },

    // ⚠️ 第一位必须是 `节点选择` —— Selector 默认值就是成员表首项,而地区分组一旦
    // filter 失配就等价 DIRECT。偏好顺序由后面的成员次序表达,手动选一次即可。
    {
      name: "🤖 AI服务",
      type: "select",
      proxies: uniq(["节点选择", "🇺🇸 美国", "🇯🇵 日本", "🇸🇬 新加坡", ...REGION_NAMES]),
    },

    { name: "🍎 苹果服务", type: "select", proxies: uniq(["DIRECT", "节点选择", ...REGION_NAMES]) },
    { name: "🎬 国外媒体", type: "select", proxies: uniq(["节点选择", ...REGION_NAMES]) },
    { name: "🛑 广告拦截", type: "select", proxies: uniq(["REJECT", "DIRECT"]) },
    { name: "🐟 漏网之鱼", type: "select", proxies: uniq(["节点选择", "DIRECT", ...REGION_NAMES]) },

    ...REGIONS.map((r) => ({
      name: r.name,
      type: "url-test",
      "include-all": true,
      filter: r.filter,
      interval: 300,
      tolerance: 50,
    })),
  ];

  // DNS —— 全 DoH(走 443),不用 DoT(853 不在 TUN 劫持范围内,会解析失败)。
  //
  // ⚠️ 前提:FlClash 设置里的「覆写 DNS」开关必须关闭,否则本段整体不生效。
  // ⚠️ 六个解析器字段显式写死,不再从订阅继承 —— 订阅的 nameserver-policy 是明文
  // UDP 53,继承会让它盖掉下面的 DoH。fake-ip 相关字段仍靠展开保留。
  //
  // 每台上游的选择依据、内网域名那两行的联动、以及 follow-policy 为何必须为 true,
  // 见 docs/overrides-notes.md。
  config["dns"] = {
    ...(config["dns"] || {}),
    enable: true,
    "prefer-h3": true,

    // 前三项是订阅原有值,必须原样保留;末项让内网域名在客户端查询时就真实解析。
    "fake-ip-filter": ["+.lan", "+.local", "+.example.com", "+.buaa.edu.cn"],

    // 引导解析器:只解出下面这些 DoH 服务器自己的域名,必须是纯 IP。
    "default-nameserver": ["223.5.5.5", "119.29.29.29"],

    nameserver: ["https://doh.pub/dns-query"],
    fallback: ["https://cloudflare-dns.com/dns-query"],

    // geosite:[gfw] 让被墙域名直接问 fallback,不先经境内解析器泄漏一次。
    "fallback-filter": {
      geoip: true,
      "geoip-code": "CN",
      geosite: ["gfw"],
      ipcidr: [],
      domain: null,
    },

    "nameserver-policy": {
      // 内网域名问「当前网络下发的 DNS」。dhcp:// 而非写死 IP:在校自动是校内
      // 解析器,离校自动跟新网络走。只给这一个后缀开,不进全局字段(见 docs)。
      "+.buaa.edu.cn": ["dhcp://en0"],

      "geosite:cn": ["https://doh.pub/dns-query"],
    },

    "direct-nameserver": ["https://doh.pub/dns-query"],

    // 必须为 true,否则上面那条 policy 对 DIRECT 连接完全失效。
    "direct-nameserver-follow-policy": true,

    // 节点域名的解析必须直连,且不能落到 fallback,否则鸡生蛋。
    "proxy-server-nameserver": ["https://doh.pub/dns-query"],
  };

  // 以下两段由 `proxykit rules apply` 整体替换 —— 不要手改。
  // apply 用 config["rule-providers"] 定位起点、return config 定位终点,
  // 所以这两个赋值必须保留作为注入锚点。下面是未注入时的占位值。
  config["rule-providers"] = {
    "LAN": { type: "http", behavior: "classical", format: "text", url: "https://raw.githubusercontent.com/wanghao6736/proxy-assets/main/mihomo/rules/LAN.list", path: "LAN.list", interval: 86400 },
    "AcademicProxy": { type: "http", behavior: "classical", format: "text", url: "https://raw.githubusercontent.com/wanghao6736/proxy-assets/main/mihomo/rules/AcademicProxy.list", path: "AcademicProxy.list", interval: 86400 },
    "Academic": { type: "http", behavior: "classical", format: "text", url: "https://raw.githubusercontent.com/wanghao6736/proxy-assets/main/mihomo/rules/Academic.list", path: "Academic.list", interval: 86400 },
    "BanAD": { type: "http", behavior: "classical", format: "text", url: "https://raw.githubusercontent.com/wanghao6736/proxy-assets/main/mihomo/rules/BanAD.list", path: "BanAD.list", interval: 86400 },
    "AIGC": { type: "http", behavior: "classical", format: "text", url: "https://raw.githubusercontent.com/wanghao6736/proxy-assets/main/mihomo/rules/AIGC.list", path: "AIGC.list", interval: 86400 },
    "AIExtra": { type: "http", behavior: "classical", format: "text", url: "https://raw.githubusercontent.com/wanghao6736/proxy-assets/main/mihomo/rules/AIExtra.list", path: "AIExtra.list", interval: 86400 },
    "Apple": { type: "http", behavior: "classical", format: "text", url: "https://raw.githubusercontent.com/wanghao6736/proxy-assets/main/mihomo/rules/Apple.list", path: "Apple.list", interval: 86400 },
    "GlobalMedia": { type: "http", behavior: "classical", format: "text", url: "https://raw.githubusercontent.com/wanghao6736/proxy-assets/main/mihomo/rules/GlobalMedia.list", path: "GlobalMedia.list", interval: 86400 },
    "Dev": { type: "http", behavior: "classical", format: "text", url: "https://raw.githubusercontent.com/wanghao6736/proxy-assets/main/mihomo/rules/Dev.list", path: "Dev.list", interval: 86400 },
    "Proxy": { type: "http", behavior: "classical", format: "text", url: "https://raw.githubusercontent.com/wanghao6736/proxy-assets/main/mihomo/rules/Proxy.list", path: "Proxy.list", interval: 86400 },
    "China": { type: "http", behavior: "domain", format: "text", url: "https://raw.githubusercontent.com/wanghao6736/proxy-assets/main/mihomo/rules/China.list", path: "China.list", interval: 86400 },
    "ChinaCIDR": { type: "http", behavior: "ipcidr", format: "text", url: "https://raw.githubusercontent.com/wanghao6736/proxy-assets/main/mihomo/rules/ChinaCIDR.list", path: "ChinaCIDR.list", interval: 86400 },
  };
  config["rules"] = [
    "RULE-SET,LAN,DIRECT,no-resolve",
    "RULE-SET,AcademicProxy,节点选择",
    "RULE-SET,Academic,🎓 学术直连",
    "RULE-SET,BanAD,🛑 广告拦截",
    "RULE-SET,AIGC,🤖 AI服务",
    "RULE-SET,AIExtra,🤖 AI服务",
    "RULE-SET,Apple,🍎 苹果服务",
    "RULE-SET,GlobalMedia,🎬 国外媒体",
    "RULE-SET,Dev,节点选择",
    "RULE-SET,Proxy,节点选择",
    "RULE-SET,China,DIRECT",
    "RULE-SET,ChinaCIDR,DIRECT,no-resolve",
    "GEOSITE,CN,DIRECT",
    "GEOIP,CN,DIRECT,no-resolve",
    "MATCH,🐟 漏网之鱼"
  ];
  return config;
}
