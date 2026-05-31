import { NextResponse } from 'next/server'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const dataPath = join(process.cwd(), 'data', 'profile.json')

function readProfile() {
  return JSON.parse(readFileSync(dataPath, 'utf-8'))
}

export async function GET() {
  return NextResponse.json(readProfile())
}

export async function PUT(request: Request) {
  const body = await request.json()
  const profile = readProfile()
  const updated = { ...profile, ...body }
  writeFileSync(dataPath, JSON.stringify(updated, null, 2))
  return NextResponse.json(updated)
}
