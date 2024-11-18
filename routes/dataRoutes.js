import express from 'express'
import { loadData,
    loadFixtures,
    getElems,
    getEvents,
    getFixtures,
    getPlayers,
    getTeams,
    addPlayersList2, addPlayersList3, addPlayersList4, addPlayersList5,
    addPlayersList6, addPlayersList7
 } from '../controllers/dataController.js'
/*import { protect, roles } from "../middleware/authMiddleware.js";
import ROLES from "../config/permissions.js";*/

const router = express.Router()

router.route('/getElems').get(getElems)
router.route('/getEvents').get(getEvents)
router.route('/getFixtures').get(getFixtures)
router.route('/getPlayers').get(getPlayers)
router.route('/getTeams').get(getTeams)
router.route('/fixtures').get(loadFixtures)
router.route('/load').get(loadData)
router.route('/list2').get(addPlayersList2)
router.route('/list3').get(addPlayersList3)
router.route('/list4').get(addPlayersList4)
router.route('/list5').get(addPlayersList5)
router.route('/list6').get(addPlayersList6)
router.route('/list7').get(addPlayersList7)

export default router