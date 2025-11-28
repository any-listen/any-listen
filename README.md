<p align="center"><a href="https://github.com/any-listen/any-listen"><img height="110" src="./docs/images/header-logo.svg" alt="any-listen logo"></a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="https://github.com/any-listen/any-listen"><img height="86" src="./docs/images/header-name.svg" alt="any-listen name"></a></p>

<p align="center">A cross-platform private music playback service</p>

<br />

English | [简体中文](./docs/README_zh.md) | [繁體中文](./docs/README_zh-tw.md)

This project is under active development and currently provides both a **Desktop version** and a **Web service version**.

### Features

- Add and play local songs (standard playlists and local lists)
- Add and play songs stored on WebDAV (remote lists)
- Online song metadata matching (cover, lyrics; install the relevant extension via Extension Manager)
- Experimental audio effects
- Karaoke lyrics and title bar lyrics

## Desktop Version

Download the latest version and install: [https://github.com/any-listen/any-listen-desktop/releases](https://github.com/any-listen/any-listen-desktop/releases)

## Web Version

You can deploy it directly to your server, or use Docker for deployment.

### Docker Deployment

Image release: [https://hub.docker.com/r/lyswhut/any-listen-web-server](https://hub.docker.com/r/lyswhut/any-listen-web-server)

### Direct Deployment

Download the latest version and extract it to your target directory: [https://github.com/any-listen/any-listen-web-server/releases](https://github.com/any-listen/any-listen-web-server/releases)

Refer to [https://github.com/lyswhut/lx-music-sync-server](https://github.com/lyswhut/lx-music-sync-server) for deployment methods. See below for configuration file instructions.

---

**Usage Example:**

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
      // 'extension.ghMirrorHosts': [], // Extension store Github mirror addresses
      // httpProxy: '', // Proxy server address, e.g. `127.0.0.1:2080`

      // Allowed local directories
      // allowPublicDir: ['G:', 'E:\\music'], // Windows example
      // allowPublicDir: ['/music'], // Linux example
      password: '123456a', // Login password
    }

    module.exports = config
    ```

2. Run the Docker container

    **Note: The following command is for example only and cannot be used directly!**

    ```bash
    docker run --volume=/home/music:/music --volume=/data:/server/data -p 8080:9500 -d test:latest
    ```

Environment variable description

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
| `EXTENSION_GH_MIRROR_HOSTS` | Extension store Github mirror addresses, separate multiple with commas                       |
|        `HTTP_PROXY`         | Proxy server, e.g. `127.0.0.1:2080`                                                          |

### Build from Source

```bash
pnpm install
pnpm run build:web
cd build
mkdir data
# Create config file config.cjs
node index.cjs
```

## Contributing

PRs are welcome! To ensure your PR can be merged smoothly, please note the following:

- For PRs adding new features, it is recommended to create an Issue first to confirm the necessity of the feature.
- For PRs fixing bugs, please provide explanations and reproduction steps before and after the fix.
- For other types of PRs, please include appropriate explanations.

Steps to contribute:

1. Clone the repository and switch to the `dev` branch for development;
2. Submit your PR to the `dev` branch.

## License

This project is licensed under the Affero General Public License (AGPL) v3.0 with the following additional terms:

- Commercial use is strictly prohibited unless written permission is obtained from the original author.
- For full details, please refer to the [LICENSE file](./LICENSE).
