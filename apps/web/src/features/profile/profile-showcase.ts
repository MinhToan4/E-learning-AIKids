export type ProfileAvatar = {
  id: string
  url: string
  mediaId?: string
  thumbnailUrl?: string
  label: string
  source: 'upload' | 'generated' | 'library'
}

export type ShowcaseProject = {
  id: string
  title: string
  kind: string
  thumbnail: string
  content?: string
  shareStatus: string
}
