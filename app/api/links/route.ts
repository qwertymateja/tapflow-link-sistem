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

export async function POST(request: Request) {
  const { title, url } = await request.json()
  const profile = readProfile()
  const newLink = { id: Date.now().toString(), title, url }
  profile.links.push(newLink)
  saveProfile(profile)
  return NextResponse.json(newLink)
}

export async function PUT(request: Request) {
  const { links } = await request.json()
  const profile = readProfile()
  profile.links = links
  saveProfile(profile)
  return NextResponse.json(profile.links)
}
