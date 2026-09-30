export interface ChangelogVersion {
  version: string
  date: string
  desc: string
}

export const parseChangelog = (text: string): ChangelogVersion[] => {
  const versions: ChangelogVersion[] = []
  const lines = text.split(/\r\n|\r|\n/)
  let currentVersion: string | null = null
  let currentDate: string | null = null
  let currentDesc = ''

  for (const line of lines) {
    const versionMatch = /^\s*##\s+\[?(\d+\.\d+\.\d+)\]?.*?-\s+(\d{4}-\d{2}-\d{2})$/.exec(line)
    if (versionMatch) {
      if (currentVersion) {
        versions.push({
          version: currentVersion,
          date: currentDate ?? '',
          desc: currentDesc.trim(),
        })
      }
      currentVersion = versionMatch[1]
      currentDate = versionMatch[2]
      currentDesc = ''
    } else {
      currentDesc += `${line}\n`
    }
  }

  if (currentVersion) {
    versions.push({
      version: currentVersion,
      date: currentDate ?? '',
      desc: currentDesc.trim(),
    })
  }

  return versions
}
