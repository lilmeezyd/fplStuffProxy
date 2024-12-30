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

cron.schedule( "19 01 * * *", async (req, res) => {
  const now = moment().tz(timezone);
  if (now.hour() === 1 && now.minute() === 19) {
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

cron.schedule("35 12 * * *", updatePlayers(0, 100, timezone, 12, 35), {timezone})
cron.schedule("36 12 * * *", updatePlayers(100, 200, timezone, 12, 36), {timezone})
cron.schedule("37 12 * * *", updatePlayers(200, 300, timezone, 12, 37), {timezone})
cron.schedule("38 12 * * *", updatePlayers(300, 400, timezone, 12, 38), {timezone})
cron.schedule("39 12 * * *", updatePlayers(400, 500, timezone, 12, 39), {timezone})
cron.schedule("40 12 * * *", updatePlayers(500, 600, timezone, 12, 40), {timezone})
cron.schedule("41 12 * * *", updatePlayers(600, 700, timezone, 12, 41), {timezone})
cron.schedule("42 12 * * *", updatePlayers(700, 800, timezone, 12, 42), {timezone})

async function updatePlayers (start, end, zone, hrs, mins) {
  const now = moment().tz(zone);
  if (now.hour() === hrs && now.minute() === mins) {
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
      await Promise.all(elements.slice(start, end).map(async element => {
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
    res.status(200).json('players loaded')
  } catch (error) {
      console.log(error)
  }
  }
}



app.listen(port, console.log(`Server running at port: ${port}`))
//module.exports = app;
export default app
