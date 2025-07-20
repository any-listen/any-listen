# Any Listen

[English](README.md) | [中文](README_zh.md) | 日本語

クロスプラットフォームの個人用音楽再生サービス。

注意：プロジェクトはまだ積極的に開発中です。現時点ではウェブ版のサービスのみ提供しています。サーバーに直接デプロイするか、Docker を使用してデプロイすることができます。

## 使い方です

### Docker デプロイ

[https://hub.docker.com/r/lyswhut/any-listen-web-server](https://hub.docker.com/r/lyswhut/any-listen-web-server)

### ディレクトリ

最新バージョンをダウンロードして、目標ディレクトリに解凍してください：[https://github.com/any-listen/any-listen-web-server/releases](https://github.com/any-listen/any-listen-web-server/releases)

参考にします [https://github.com/lyswhut/lx-music-sync-server](https://github.com/lyswhut/lx-music-sync-server) のデプロイ方法について、設定ファイルの説明は以下にあります。

---

**使用例です：**

1. `data/config.cjs` ファイルを作成します。

   ```js
   const config = {
     // port: '9500', // 绑固定ポート
     // bindIp: '127.0.0.1', // IP アドレスのバインド
     // httpLog: true, // HTTP リクエストログを有効にしていますか？
     // 'cors.enabled': false, // クロスオリジンリソース共有を有効にしますか？
     // 'cors.whitelist': [ // ドメインにまたがるドメイン名を許可します空の配列はすべてのドメイン名を許可します
     //   // 'www.xxx.com',
     // ],
     // 'upstreamProxy.enabled': false, // 代理を使用してリクエストを転送しますか？
     // 'upstreamProxy.header': '', // 代理転送リクエストヘッダー（例：`x-real-ip`）
     // 'extension.ghMirrorHosts': [], // 拡張ストアのGitHubミラーのアドレス

     // アクセス許可されたローカルディレクトリ
     // allowPublicDir: ['G:', 'E:\\music'], // Windowsの例
     // allowPublicDir: ['/music'], // Linuxの例
     password: '123456a', // ログインパスワード 
    }

    module.exports = config
    ```

2. Dockerコンテナを実行します

    **注意：以下のコマンドは例示のため、直接使用しないでください！**

    ```bash
    docker run --volume=/home/music:/music --volume=/data:/server/data -p 8080:9500 -d test:latest
    ```

環境変数の説明

|           変数名            | 説明                                                                                     |
| :-------------------------: | ---------------------------------------------------------------------------------------- |
|           `PORT`            | バインディングポート,デフォルト `9500` です                                                                    |
|          `BIND_IP`          | IPをバインドすると、デフォルトは `127.0.0.1` に設定されており、`0.0.0.0` に設定するとすべてのIPv4リクエストを受け入れ、`::` に設定するとすべてのIPリクエストを受け入れます。 |
|   `UPSTREAM_PROXY_HEADER`   | 代理転送リクエストヘッダー（例： `x-real-ip` ）を設定すると、自動的にプロキシが有効になります                                     |
|     `ALLOW_PUBLIC_DIR`      | 許可されたローカルディレクトリ、複数のディレクトリは英語のコンマで区切ってください                                               |
|         `DATA_PATH`         | データの保存パスは、デフォルトで `./data` です。                                                              |
|         `LOGIN_PWD`         | ログインパスワード                                                                                 |
|        `CONFIG_PATH`        | 配置ファイルのパスは、デフォルトで `./data/config.js` です。                                                    |
|         `LOG_PATH`          | 日誌の保存先はデフォルトで `./data/logs` です。                                                         |
| `EXTENSION_GH_MIRROR_HOSTS` | 拡張ストアのGitHubミラーのアドレスは、複数のアドレスを英語のコンマで区切ってください                                         |

### ソースコードのコンパイル

```bash
pnpm install
pnpm run build:web
cd build
mkdir data
# 設定ファイルの作成 config.cjs
node index.cjs
```

## コードの貢献

このリポジトリは、PRを歓迎していますが、PRがスムーズにマージされるためには、以下の点に注意する必要があります：

- 新機能を追加するための PR については、PR を作成する前に説明のために Issue を作成することをお勧めします。これにより、その機能が本当に必要かどうかを確認できます。
- バグ修正のPull Requestには、修正前と修正後の説明と再現方法を提供してください。
- 他の種類のプルリクエストについては、適切な説明を添えてください。

貢献コードステップ：

1. このリポジトリのコードをクローンし、`dev` ブランチに切り替えて開発を行います；
2. `dev` ブランチに PR を提出します。

## ライセンス

本プロジェクトは、Affero 一般公衆利用許諾（AGPL）v3.0に基づいており、以下の条件が適用されます：

- 原作者の書面による許可が得られていない限り、商業利用は厳禁です。
- 完全な規約については、[LICENSE ファイル](LICENSE) を参照してください。
