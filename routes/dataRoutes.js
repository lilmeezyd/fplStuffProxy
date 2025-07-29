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
    updateEvents,
    addPlayersList8
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
router.post('/fixtures', loadFixtures)
router.post('/load', loadData)
router.post('/list2', addPlayersList2)
router.post('/list3', addPlayersList3)
router.post('/list4', addPlayersList4)
router.post('/list5', addPlayersList5)
router.post('/list6', addPlayersList6)
router.post('/list7', addPlayersList7)
router.post('/list8', addPlayersList8)

export default router