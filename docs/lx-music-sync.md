# LX Music sync protocol

This document describes the wire protocol implemented by [`lx-music-sync-server`](https://github.com/lyswhut/lx-music-sync-server) and consumed by the built-in `internal.lx-sync` extension (`packages/shared/app/modules/worker/extensionService/internalExtension/extensions/lxSync`).

The protocol has four layers:

1. HTTP handshake (`/hello`, `/id`, `/ah`) — server identification and pairing.
2. WebSocket session (`/socket?i=<clientId>&t=<token>`) — a long-lived connection.
3. Message framing — plain JSON, gzipped + base64 encoded (`cg_` prefix) when the payload is larger than 1024 characters.
4. RPC — `message2call` 0.1.3 object messages, with a per-group serial queue.

## 1. HTTP handshake

All requests are plain `GET`s.

| Endpoint | Response                                      |
| -------- | --------------------------------------------- |
| `/hello` | `Hello~::^-^::~v4~` — protocol version marker |
| `/id`    | `OjppZDo6` + server id                        |
| `/ah`    | authentication result (see below)             |

### Pairing (first connection)

The server user password is known to the client (the "connection code", configured per user through `LX_USER_xxx` on the server).

```
key = base64( md5(connectionCode)[0..16] )        # 16 ascii chars -> 16 byte AES key
{publicKey, privateKey} = RSA-2048, spki/pkcs8 PEM

payload = 'lx-music auth::\n' + publicKey(without PEM header/footer and newlines) + '\n' + deviceName + '\nlx_music_desktop'
GET /ah   header m: base64( AES-128-ECB(payload, key) )
```

On success the response body is `base64( RSA-OAEP( JSON{ clientId, key, serverName } ) )`, decrypted with the generated private key. `clientId` and `key` have to be persisted and are reused for every later connection.

### Re-authentication

```
payload = 'lx-music auth::' + deviceName
GET /ah   header i: clientId, header m: base64( AES-128-ECB(payload, keyInfo.key) )
```

The response is `base64( AES-128-ECB( 'Hello~::^-^::~v4~', keyInfo.key ) )`.

Error responses are plain text: `Auth failed`, `Missing auth code`, `Blocked IP` (more than 10 failed attempts from one IP). Any non-200 status must be treated as a failure.

## 2. WebSocket session

```
ws://host/socket?i=<encodeURIComponent(clientId)>&t=<encodeURIComponent(base64(AES-128-ECB('lx-music connect', key)))>
```

The upgrade request is rejected with `401 Unauthorized` when the token does not decrypt to `lx-music connect`. A client id that is unknown to the server (or belongs to another user) is closed with code `4100`; a duplicated client id closes the previous connection with code `1000`.

Keepalive: the server pings every 30 s and terminates connections that did not answer the previous ping. The client should consider the connection dead after ~31 s without traffic and reconnect with a backoff.

## 3. Message framing

Messages are JSON strings. Payloads longer than 1024 characters are compressed:

```
frame = 'cg_' + base64( gzip( json ) )
```

No encryption is applied to the session itself.

## 4. RPC

The RPC layer is `message2call@0.1.3` (the version required by the server). Its wire format is an object, **not** the array format of `message2call@2.x`:

```jsonc
// request
{ "name": "event-name", "path": ["list_sync_get_list_data"], "data": [] }
// response
{ "name": "event-name", "error": null, "data": { /* result */ } }
```

`name` is `path.join('.') + '__' + random`. A message that carries a `path` is a request (the receiver resolves the function through the path, calls it with `data` and replies with the same `name`); a message without a `path` is a response.

Requests sent through `createQueueRemote('list')` are serialized: the next request of the same group is only sent after the previous one has completed. The default timeout is 120 s.

## 5. Sync flow

The **server** drives the session. Right after the connection is established it calls the client:

| Client method                                           | Meaning                         |
| ------------------------------------------------------- | ------------------------------- |
| `getEnabledFeatures('server', { list: 1, dislike: 1 })` | which features should be synced |
| `finished()`                                            | session is over                 |

For every enabled feature the server runs the corresponding module. For `list`:

| Server -> client                | Meaning                                        |
| ------------------------------- | ---------------------------------------------- |
| `list_sync_get_md5()`           | client list digest                             |
| `list_sync_get_sync_mode()`     | the sync mode chosen by the client             |
| `list_sync_get_list_data()`     | full local list data                           |
| `list_sync_set_list_data(data)` | replace the local list data with `data`        |
| `list_sync_finished()`          | feature finished                               |
| `onListSyncAction(action)`      | incremental change performed by another device |

After `list_sync_finished()` the server marks the module ready for that connection and broadcasts every later change of the other devices. Changes are sent as one of the twelve list actions (`list_create`, `list_remove`, `list_update`, `list_music_add`, `list_music_remove`, `list_music_move`, `list_music_update`, `list_music_overwrite`, `list_music_clear`, `list_music_update_position`, `list_update_position`, `list_data_overwrite`).

### 5.1 Dislike module

The `dislike` feature is a single rule string, so the flow is the same but much smaller:

| Server -> client                    | Meaning                                                                    |
| ----------------------------------- | -------------------------------------------------------------------------- |
| `dislike_sync_get_md5()`            | `md5(rules.trim())` — must match the server snapshot key to skip the merge |
| `dislike_sync_get_sync_mode()`      | the sync mode chosen by the client                                         |
| `dislike_sync_get_list_data()`      | the full local rule string                                                 |
| `dislike_sync_set_list_data(rules)` | replace the local rules                                                    |
| `dislike_sync_finished()`           | feature finished                                                           |
| `onDislikeSyncAction(action)`       | `dislike_data_overwrite` / `dislike_music_add` / `dislike_music_clear`     |

Rule string format (identical on the server and in LX Music / Any Listen): one rule per line, `name@singer` for a music rule, `@singer` for a singer-only rule; `@` inside a value is escaped as `#`; values are lower-cased and trimmed, duplicates removed with a `Set`.

Data shapes:

```ts
interface ListData {
  defaultList: MusicInfo[]
  loveList: MusicInfo[]
  userList: {
    id: string
    name: string
    source?: string
    sourceListId?: string
    locationUpdateTime: number | null
    list: MusicInfo[]
  }[]
}

interface MusicInfo {
  id: string // `${source}_${songmid}`
  name: string
  singer: string
  source: 'kw' | 'wy' | 'kg' | 'tx' | 'mg' | 'local'
  interval: string | null
  meta: { songId: string | number; albumName: string; picUrl?: string | null }
  qualitys?: { type: string; size: string | null }[]
}
```

Sync modes: `merge_local_remote`, `merge_remote_local`, `overwrite_local_remote`, `overwrite_remote_local` (the server also has `*_full` variants that drop the snapshots and the `cancel` mode used to abort a running sync).

## Reference implementation

- Server: [`lx-music-sync-server/src/server`](https://github.com/lyswhut/lx-music-sync-server/tree/master/src/server)
- LX Music desktop client: [`lx-music-desktop/src/main/modules/sync/client`](https://github.com/lyswhut/lx-music-desktop/tree/master/src/main/modules/sync/client)
- Any Listen: `packages/shared/app/modules/worker/extensionService/internalExtension/extensions/lxSync/protocol`
