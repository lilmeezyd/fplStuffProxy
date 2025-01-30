import express from 'express'
import { 
    registerUser,
    loginUser,
    requestPasswordReset,
    resetPassword,
    changePassword,
    loadData,
    loadFixtures,
    getElems,
    getEvents,
    getFixtures,
    getPlayers,
    getTeams,
    addPlayersList2, addPlayersList3, addPlayersList4, addPlayersList5,
    addPlayersList6, addPlayersList7,
    updateEvents
 } from '../controllers/dataController.js'
import  protect   from "../middleware/authMiddleware.js";
/*import ROLES from "../config/permissions.js";*/

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/password-reset', requestPasswordReset)
router.post('/reset', resetPassword)
router.put('/change-password', changePassword)
router.get('/getElems', getElems)
router.get('/getEvents', getEvents)
router.get('/getFixtures', getFixtures)
router.get('/getPlayers', getPlayers)
router.get('/getTeams', getTeams)
router.post('/events', updateEvents)
router.post('/fixtures', protect, loadFixtures)
router.post('/load', protect, loadData)
router.post('/list2', protect, addPlayersList2)
router.post('/list3', protect, addPlayersList3)
router.post('/list4', protect, addPlayersList4)
router.post('/list5', protect, addPlayersList5)
router.post('/list6', protect, addPlayersList6)
router.post('/list7', protect, addPlayersList7)

export default router