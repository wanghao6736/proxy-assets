# proxy-assets

代理配置的**产物**仓库：规则集、覆写脚本、各内核的配置与模块。公开，只放可公开的东西。

这个仓库在 2026-09-01 从 `QuanX` 改名并重组。改名前它只装 QuantumultX 配置；现在它同时
是 `proxykit`（私有）的发布点，所以按内核分层，QX 的内容整体移到了 `quantumult-x/` 下。
**所有指向本仓库的 URL 都变了**（仓库名、分支名、路径三处同时变），见文末「URL 迁移」。

## 三种来源，别混着读

| 目录 | 来源 | 谁维护 | 能不能手工改 |
|---|---|---|---|
| `mihomo/` | **生成** —— `proxykit rules build` 的产物 | 同步脚本 | **不能**，下次同步会覆盖 |
| `quantumult-x/profile`、`rewrite/ForOwnUse.conf`、`rewrite/GetCookie.conf`、`loon/plugins/`、`icons/` | **手写自用** | 手工 | 能 |
| `quantumult-x/` 其余（`js/`、`filter/`、`rewrite/` 的子目录） | **vendored** —— 早年从 [ddgksf2013](https://github.com/ddgksf2013) 等处取的副本 | 无人维护 | 能，但上游有更新的版本 |

`MANIFEST.json` 只覆盖 `mihomo/`，因为只有那部分是算出来的。它是两仓库拆分的代价的解药：
一个提交不再能同时含「代码这样改」与「产物就这样变」，所以产物必须自己说清它是谁产的。
vendored 的内容不在清单里 —— 把别人的合集记进自己的产物清单会让这个声明变成假话。

字段是 `synced_by.commit_at_sync`，不是 `generated_by.commit`，这个区别是刻意的：`build`
目前不往 `dist/` 写构建标记，所以同步脚本唯一能读到的是「同步那一刻的 HEAD」，它在
「改了文档但没重新 build」的时候并不等于生成这些文件的提交。要让清单真的记录构建提交，
得让 `build` 自己盖章。

## 布局

```
mihomo/
  rules/*.list          规则集，核心按 type: http 拉取
  overrides/*.ready.js  覆写脚本产物（分组拓扑 + provider URL）
quantumult-x/
  profile/              QuantumultX.conf（自用，[server_remote] 与 [mitm] 刻意留空）
  rewrite/              ForOwnUse.conf（enabled）、GetCookie.conf，及 vendored 子目录
  js/                   脚本，含 Crack/ Task/ Debug/
  filter/               分流规则副本
loon/
  plugins/*.plugin      Loon 插件（手写自用）
icons/                  图标，**跨内核共用**
  Color/                含 icon/（512–1024）与 mini/（128）两档尺寸
  Gallery/Color.json    QX 图标集清单
  icon_util.ipynb       生成各档尺寸的工具，维护 icons/ 自身
surge/    …             计划
MANIFEST.json           mihomo/ 的溯源
```

按**内核**分在第一层，不按 rules / overrides 分：同一个逻辑规则集在不同内核下渲染成不同
格式，消费方也是按内核取 URL 的；Surge 的模块、QX 的重写这类根本不映射成「rules」的东西
才有地方放。

`icons/` 是这条规则的**唯一例外**，而且恰恰是这条规则推出来的：QX 的 `img-url=` 与 Loon
插件的 `icon =` 都取同一批图标。放进任一内核目录，另一个就得跨目录去引 —— 「第一层 = 内核」
的前提是消费方按内核取 URL，而每个内核都取的东西没有哪个内核可归。`icon_util.ipynb` 跟着
图标放,因为它维护的就是图标本身,不是产物。

## 不放什么

| | 为什么 |
|---|---|
| 合并后的订阅 YAML、完整 profile | **含节点凭据**（password / uuid / 服务器地址）。可从代码仓库重新生成，任何地方都不版本化 |
| `quantumult-x/profile/release.conf` | QX 的真实 profile，`[server_remote]` 里是**带 token 的订阅链接** |
| `quantumult-x/profile/mitm.txt` | MITM CA **私钥** |
| 实机 `config.yaml` 备份 | 诊断快照，归本地备份或加密存储 |
| 手写规则**源**（`resources/rules/custom/*.list`） | 那是代码仓库的二类资源，含筛选理由的注释 |

隐私边界划在**源 / 产物**上，不划在内容上：源含筛选理由与取舍过程（不公开），产物只有
筛选结果（可公开）。以 `academic` 为例，源 175 行含 31 行注释，产物 129 行纯规则。

对 `mihomo/` 而言 `.gitignore` 是安全网而非边界 —— 边界是代码仓库的
`scripts/sync-assets.sh`，它拒绝复制任何带本机绝对路径或凭据形状键的文件。哪条真的触发了，
说明脚本有 bug。对 `quantumult-x/` 而言 `.gitignore` **就是**边界，因为没有脚本把关。

## 消费方式

规则集由代理内核按 `type: http` 拉取，形态：

```
https://testingcf.jsdelivr.net/gh/wanghao6736/proxy-assets@<ref>/mihomo/rules/<Name>.list
```

`<ref>` 用可变引用（`main`）还是不可变引用（commit SHA / tag）是一个待定取舍：前者简单但有
CDN 缓存窗口，后者立即生效但每次构建都要改覆写脚本里的 URL。切换 provider 声明之前**必须
先确认远程可达** —— 拉不到规则集会让核心加载失败、代理整体下线。

## URL 迁移（2026-09-01）

改名 + 重组把三样东西同时改了，所以旧 URL 全部失效：

```
旧  https://raw.githubusercontent.com/wanghao6736/proxy-assets/master/Rewrite/ForOwnUse.conf
新  https://raw.githubusercontent.com/wanghao6736/proxy-assets/main/quantumult-x/rewrite/ForOwnUse.conf
       └ 仓库名              └ 分支            └ 路径
```

重组后树里共 66 处指向本仓库的 URL，分布在 42 个文件，全部已是新地址；第三方 URL 未动。

图标另有一次迁移：它们原先在 `loon` 分支的 `IconSet/`，现在在 `main` 的 `icons/`。

```
旧  https://raw.githubusercontent.com/wanghao6736/QuanX/loon/IconSet/Color/mini/jd_128.png
新  https://raw.githubusercontent.com/wanghao6736/proxy-assets/main/icons/Color/mini/jd_128.png
```

**只剩 `main` 一个分支**：`master`（旧 QX 布局）与 `loon`（Loon 插件与图标）都已合进 main
并删除,两者的提交都是 main 的祖先,历史没丢。代价是任何写死 `/master/` 或 `/loon/` 的
旧 URL 会 404 —— 包括 QX 客户端里存的 `@ConfigURL`,那是**客户端本地状态**,仓库改不到它,
必须手工更新一次:

```
https://github.com/wanghao6736/proxy-assets/raw/main/quantumult-x/profile/QuantumultX.conf
```

Loon 插件同理:插件里的 `icon =` 已在仓库内改好,但已安装的插件是客户端本地副本,
要重新订阅一次才会指向新地址。
