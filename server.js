import axios from 'axios'
import express, { urlencoded } from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dataRoutes from './routes/dataRoutes.js'
import connectDB from './config/db.js'
const port = process.env.PORT|| 5000

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



app.listen(port, console.log(`Server running at port: ${port}`))
//module.exports = app;
export default app
