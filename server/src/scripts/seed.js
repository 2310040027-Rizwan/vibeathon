import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import { connectDB } from '../config/db.js'
import User from '../models/User.js'
import Event from '../models/Event.js'

dotenv.config()

async function up() {
  await connectDB()

  const ensureUser = async ({ name, email, role }) => {
    let u = await User.findOne({ email })
    if (!u) {
      const hashed = await bcrypt.hash('password123', 10)
      u = await User.create({ name, email, password: hashed, role })
      console.log('Created user', email)
    } else {
      console.log('User exists', email)
    }
    return u
  }

  const admin = await ensureUser({ name: 'Admin User', email: 'admin@klh.edu', role: 'Admin' })
  const faculty = await ensureUser({ name: 'Faculty User', email: 'faculty@klh.edu', role: 'Faculty' })
  const student = await ensureUser({ name: 'Student User', email: 'student@klh.edu', role: 'Student' })
  
  // Easy test accounts
  await ensureUser({ name: 'Test Admin', email: 'admin@test.com', role: 'Admin' })
  await ensureUser({ name: 'Test Faculty', email: 'faculty@test.com', role: 'Faculty' })
  await ensureUser({ name: 'Test Student', email: 'student@test.com', role: 'Student' })

  const today = new Date().toISOString().slice(0, 10)
  const existsEvent = await Event.findOne({ eventName: 'Welcome Meet' })
  if (!existsEvent) {
    await Event.create({ 
      name: 'Welcome Meet',
      eventName: 'Welcome Meet', 
      date: today, 
      time: '16:00', 
      venue: 'Auditorium', 
      description: 'Meet & greet session for new students', 
      category: 'Other',
      createdBy: faculty._id 
    })
    console.log('Created sample event')
  }

  console.log('Seed complete')
  await mongoose.disconnect()
}

up().catch((e) => { console.error(e); process.exit(1) })
