# Any Listen

English | [中文](README_zh.md)

A cross-platform private music playback service.

Note: The project is still under active development and currently only provides a web service version. You can deploy it directly to your server or use Docker.

## How to Use

### Docker Deployment

[https://hub.docker.com/r/lyswhut/any-listen-web-server](https://hub.docker.com/r/lyswhut/any-listen-web-server)

### Direct Deployment

Download the latest release and extract it to your target directory: [https://github.com/any-listen/any-listen-web-server/releases](https://github.com/any-listen/any-listen-web-server/releases)

Refer to [https://github.com/lyswhut/lx-music-sync-server](https://github.com/lyswhut/lx-music-sync-server) for deployment instructions. See below for configuration file details.

---

**Usage Example:**

1. Create the configuration file `data/config.cjs`

    ```js
    const config = {
      // port: '9500', // Bind port
      // bindIp: '127.0.0.1', // Bind IP
      // httpLog: true, // Enable HTTP request logging
      // 'cors.enabled': false, // Enable CORS
      // 'cors.whitelist': [ // Allowed CORS domains, empty array allows all domains
      //   // 'www.xxx.com',
      // ],
      // 'upstreamProxy.enabled': false, // Enable proxy forwarding
      // 'upstreamProxy.header': '', // Proxy forwarding request header (e.g. `x-real-ip`)
      // 'extension.ghMirrorHosts': [], // Extension store Github mirror hosts

      // Local directories allowed to be accessed
      // allowPublicDir: ['G:', 'E:\\music'], // Windows example
      // allowPublicDir: ['/music'], // Linux example
      password: '123456a', // Login password
    }

    module.exports = config
    ```

2. Run Docker container

    **Note: The following command is for example only and cannot be used directly!**

    ```bash
    docker run --volume=/home/music:/music --volume=/data:/server/data -p 8080:9500 -d test:latest
    ```

Environment Variables

|        Variable Name        | Description                                                                                                 |
| :-------------------------: | ----------------------------------------------------------------------------------------------------------- |
|           `PORT`            | Bind port, default `9500`                                                                                   |
|          `BIND_IP`          | Bind IP, default `127.0.0.1`. Use `0.0.0.0` to accept all IPv4 requests, use `::` to accept all IP requests |
|   `UPSTREAM_PROXY_HEADER`   | Proxy forwarding request header (e.g. `x-real-ip`). Automatically enabled if set                            |
|     `ALLOW_PUBLIC_DIR`      | Local directories allowed to be accessed, separate multiple with commas                                     |
|         `DATA_PATH`         | Data storage path, default `./data`                                                                         |
|         `LOGIN_PWD`         | Login password                                                                                              |
|        `CONFIG_PATH`        | Config file path, default `./data/config.js`                                                                |
|         `LOG_PATH`          | Log storage path, default `./data/logs`                                                                     |
| `EXTENSION_GH_MIRROR_HOSTS` | Extension store Github mirror hosts, separate multiple with commas                                          |

### Compile from Source

```bash
pnpm install
pnpm run build:web
cd build
mkdir data
# Create config.cjs
node index.cjs
```

## License

This project is licensed under the Affero General Public License (AGPL) v3.0 with the following additional terms:

- Commercial use is strictly prohibited unless prior written permission is obtained from the original author.
- See the [LICENSE file](LICENSE) for full details.
