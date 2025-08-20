# Any Listen

English | [中文](README_zh.md) | [日本語](README_jp.md)

A cross-platform private music playback service.

Note: This project is under active development and currently only provides a web version. You can deploy it directly to your server or use Docker for deployment.

## Usage

### Docker Deployment

[https://hub.docker.com/r/lyswhut/any-listen-web-server](https://hub.docker.com/r/lyswhut/any-listen-web-server)

### Direct Deployment

Download the latest release and extract it to your target directory: [https://github.com/any-listen/any-listen-web-server/releases](https://github.com/any-listen/any-listen-web-server/releases)

Refer to [https://github.com/lyswhut/lx-music-sync-server](https://github.com/lyswhut/lx-music-sync-server) for deployment instructions. See below for configuration file details.

---

**Example usage:**

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
      // 'upstreamProxy.enabled': false, // Enable proxy forwarding
      // 'upstreamProxy.header': '', // Proxy forwarding header (e.g. `x-real-ip`)
      // 'extension.ghMirrorHosts': [], // Extension store Github mirror addresses

      // Allowed local directories
      // allowPublicDir: ['G:', 'E:\\music'], // Windows example
      // allowPublicDir: ['/music'], // Linux example
      password: '123456a', // Login password
    }

    module.exports = config
    ```

2. Run the Docker container

    **Note: The following command is for reference only and cannot be used directly!**

    ```bash
    docker run --volume=/home/music:/music --volume=/data:/server/data -p 8080:9500 -d test:latest
    ```

Environment variable description:

|        Variable Name        | Description                                                                                  |
| :-------------------------: | -------------------------------------------------------------------------------------------- |
|           `PORT`            | Bind port, default `9500`                                                                    |
|          `BIND_IP`          | Bind IP, default `127.0.0.1`. Set to `0.0.0.0` to accept all IPv4 requests, `::` for all IPs |
|   `UPSTREAM_PROXY_HEADER`   | Proxy forwarding header (e.g. `x-real-ip`), enabling this will automatically enable proxy    |
|     `ALLOW_PUBLIC_DIR`      | Allowed local directories, separate multiple with commas                                     |
|         `DATA_PATH`         | Data storage path, default `./data`                                                          |
|         `LOGIN_PWD`         | Login password                                                                               |
|        `CONFIG_PATH`        | Config file path, default `./data/config.js`                                                 |
|         `LOG_PATH`          | Log storage path, default `./data/logs`                                                      |
| `EXTENSION_GH_MIRROR_HOSTS` | Extension store Github mirror addresses, separate multiple with commas                       |

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

Contributions are welcome! To help your PR get merged smoothly, please note the following:

- For new features, it is recommended to create an Issue first to confirm necessity.
- For bug fixes, please provide details and reproduction steps.
- For other types of PRs, include appropriate explanations.

Steps to contribute:

1. Clone the repository and switch to the `dev` branch for development.
2. Submit your PR to the `dev` branch.

## License

This project is licensed under the Affero General Public License (AGPL) v3.0 with the following additional terms:

- Commercial use is strictly prohibited unless prior written permission is obtained from the original author.
- See the [LICENSE file](LICENSE) for full details.
