# Docker server deployment guide

## Docker deployment

Image release: [https://hub.docker.com/r/lyswhut/any-listen-web-server](https://hub.docker.com/r/lyswhut/any-listen-web-server)

## Direct deployment

> [!TIP]
> Requires Node.js 20+

Download the latest version and extract it to your target directory: [https://github.com/any-listen/any-listen-web-server/releases](https://github.com/any-listen/any-listen-web-server/releases)

Refer to [https://github.com/lyswhut/lx-music-sync-server](https://github.com/lyswhut/lx-music-sync-server) for deployment methods. See below for configuration file instructions.

Upgrade steps:

1. Delete the `public` and `server` folders in the old project directory
2. Upload the new version's `public` and `server` folders to the project directory
3. Restart the service

---

**Usage example:**

1. Create the configuration file `data/config.cjs`

    ```js
    const config = {
      // port: '9500', // Bind port
      // bindIp: '127.0.0.1', // Bind IP
      // httpLog: true, // Enable HTTP request logging
      // 'cors.enabled': false, // Enable CORS
      // 'cors.whitelist': [ // Allowed CORS domains, empty array allows all
      //   // 'www.xxx.com',
      // ],
      // 'upstreamProxy.enabled': false, // Use proxy for requests
      // 'upstreamProxy.header': '', // Proxy request header (e.g. `x-real-ip`)
      // 'extension.ghMirrorHosts': [], // Extension store GitHub mirror addresses
      // httpProxy: '', // Proxy server address, e.g. `127.0.0.1:2080`

      // Allowed local directories
      // allowPublicDir: ['G:', 'E:\\music'], // Windows example
      // allowPublicDir: ['/music'], // Linux example
      password: '123456a', // Login password
    }

    module.exports = config
    ```

2. Run the Docker container

    > Note: The following command is for example only and cannot be used directly!

    ```bash
    docker run --volume=/home/music:/music --volume=/data:/server/data -p 8080:9500 -d test:latest
    ```

### Environment variables

|        Variable Name        | Description                                                                                  |
| :-------------------------: | -------------------------------------------------------------------------------------------- |
|           `PORT`            | Bind port, default `9500`                                                                    |
|          `BIND_IP`          | Bind IP, default `127.0.0.1`, set to `0.0.0.0` to accept all IPv4 requests, `::` for all IPs |
|   `UPSTREAM_PROXY_HEADER`   | Proxy request header (e.g. `x-real-ip`), enables proxy when set                              |
|     `ALLOW_PUBLIC_DIR`      | Allowed local directories, separate multiple with commas                                     |
|         `DATA_PATH`         | Data storage path, default `./data`                                                          |
|         `LOGIN_PWD`         | Login password                                                                               |
|        `CONFIG_PATH`        | Config file path, default `./data/config.js`                                                 |
|         `LOG_PATH`          | Log storage path, default `./data/logs`                                                      |
| `EXTENSION_GH_MIRROR_HOSTS` | Extension store GitHub mirror addresses, separate multiple with commas                       |
|        `HTTP_PROXY`         | Proxy server, e.g. `127.0.0.1:2080`                                                          |

## Build from source code

```bash
pnpm install
pnpm run build:web
cd build
mkdir data
# Create config file config.cjs
node index.cjs
```
