import asyncHandler from "express-async-handler";
import axios from 'axios'
import EplPlayer from "../models/eplPlayerModel.js";
import Elem from "../models/elementType.js";
import Team from "../models/teamModel.js";
import Event from "../models/eventModel.js";
import Fixture from "../models/fixtureModel.js";
 
const loadFixtures = asyncHandler(async (req, res) => {
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://fantasy.premierleague.com/api/fixtures`,
        headers: {}
      };
      try {
        const response = await axios.request(config)
        const fixtures = await response.data
        await Promise.all(fixtures.map(async fixture => {
            const {event, finished, kickoff_time, id, started, team_a,team_h,
            team_h_difficulty,
          team_a_difficulty} = fixture
            await Fixture.findOneAndUpdate({id:id}, {event, finished, kickoff_time, id, started, team_a,team_h,
                team_h_difficulty,
              team_a_difficulty}, 
                {upsert: true, new: true}
            )
        }))
      } catch (error) {
        console.log(error)
      }
})

const updateEvents = asyncHandler(async (req, res) => {
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
        res.status(201).json('Events updated')
    } catch (error) {
        console.log(error)
    }
})

const loadData = asyncHandler(async (req, res) => {
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://fantasy.premierleague.com/api/bootstrap-static`,
        headers: {}
    };
    try {
        const bootstrapped = await axios.request(config)
        const response = await bootstrapped.data
        const { events, elements, teams, element_types } = response
        await Promise.all(events.map(async event => {
            const {id, name, deadline_time, finished, is_previous, is_current, is_next} = event
            await Event.findOneAndUpdate({id:id}, {id, name, deadline_time, finished, is_previous, is_current, is_next}, 
                {upsert: true, new: true}
            )
        }))
        await Promise.all(element_types.map(async elem => {
            const {id, plural_name, singular_name, singular_name_short} = elem
            await Elem.findOneAndUpdate({id:id}, {id, plural_name, singular_name, singular_name_short}, 
                {upsert: true, new: true}
            )
        }))
        await Promise.all(teams.map(async team => {
            const {code, id, name, short_name, strength} = team
            await Team.findOneAndUpdate({id:id}, {code, id, name, short_name, strength}, 
                {upsert: true, new: true}
            )
        }))

        try {
            await Promise.all(elements.slice(0, 100).map(async element => {
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

    } catch (error) {
        console.log(error)
    }
})

const getPlayers = asyncHandler(async (req, res) => {
    const players = await EplPlayer.find({})
    console.log(players)
    res.status(200).json(players)
})
const getTeams = asyncHandler(async (req, res) => {
    const teams = await Team.find({})
    res.status(200).json(teams)
})
const getEvents = asyncHandler(async (req, res) => {
    const events = await Event.find({})
    res.status(200).json(events.sort((x,y) => x.id < y.id ? -1 : 1))
})
const getElems = asyncHandler(async (req, res) => {
    const elems = await Elem.find({})
    console.log(elems)
    res.status(200).json(elems)
})
const getFixtures = asyncHandler(async (req, res) => {
    const fixtures = await Fixture.find({})
    res.status(200).json(fixtures)
})


const addPlayersList2 = asyncHandler(async (req, res) => {
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

        try {
             await Promise.all(elements.slice(100, 200).map(async element => {
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

    } catch (error) {
        console.log(error)
    }
})
const addPlayersList3 = asyncHandler(async (req, res) => {
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

        try {
            await Promise.all(elements.slice(200, 300).map(async element => {
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

    } catch (error) {
        console.log(error)
    }
})
const addPlayersList4 = asyncHandler(async (req, res) => {
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

        try {
            await Promise.all(elements.slice(300, 400).map(async element => {
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

    } catch (error) {
        console.log(error)
    }
})
const addPlayersList5 = asyncHandler(async (req, res) => {
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

        try {
            await Promise.all(elements.slice(400, 500).map(async element => {
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

    } catch (error) {
        console.log(error)
    }
})

const addPlayersList6 = asyncHandler(async (req, res) => {
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

        try {
            await Promise.all(elements.slice(500, 600).map(async element => {
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

    } catch (error) {
        console.log(error)
    }
})

const addPlayersList7 = asyncHandler(async (req, res) => {
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

        try {
            await Promise.all(elements.slice(600, 730).map(async element => {
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

    } catch (error) {
        console.log(error)
    }
})

export { loadData,
    loadFixtures,
    getElems,
    getEvents,
    getFixtures,
    getPlayers,
    getTeams,
    updateEvents,
     addPlayersList2, addPlayersList3, addPlayersList4, addPlayersList5, addPlayersList6, addPlayersList7  }