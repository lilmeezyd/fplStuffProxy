const axios = require('axios')
const express = require('express')
const port = process.env.PORT|| 5000
const cors = require('cors')

const app = express()

app.use(express.json())
app.use(cors({
    //origin: "http://localhost:3000"
    origin: '*'
}))

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

app.get('/element-summary/x', (req, res) => {
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
})

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
    console.log(error);
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
module.exports = app;
