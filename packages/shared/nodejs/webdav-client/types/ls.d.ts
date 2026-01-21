export interface Ls {
  '?xml': string
  multistatus: Multistatus
}

export interface Multistatus {
  response: Response[]
}

export interface Response {
  href: string
  propstat: Propstat
}

export interface Propstat {
  prop: Prop
  status: string
}

export interface Prop {
  getcontenttype: string
  displayname?: string
  owner: string
  resourcetype?: Resourcetype
  getcontentlength: string
  getlastmodified: string
  creationdate?: string
  'current-user-privilege-set': CurrentUserPrivilegeSet
}

export interface CurrentUserPrivilegeSet {
  privilege: PrivilegeElement[] | PurplePrivilege
}

export interface PrivilegeElement {
  read?: string
  write?: string
  all?: string
  read_acl?: string
  write_acl?: string
}

export interface PurplePrivilege {
  read: string
}

export interface Resourcetype {
  collection: string
}
