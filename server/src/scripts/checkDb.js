import dotenv from 'dotenv'
import mongoose from 'mongoose'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

// Load .env from project root (server/.env) explicitly to avoid CWD issues
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.resolve(__dirname, '../../.env')
const exists = fs.existsSync(envPath)
console.log(`[check:db] Using env at: ${envPath} (exists: ${exists})`)
dotenv.config({ path: envPath, debug: true })

try {
  const raw = fs.readFileSync(envPath, 'utf8')
  const line = raw.split(/\r?\n/).find(l => l.trim().toUpperCase().startsWith('MONGODB_URI='))
  console.log(`[check:db] .env contains MONGODB_URI line: ${Boolean(line)}`)
} catch {}

if (!process.env.MONGODB_URI) {
  console.log('[check:db] Retrying by manual parse of .env as buffers...')
  try {
    const buf = fs.readFileSync(envPath)
    const tryParse = (text) => {
      const line = text.split(/\r?\n/).find(l => l.trim().toUpperCase().startsWith('MONGODB_URI='))
      if (line) {
        const val = line.substring(line.indexOf('=') + 1).trim()
        if (val) process.env.MONGODB_URI = val
      }
    }
    tryParse(buf.toString('utf8'))
    if (!process.env.MONGODB_URI) tryParse(buf.toString('utf16le'))
  } catch {}
}

const uri = process.env.MONGODB_URI
if (!uri) {
  console.error('MONGODB_URI is not set in .env')
  process.exit(1)
}

async function main() {
  try {
    mongoose.set('strictQuery', true)
    await mongoose.connect(uri)
    console.log('OK: Connected to MongoDB')
  } catch (err) {
    console.error('FAIL: Could not connect to MongoDB')
    console.error(err.message)
    process.exit(2)
  } finally {
    await mongoose.disconnect()
  }
}

main()
