<p align="center"><a href="https://github.com/any-listen/any-listen"><img height="110" src="./images/header-logo.svg" alt="any-listen logo"></a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="https://github.com/any-listen/any-listen"><img height="86" src="./images/header-name.svg" alt="any-listen name"></a></p>

<p align="center">一款跨平台的私人音樂播放服務</p>

<br />

[English](../README.md) | [简体中文](README_zh.md) | 繁體中文

專案仍在積極開發中，目前提供 **桌面版** 與 **網頁版服務**。

## 特性

- 新增並播放本機歌曲（普通清單、本機清單）
- 新增並播放儲存在 WebDAV 的歌曲（遠端清單）
- 線上匹配歌曲資訊（封面、歌詞，需至擴充管理安裝對應擴充）
- 實驗性音效
- 卡拉 OK 歌詞、標題列歌詞

## 桌面版

前往 Release 下載最新版本並安裝即可：[https://github.com/any-listen/any-listen-desktop/releases](https://github.com/any-listen/any-listen-desktop/releases)

## 網頁版

可以直接部署到伺服器，或使用 Docker 部署。

### Docker 部署

映像發佈地址：[https://hub.docker.com/r/lyswhut/any-listen-web-server](https://hub.docker.com/r/lyswhut/any-listen-web-server)

### 直接部署

> 要求：Node.js 20+

下載最新版本並解壓到目標目錄：[https://github.com/any-listen/any-listen-web-server/releases](https://github.com/any-listen/any-listen-web-server/releases)

參考 [https://github.com/lyswhut/lx-music-sync-server](https://github.com/lyswhut/lx-music-sync-server) 的部署方式，配置文件說明見下方。

升級方式：

1. 刪除舊版本專案目錄下的 `public` 與 `server` 資料夾
2. 將新版本的 `public` 與 `server` 資料夾上傳到專案目錄
3. 重新啟動服務

---

**使用範例：**

1. 建立配置文件 `data/config.cjs`

    ```js
    const config = {
      // port: '9500', // 綁定埠口
      // bindIp: '127.0.0.1', // 綁定 IP
      // httpLog: true, // 是否啟用 HTTP 請求日誌
      // 'cors.enabled': false, // 是否啟用跨域
      // 'cors.whitelist': [ // 允許跨域的網域，空陣列表示允許所有網域
      //   // 'www.xxx.com',
      // ],
      // 'upstreamProxy.enabled': false, // 是否使用代理轉發請求
      // 'upstreamProxy.header': '', // 代理轉發請求標頭（如 `x-real-ip`）
      // 'extension.ghMirrorHosts': [], // 擴展商店 Github 鏡像地址
      // httpProxy: '', // 代理伺服器地址，例子 `127.0.0.1:2080`

      // 允許訪問的本地目錄
      // allowPublicDir: ['G:', 'E:\\music'], // Windows 範例
      // allowPublicDir: ['/music'], // Linux 範例
      password: '123456a', // 登入密碼
    }

    module.exports = config
    ```

2. 執行 Docker 容器

    > 注意：以下命令僅為範例，請勿直接使用！

    ```bash
    docker run --volume=/home/music:/music --volume=/data:/server/data -p 8080:9500 -d test:latest
    ```

#### 環境變數

|           變數名            | 描述                                                                                     |
| :-------------------------: | ---------------------------------------------------------------------------------------- |
|           `PORT`            | 綁定埠口，預設 `9500`                                                                    |
|          `BIND_IP`          | 綁定 IP，預設 `127.0.0.1`，設為 `0.0.0.0` 接受所有 IPv4 請求，設為 `::` 接受所有 IP 請求 |
|   `UPSTREAM_PROXY_HEADER`   | 代理轉發請求標頭（如 `x-real-ip`），設置後自動啟用代理                                   |
|     `ALLOW_PUBLIC_DIR`      | 允許訪問的本地目錄，多個目錄用英文逗號分隔                                               |
|         `DATA_PATH`         | 資料儲存路徑，預設 `./data`                                                              |
|         `LOGIN_PWD`         | 登入密碼                                                                                 |
|        `CONFIG_PATH`        | 配置文件路徑，預設 `./data/config.js`                                                    |
|         `LOG_PATH`          | 日誌儲存路徑，預設 `./data/logs`                                                         |
| `EXTENSION_GH_MIRROR_HOSTS` | 擴展商店 Github 鏡像地址，多個地址用英文逗號分隔                                         |
|        `HTTP_PROXY`         | 代理伺服器，例如 `127.0.0.1:2080`                                                        |

### 原始碼編譯

```bash
pnpm install
pnpm run build:web
cd build
mkdir data
# 建立配置文件 config.cjs
node index.cjs
```

## 貢獻

歡迎貢獻 PR。為了讓 PR 更順利合併，請留意以下事項：

- 新功能建議先建立 Issue 討論需求。
- 修復 bug 請提供修復前後的說明及重現方式。
- 其他類型 PR 請附上說明。

貢獻步驟：

1. 複製本倉庫並切換至 `dev` 分支開發；
2. 提交 PR 至 `dev` 分支。

## 授權

本專案基於 Affero 通用公共授權條款（AGPL）v3.0 並附加以下條款：

- 嚴禁商業用途，除非已獲得原作者書面許可。
- 完整細則請參閱 [LICENSE 文件](../LICENSE)。
