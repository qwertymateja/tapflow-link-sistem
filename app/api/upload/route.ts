import { NextResponse } from 'next/server'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('photo') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const uploadsDir = join(process.cwd(), 'public', 'uploads')
  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true })
  }

  const ext = file.name.substring(file.name.lastIndexOf('.')) || '.jpg'
  const fileName = `photo-${Date.now()}${ext}`
  writeFileSync(join(uploadsDir, fileName), Buffer.from(await file.arrayBuffer()))

  return NextResponse.json({ url: `/uploads/${fileName}` })
}
