# Docker Server 部署指南

## Docker 部署

映像發佈地址：[https://hub.docker.com/r/lyswhut/any-listen-web-server](https://hub.docker.com/r/lyswhut/any-listen-web-server)

## 直接部署

> [!TIP]
> 要求 Node.js 20+

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
      // 'extension.ghMirrorHosts': [], // 擴充商店 GitHub 鏡像地址
      // httpProxy: '', // 代理伺服器地址，例子 `127.0.0.1:2080`

      // 允許訪問的本地目錄
      // allowPublicDir: ['G:', 'E:\\music'], // Windows 範例
      // allowPublicDir: ['/music'], // Linux 範例
      password: '123456a', // 登入密碼
    }

    module.exports = config
    ```

2. 執行 Docker 容器

    > 注意：以下指令僅為範例，請勿直接使用！

    ```bash
    docker run --volume=/home/music:/music --volume=/data:/server/data -p 8080:9500 -d test:latest
    ```

### 環境變數

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
| `EXTENSION_GH_MIRROR_HOSTS` | 擴充商店 GitHub 鏡像地址，多個地址用英文逗號分隔                                         |
|        `HTTP_PROXY`         | 代理伺服器，例如 `127.0.0.1:2080`                                                        |

## 原始碼編譯

```bash
pnpm install
pnpm run build:web
cd build
mkdir data
# 建立配置文件 config.cjs
node index.cjs
```
