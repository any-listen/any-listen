# LX Music Sync

Sync the local playlists with a [LX Music sync server](https://github.com/lyswhut/lx-music-sync-server), so that Any Listen and the LX Music client (desktop / mobile) share the same song lists.

> Extension id: `internal.lx-sync`

## Why is this an internal extension?

A normal (third-party) extension runs inside the extension VM (`packages/shared/app/modules/worker/extensionService/vm`). The VM sandbox exposes exactly one network primitive — `api.request()`, i.e. plain HTTP — and the host grant list is limited to `music_list` / `player` / `internet` / `isolate_context`. The LX Music sync protocol, however, is a **bidirectional WebSocket RPC session** with a custom auth handshake, so it cannot be implemented from inside the VM.

Internal extensions are plain TypeScript executed in the extension worker process itself (`internalExtension/index.ts` → `loadExtension()`), therefore this extension can use `node:crypto`, `node:zlib` and `ws` directly. This is the same mechanism used by the built-in `internal.webdav` extension.

See `docs/lx-music-sync.md` in the repository root for the protocol description.

## Server side

Deploy [lx-music-sync-server](https://github.com/lyswhut/lx-music-sync-server), for example:

```yaml
services:
  lx-music-sync-server:
    image: lyswhut/lx-music-sync-server:latest
    container_name: lx-music-sync-server
    restart: unless-stopped
    ports:
      - '9527:9527'
    environment:
      - NODE_ENV=production
      - PORT=9527
      - BIND_IP=0.0.0.0
      - SERVER_NAME=My Sync Server
      # one environment variable per user: LX_USER_<user>=<password>
      - LX_USER_anylisten=change-me
    volumes:
      - ./data:/server/data
```

The user name of `LX_USER_anylisten` is `anylisten`, its password is `change-me`. In the server configuration file the users are the only accounts allowed to connect.

## Client side

1. Enable the `LX Music Sync` extension (internal extensions are loaded automatically, the settings are under `Settings → Extension Settings → LX Music Sync`).
2. Fill in the server address, the connection code (the password from `LX_USER_xxx`) and a device name.
3. Keep `Auto sync` enabled so the client connects on startup.

### Settings

| Field              | Description                                                                  |
| ------------------ | ---------------------------------------------------------------------------- |
| `serverUrl`        | Base address of the sync server, e.g. `http://192.168.1.10:9527`             |
| `authCode`         | Password of the server user (`LX_USER_xxx`), used only for the first pairing |
| `deviceName`       | Name shown on the other devices                                              |
| `syncMode`         | How local and remote lists are merged when both sides have data              |
| `autoSync`         | Connect on startup and keep the connection for real-time updates             |
| `autoSyncInterval` | Reconnect + sync interval in minutes, `0` disables the periodic sync         |

`syncMode` values: `merge_local_remote` (merge, local order wins), `merge_remote_local` (merge, remote order wins), `overwrite_local_remote` (push local to the server), `overwrite_remote_local` (pull the server list over the local one).

### Commands

- `LX Music Sync: Sync now` (`sync-now`)
- `LX Music Sync: Show sync status` (`sync-status`) — sends the current client status as a message

## Sync behaviour

1. **Pairing / authentication** — on the first connection the extension performs the LX Music HTTP handshake (`/hello` → `/id` → `/ah` with the connection code), stores the returned `clientId` + AES key in `storage/keyInfo.json` and reuses it afterwards.
2. **Initial sync** — the server drives the session: it asks the client for the enabled features, then runs the `list` and the `dislike` module. Depending on which side has data the data is pushed, pulled or merged (in `merge_*` modes the server merges both sides and may push the merged result back). The whole exchange is queued through the `list` / `dislike` RPC queues.
3. **Real-time updates** — once the sync has finished, the server broadcasts every change of other devices (`onListSyncAction`, `onDislikeSyncAction`) and the extension applies it locally.
4. **Local changes** — a 15 s timer diffs the local lists against the last synced snapshot and uploads the differences (`list_create` / `list_remove` / `list_update` / `list_music_add` / `list_music_remove` / `list_music_overwrite`). Local dislike rule changes are uploaded as a whole (`dislike_data_overwrite`), because the dislike list is a single rule string. Uploading is skipped while a sync is running or before the first sync has completed, so a stale local state never overwrites the server.

Connection handling: heartbeat every 31 s, reconnect with backoff (2 s → 15 s max), no reconnect if the server closed the connection with code `4100` (auth failed / unknown client) — a new pairing is required in that case.

## Data mapping

| LX Music                                              | Any Listen                                     |
| ----------------------------------------------------- | ---------------------------------------------- |
| `MusicInfo.id` (`${source}_${songmid}`)               | `MusicInfo.id` (same scheme)                   |
| `MusicInfo.meta.songId`                               | `MusicInfo.meta.musicId`                       |
| `MusicInfo.source` (`kw`/`wy`/`kg`/`tx`/`mg`/`local`) | `MusicInfo.meta.source`                        |
| `MusicInfo.meta.albumName`                            | `MusicInfo.meta.albumName`                     |
| `ListData.defaultList` / `loveList` (arrays)          | `defaultList` / `loveList` (`{ list: [...] }`) |
| `ListData.userList[].id` / `name`                     | `userList[].id` / `name` (`type: 'general'`)   |

The list meta fields required by Any Listen (`songCount`, `createTime`, `updateTime`, `posTime`, …) are recalculated locally.

The dislike list is synced as well: both sides store it as a single rule string (`name@singer` per line, `@singer` for a singer-only rule) and normalize it the same way (lower case, trimmed, de-duplicated), so the rules can be exchanged verbatim.

## Limitations

- Lyrics, covers and play URLs are not synced — LX Music syncs list entries only.
- The protocol uses the message2call **0.1.3** wire format (object based messages). The `message2call@2.x` dependency used elsewhere in this repository is **not** compatible, so a small compatible layer is bundled in `protocol/msg2call.ts`.
- The dislike sync needs the `getDislikeRules` / `dislikeAction` host APIs added to `AnyListen.IPCExtension.MainIPCActions` (implemented in both `web-server` and `desktop` `exposeFuncs`).

## Source layout

```
lxSync/
├── index.ts              # manifest, settings, lifecycle, sync & upload scheduling
├── client.ts             # WebSocket client: handshake, heartbeat, reconnect, RPC dispatch, broadcast sending
├── mapping.ts            # LX Music <-> Any Listen conversion, diff & apply (list and dislike)
└── protocol/
    ├── auth.ts           # /hello, /id, /ah handshake
    ├── crypto.ts         # AES-128-ECB / RSA-OAEP / gzip helpers
    ├── msg2call.ts       # message2call 0.1.3 compatible RPC layer
    └── types.ts          # LX Music sync types used by this extension
```

## Development

The extension is picked up automatically when the extension service starts — no build or installation step is required:

```bash
pnpm dev:web     # or pnpm dev:desktop
```

Logs are written to `data/app/extension/datas/internal.lx-sync/output.log`, the persisted pairing data lives in the same directory (`storage/keyInfo.json`).

To debug the protocol without starting the app, the client and the auth helpers can be bundled on their own:

```bash
esbuild packages/shared/app/modules/worker/extensionService/internalExtension/extensions/lxSync/client.ts \
  --bundle --platform=node --format=cjs --target=node20 \
  --external:bufferutil --external:utf-8-validate --outfile=/tmp/lx-client.cjs
```

(`--format=cjs` is required, `ws` cannot be bundled as ESM for node without extra shims.)
