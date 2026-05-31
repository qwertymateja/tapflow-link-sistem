import { NextResponse } from 'next/server'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const dataPath = join(process.cwd(), 'data', 'profile.json')

function readProfile() {
  return JSON.parse(readFileSync(dataPath, 'utf-8'))
}

function saveProfile(profile: object) {
  writeFileSync(dataPath, JSON.stringify(profile, null, 2))
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const profile = readProfile()
  profile.links = profile.links.filter((l: { id: string }) => l.id !== params.id)
  saveProfile(profile)
  return NextResponse.json({ success: true })
}
