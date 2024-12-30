import axios from 'axios'
import express, { urlencoded } from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dataRoutes from './routes/dataRoutes.js'
import connectDB from './config/db.js'
const port = process.env.PORT|| 5000
import cron  from "node-cron";
import moment from "moment-timezone";
import Event from './models/eventModel.js'
import EplPlayer from "./models/eplPlayerModel.js";
const timezone = "Africa/Kampala";

dotenv.config()
const app = express()
connectDB()
app.use(express.json())
const corsConfig = {
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
} 
app.use(cors(corsConfig))
app.options("", cors(corsConfig))
app.use(express.json())
app.use(urlencoded({extended: true}))
app.use(cookieParser())

app.use('/api/data', dataRoutes)
app.get('/fixtures', (req, res) => {
  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `https://fantasy.premierleague.com/api/fixtures`,
    headers: {}
  };

  axios.request(config)
  .then((response) => {
    res.status(200).json(response.data)
  })
  .catch((error) => console.log(error))
})

/*
app.get('/bootstrap-static', (req, res) => {
  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `https://fantasy.premierleague.com/api/bootstrap-static`,
    headers: {}
  };

  axios.request(config)
  .then((response) => {
    res.status(200).json(response.data)
  })
  .catch((error) => console.log(error))
})

app.get('/element-summary/:x', (req, res) => {
  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `https://fantasy.premierleague.com/api/element-summary/${req.params.x}/`,
    headers: {}
  };

  axios.request(config)
  .then((response) => {
    res.status(200).json(response.data)
  })
  .catch((error) => console.log(error))
})*/

app.get('/:managerId', (req, res) => {
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://fantasy.premierleague.com/api/entry/${req.params.managerId}/`,
        headers: { }
      };

      axios.request(config)
      .then((response) => {
        res.status(200).json(response.data)
      })
      .catch((error) => {
        console.log(error);
      })
})

app.get('/history/:managerId', (req, res) => {
  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `https://fantasy.premierleague.com/api/entry/${req.params.managerId}/history`,
    headers: { }
  };

  axios.request(config)
  .then((response) => {
    res.status(200).json(response.data)
  })
  .catch((error) => {
    console.log(error);
  })
})

app.get('/:managerId/event/:eventId/picks', (req, res) => {
  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `https://fantasy.premierleague.com/api/entry/${req.params.managerId}/event/${req.params.eventId}/picks/`,
    headers: { }
  };


  axios.request(config)
  .then((response) => {
    res.status(200).json(response.data)
  })
  .catch((error) => {
    //const errMsg = error?.response?.data?.msg || error?.message;
    const errMsg = error?.response?.statusText
    res.status(error?.response?.status).json(errMsg)
    
  })
})

app.get('/transfers/:managerId', (req, res) => {
  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `https://fantasy.premierleague.com/api/entry/${req.params.managerId}/transfers/`,
    headers: { }
  };

  axios.request(config)
  .then((response) => {
    res.status(200).json(response.data)
  })
  .catch((error) => {
    console.log(error);
  })
})

cron.schedule( "01 15 * * *", async (req, res) => {
  const now = moment().tz(timezone);
  if (now.hour() === 15 && now.minute() === 1) {
    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `https://fantasy.premierleague.com/api/bootstrap-static`,
      headers: {}
  };
  try {
      const bootstrapped = await axios.request(config)
      const response = await bootstrapped.data
      const { events } = response
      await Promise.all(events.map(async event => {
          const {id, name, deadline_time, finished, is_previous, is_current, is_next} = event
          await Event.findOneAndUpdate({id:id}, {id, name, deadline_time, finished, is_previous, is_current, is_next}, 
              {upsert: true, new: true}
          )
      }))
  } catch (error) {
      console.log(error)
  }
  }
}, {timezone})

cron.schedule("32 04 * * *", updatePlayers, {timezone})

async function updatePlayers () {
  const now = moment().tz(timezone);
  if (now.hour() === 4 && now.minute() === 32) {
    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `https://fantasy.premierleague.com/api/bootstrap-static`,
      headers: {}
  };
  try {
      const bootstrapped = await axios.request(config)
      const response = await bootstrapped.data
      const { elements } = response
      const newElements = elements.slice(0, 100)
      const newElements1 = elements.slice(100, 200)
      const newElements2 = elements.slice(200, 300)
      const newElements3 = elements.slice(300, 400)
      const newElements4 = elements.slice(500, 600)
      const newElements5 = elements.slice(600, 700)
      const newElements6 = elements.slice(400, 500)
      const newElements7 = elements.slice(700, 800)
      const runPlayers = async(Elements) => {
        await Promise.all(Elements.map(async element => {
          const { element_type, event_points, first_name, web_name, id, news, now_cost, second_name,
              team, team_code, total_points, minutes, goals_scored, assists, clean_sheets, goals_conceded,
              own_goals, penalties_saved, penalties_missed, yellow_cards, red_cards, saves, bonus,
              starts, expected_goals,
              expected_assists,
              cost_change_start,
              expected_goal_involvements,
              expected_goals_conceded, expected_goals_per_90,
              saves_per_90,
              chance_of_playing_next_round,
              expected_assists_per_90,
              expected_goal_involvements_per_90,
              expected_goals_conceded_per_90,
              goals_conceded_per_90
          } = element
          let config = {
              method: 'get',
              maxBodyLength: Infinity,
              url: `https://fantasy.premierleague.com/api/element-summary/${element.id}/`,
              headers: {}
          };
          const elementData = await axios.request(config)
          const resData = await elementData.data
          const a = await EplPlayer.findOneAndUpdate({id:id}, { element_type, event_points, first_name, web_name, id, news, now_cost, second_name,
              team, team_code, total_points, minutes, goals_scored, assists, clean_sheets, goals_conceded,
              own_goals, penalties_saved, penalties_missed, yellow_cards, red_cards, saves, bonus,
              starts, expected_goals,
              expected_assists,
              expected_goal_involvements,
              expected_goals_conceded, expected_goals_per_90,
              saves_per_90,
              cost_change_start,
              chance_of_playing_next_round,
              expected_assists_per_90,
              expected_goal_involvements_per_90,
              expected_goals_conceded_per_90,
              goals_conceded_per_90, ...resData }, {upsert: true, new: true})
      }))
      }

      runPlayers(newElements)
      runPlayers(newElements1)
      runPlayers(newElements2)
      runPlayers(newElements3)
      runPlayers(newElements4)
      runPlayers(newElements5)
      runPlayers(newElements6)
      runPlayers(newElements7)
      
    res.status(200).json('players loaded')
  } catch (error) {
      console.log(error)
  }
  }
}



app.listen(port, console.log(`Server running at port: ${port}`))
//module.exports = app;
export default app
