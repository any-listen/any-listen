type Tables =
  | 'metadata'
  | 'my_list'
  | 'my_list_music_info'
  | 'index_my_list_music_info'
  | 'my_list_music_info_order'
  | 'index_my_list_music_info_order'
  | 'play_list_music_info'
  | 'music_info_other_source'
  | 'index_music_info_other_source'
  | 'lyric'
  | 'music_url'
  | 'download_list'
  | 'dislike_list'
  | 'play_count'
  | 'log'

const tables = new Map<Tables, string>()

tables.set(
  'metadata',
  `
  CREATE TABLE "metadata" (
    "field_name" TEXT NOT NULL,
    "field_value" TEXT,
    UNIQUE("field_name") ON CONFLICT REPLACE
  );
`
)
tables.set(
  'my_list',
  `
  CREATE TABLE "my_list" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "parent_id" TEXT,
    "meta" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    PRIMARY KEY("id")
  );
`
)
tables.set(
  'my_list_music_info',
  `
  CREATE TABLE "my_list_music_info" (
    "id" TEXT NOT NULL,
    "list_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "singer" TEXT NOT NULL,
    "interval" TEXT,
    "is_local" INTEGER NOT NULL,
    "meta" TEXT NOT NULL,
    UNIQUE("id","list_id") ON CONFLICT REPLACE
  );
`
)
tables.set(
  'index_my_list_music_info',
  `
  CREATE INDEX "index_my_list_music_info" ON "my_list_music_info" (
    "id",
    "list_id"
  );
`
)
tables.set(
  'my_list_music_info_order',
  `
  CREATE TABLE "my_list_music_info_order" (
    "list_id" TEXT NOT NULL,
    "music_id" TEXT NOT NULL,
    "order" INTEGER NOT NULL
  );
`
)
tables.set(
  'index_my_list_music_info_order',
  `
  CREATE INDEX "index_my_list_music_info_order" ON "my_list_music_info_order" (
    "list_id",
    "music_id"
  );
`
)
tables.set(
  'music_info_other_source',
  `
  CREATE TABLE "music_info_other_source" (
    "source_id" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "singer" TEXT NOT NULL,
    "interval" TEXT,
    "meta" TEXT NOT NULL,
    "time" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    UNIQUE("source_id","id") ON CONFLICT REPLACE
  );
`
)
tables.set(
  'index_music_info_other_source',
  `
  CREATE INDEX "index_music_info_other_source" ON "music_info_other_source" (
    "source_id",
    "id"
  );
`
)
tables.set(
  'play_list_music_info',
  `
  CREATE TABLE "play_list_music_info" (
    "item_id" string NOT NULL,
    "position" INTEGER NOT NULL,
    "played" INTEGER NOT NULL,
    "play_later" INTEGER NOT NULL,
    "id" TEXT NOT NULL,
    "list_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "singer" TEXT NOT NULL,
    "interval" TEXT,
    "is_local" INTEGER NOT NULL,
    "meta" TEXT NOT NULL,
    UNIQUE("item_id")
  );
`
)
tables.set(
  'lyric',
  `
  -- TODO  "meta" TEXT NOT NULL,
  CREATE TABLE "lyric" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "singer" TEXT,
    "interval" TEXT,
    "lyric" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    UNIQUE("id","type") ON CONFLICT REPLACE
  );
`
)
tables.set(
  'music_url',
  `
  CREATE TABLE "music_url" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    UNIQUE("id") ON CONFLICT REPLACE
  );
`
)
tables.set(
  'download_list',
  `
  CREATE TABLE "download_list" (
    "id" TEXT NOT NULL,
    "is_complate" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "status_text" TEXT NOT NULL,
    "progress_downloaded" INTEGER NOT NULL,
    "progress_total" INTEGER NOT NULL,
    "url" TEXT,
    "quality" TEXT NOT NULL,
    "ext" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "music_info" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    PRIMARY KEY("id")
  );
`
)
tables.set(
  'dislike_list',
  `
  CREATE TABLE "dislike_list" (
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "meta" TEXT
  );
`
)
tables.set(
  'play_count',
  `
  CREATE TABLE "play_count" (
    "name" TEXT NOT NULL,
    "singer" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "time" INTEGER NOT NULL,
    "meta" TEXT,
    UNIQUE("name","singer") ON CONFLICT REPLACE
  );
`
)
// time actionName
tables.set(
  'log',
  `
  -- type: music_play list_play
  CREATE TABLE "log" (
    "time" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL
  );
`
)

export default tables

export const DB_VERSION = '1'
