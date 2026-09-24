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


## Docker Compose deployment

### 1. Create the server directory

Create the following directory structure:

```text
any-listen-server/
├── docker-compose.yml
└── data/
    └── config.cjs
```

### 2. Create `docker-compose.yml`

Create `docker-compose.yml` in the `any-listen-server` directory:

```yaml
services:
  any-listen:
    image: lyswhut/any-listen-web-server:latest
    container_name: any-listen
    restart: unless-stopped

    ports:
      - "9500:9500"

    volumes:
      # Persistent data and configuration
      - ./data:/server/data

      # Music directory
      - D:/Tools/lx-music/music:/music
```

> [!NOTE]
> The path on the left side of a volume mapping is the path on the host machine. The path on the right side is the path inside the container.
>
> For example, `D:/Tools/lx-music/music:/music` maps the host directory `D:/Tools/lx-music/music` to `/music` inside the container.

If your music directory is different, replace the host path accordingly.

For example:

```yaml
volumes:
  - D:/Music:/music
```

### 3. Configure the server

Create `data/config.cjs`:

```js
const config = {
  // Allowed directories inside the container
  allowPublicDir: ['/music'],

  // Login password
  password: '123456a',
}

module.exports = config
```

> [!NOTE]
> `allowPublicDir` must use the path inside the container, not the host path.
>
> For example, if the host directory `D:/Tools/lx-music/music` is mounted as `/music`, configure:
>
> ```js
> allowPublicDir: ['/music']
> ```
>
> Do not use `D:/Tools/lx-music/music` in `allowPublicDir`.

### 4. Start the server

Run:

```bash
docker compose up -d
```

Check the container status:

```bash
docker compose ps
```

View the server logs:

```bash
docker compose logs -f
```

The server can then be accessed at:

```text
http://<server-ip>:9500
```

### 5. Stop the server

```bash
docker compose down
```

This removes the container but does not remove the `data` directory or its contents.

### 6. Restart the server

```bash
docker compose restart
```

### 7. Update the server

Pull the latest image and recreate the container:

```bash
docker compose pull
docker compose up -d
```

The `data` directory is preserved during the update.
