# Any Listen

[English](README.md) | 中文

一个跨平台的私人音乐播放服务。

注意：项目仍在积极开发中，目前仅提供网页版服务。你可以直接部署到服务器，或使用 Docker 部署。

## 使用方法

### Docker 部署

[https://hub.docker.com/r/lyswhut/any-listen-web-server](https://hub.docker.com/r/lyswhut/any-listen-web-server)

### 直接部署

下载最新版本并解压到目标目录：[https://github.com/any-listen/any-listen-web-server/releases](https://github.com/any-listen/any-listen-web-server/releases)

参考 [https://github.com/lyswhut/lx-music-sync-server](https://github.com/lyswhut/lx-music-sync-server) 的部署方式，配置文件说明见下方。

---

**使用示例：**

1. 创建配置文件 `data/config.cjs`

    ```js
    const config = {
      // port: '9500', // 绑定端口
      // bindIp: '127.0.0.1', // 绑定 IP
      // httpLog: true, // 是否启用 HTTP 请求日志
      // 'cors.enabled': false, // 是否启用跨域
      // 'cors.whitelist': [ // 允许跨域的域名，空数组表示允许所有域名
      //   // 'www.xxx.com',
      // ],
      // 'upstreamProxy.enabled': false, // 是否使用代理转发请求
      // 'upstreamProxy.header': '', // 代理转发请求头（如 `x-real-ip`）
      // 'extension.ghMirrorHosts': [], // 扩展商店 Github 镜像地址

      // 允许访问的本地目录
      // allowPublicDir: ['G:', 'E:\\music'], // Windows 示例
      // allowPublicDir: ['/music'], // Linux 示例
      password: '123456a', // 登录密码
    }

    module.exports = config
    ```

2. 运行 Docker 容器

    **注意：以下命令仅为示例，不能直接使用！**

    ```bash
    docker run --volume=/home/music:/music --volume=/data:/server/data -p 8080:9500 -d test:latest
    ```

环境变量说明

|           变量名            | 描述                                                                                     |
| :-------------------------: | ---------------------------------------------------------------------------------------- |
|           `PORT`            | 绑定端口，默认 `9500`                                                                    |
|          `BIND_IP`          | 绑定 IP，默认 `127.0.0.1`，设为 `0.0.0.0` 接受所有 IPv4 请求，设为 `::` 接受所有 IP 请求 |
|   `UPSTREAM_PROXY_HEADER`   | 代理转发请求头（如 `x-real-ip`），设置后自动启用代理                                     |
|     `ALLOW_PUBLIC_DIR`      | 允许访问的本地目录，多个目录用英文逗号分隔                                               |
|         `DATA_PATH`         | 数据存储路径，默认 `./data`                                                              |
|         `LOGIN_PWD`         | 登录密码                                                                                 |
|        `CONFIG_PATH`        | 配置文件路径，默认 `./data/config.js`                                                    |
|         `LOG_PATH`          | 日志存储路径，默认 `./data/logs`                                                         |
| `EXTENSION_GH_MIRROR_HOSTS` | 扩展商店 Github 镜像地址，多个地址用英文逗号分隔                                         |

### 源码编译

```bash
pnpm install
pnpm run build:web
cd build
mkdir data
# 创建配置文件 config.cjs
node index.cjs
```

## 许可证

本项目基于 Affero 通用公共许可证（AGPL）v3.0 授权，并附加以下条款：

- 严禁商业用途，除非已获得原作者的书面许可。
- 有关完整细则，请参阅 [LICENSE 文件](LICENSE)。
