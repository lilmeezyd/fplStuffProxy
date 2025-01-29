import jwt from 'jsonwebtoken'
import asyncHandler from 'express-async-handler'
import User from '../models/userModel.js'

const protect = asyncHandler(async (req, res, next) => {
    let token
    const authHeader = req.headers?.authorization || req.body?.headers?.authorization || req.headers?.Authorization || req.body?.headers?.Authorization

    if(authHeader && authHeader?.startsWith('Bearer')) {
        try {
            // Get token from header
            token = authHeader.split(' ')[1]

            // verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            // Get user from token
            req.user = await User.findById(decoded.id).select('-password')

            next()
        } catch (error) {
            res.status(401)
            throw new Error('Not authorized!')
        }
    }

    if(!token) {
        res.status(401)
        throw new Error('Not authorized, no token')
    }
})

export default protect