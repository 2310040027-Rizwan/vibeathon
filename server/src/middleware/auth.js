import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const getTokenFromRequest = (req) => {
	// Prefer Authorization: Bearer <token>, fall back to cookie 'token'
	const authHeader = req.headers.authorization || ''
	if (authHeader.startsWith('Bearer ')) return authHeader.split(' ')[1]
	if (req.cookies && req.cookies.token) return req.cookies.token
	return null
}

export const requireAuth = async (req, res, next) => {
	try {
		const token = getTokenFromRequest(req)
		if (!token) return res.status(401).json({ message: 'Unauthorized' })
		const decoded = jwt.verify(token, process.env.JWT_SECRET)
		const user = await User.findById(decoded.id).select('-password')
		if (!user) return res.status(401).json({ message: 'User not found' })
		// Convert to plain object and ensure _id and id are both present
		req.user = {
			_id: user._id.toString(),
			id: user._id.toString(),
			name: user.name,
			email: user.email,
			role: user.role
		}
		next()
	} catch (err) {
		return res.status(401).json({ message: 'Invalid or expired token' })
	}
}

export const authorizeRoles = (...roles) => (req, res, next) => {
	if (!req.user) return res.status(401).json({ message: 'Unauthorized' })
	if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' })
	next()
}
