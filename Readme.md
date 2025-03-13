# Any Listen

<div align="center">
  <a href="README.md">English</a> | <a href="README_zh.md">中文</a>
</div>

A cross-platform private song playback service.

Note: The project is still under active development and only provides a web service version. You can deploy it to your server directly or using docker.

## How to use

### Docker

[https://hub.docker.com/r/lyswhut/any-listen-web-server](https://hub.docker.com/r/lyswhut/any-listen-web-server)

Use Example:

create file `data/config.cjs`

```js
const config = {
  // port: '9500', // bind port
  // bindIp: '127.0.0.1', // bind IP
  // httpLog: true, // Whether to enable HTTP request logging
  // 'cors.enabled': false, // Whether to enable cross-domain
  // 'cors.whitelist': [ // Domain names that are allowed to cross domains. An empty array allows all domain names to cross domains.
  //   // 'www.xxx.com',
  // ],
  // 'proxy.enabled': false, // Whether to use a proxy to forward requests to this server
  // 'proxy.header': '', // Proxy forwarding request headers, `x-real-ip`

  // Local directories that are allowed to be accessed
  // This is usually your music directory
  // allowPublicDir: ['G:', 'E:\\music'], // windows
  // allowPublicDir: ['/music'], // linux
  password: '123456a', // Login Password
}

module.exports = config
```

```bash
docker run --volume=/home/music:/music --volume=/data:/server/data -p 8080:9500 -d test:latest
```

Available environment variables

|    Variable Name    | Description                                                                                                       |
| :------------------: | ----------------------------------------------------------------------------------------------------------------- |
|       `PORT`       | Bind port, Default `9500`                                                                                       |
|     `BIND_IP`     | Bind IP, Default `127.0.0.1`, Use `0.0.0.0` to accept all IPv4 requests, use `::` to accept all IP requests |
|   `PROXY_HEADER`   | Proxy forwarding request headers,`x-real-ip`, If set, it is automatically enabled                               |
| `ALLOW_PUBLIC_DIR` | Local directories that are allowed to be accessed, Use `,` to separate multiple                                 |
|    `DATA_PATH`    | Data path, Default `./data`                                                                                     |
|    `LOGIN_PWD`    | Login Password                                                                                                    |
|   `CONFIG_PATH`   | Config file path, Default `./data/config.js`                                                                    |
|     `LOG_PATH`     | Log path, Default `./data/logs`                                                                                 |

### Compile from source code

```bash
pnpm i
pnpm run build:web
cd build
mkdir data
# create file `config.cjs`
node index.cjs
```

## License

This project is licensed under the Affero General Public License (AGPL) v3.0 with the following additional terms:

- Commercial use is strictly prohibited unless prior written permission is obtained from the original author.
- See the LICENSE file for full details.
