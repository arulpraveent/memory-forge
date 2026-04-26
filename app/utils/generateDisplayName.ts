import names from '~/data/names.json'

export function generateDisplayName(): string {
  const first = names.first[Math.floor(Math.random() * names.first.length)]!
  const second = names.second[Math.floor(Math.random() * names.second.length)]!
  return `${first}${second}`
}
