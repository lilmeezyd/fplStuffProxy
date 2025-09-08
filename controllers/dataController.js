import asyncHandler from "express-async-handler";
import axios from 'axios'
import EplPlayer from "../models/eplPlayerModel.js";
import Elem from "../models/elementType.js";
import Team from "../models/teamModel.js";
import Event from "../models/eventModel.js";
import Fixture from "../models/fixtureModel.js";
import User from "../models/userModel.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import crypto from "crypto";
import Token from "../models/tokenModel.js"

//@desc Register User
//@route POST /api/users
//@access Public
const registerUser = asyncHandler(async (req, res) => {
    const { firstName, lastName, email, password1, password2 } = req.body;
    if (!firstName || !lastName || !email || !password1 || !password2) {
        res.status(400).json({ msg: "Please add all fields!" });
        throw new Error("Please add all fields!");
    }

    // Check if passwords do match
    if (password1 !== password2) {
        res.status(400).json({ msg: "Passwords do not match!" });
        throw new Error("Passwords do not match!");
    }

    // Check if password is required length
    if (password1.length < 6) {
        res.status(400).json({ msg: "Passwords should have at least 6 characters!" });
        throw new Error("Passwords should have at least 6 characters!");
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400).json({ msg: "User already exists!" })
        throw new Error("User already exists");
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password1, salt);

    // Create User
    const user = await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword
    });

    if (user) {
        res.status(201).json({
            _id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            token: generateToken(user._id),
            msg: 'successfully registered'
        });
    } else {
        res.status(400).json("Invalid user data!");
        throw new Error("Invalid user data");
    }
});

//@desc Authenticate User
//@route POST /api/users/login
//@access Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user && !password) {
        res.status(400).json({ msg: "Enter all fields!" })
        throw new Error("Enter all fields!")
    }

    if (!user) {
        res.status(400).json({ msg: "User not registered!" })
        throw new Error("User not registered!")
    }

    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
            _id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            msg: 'successfully logged in',
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({ msg: "Invalid credentials!" });
        throw new Error("Invalid credentials");
    }
});

//@desc Password reset request
//@route
//@access Public
const requestPasswordReset = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        res.status(400).json({ msg: "User does not exist!" })
        throw new Error("User does not exist");
    }

    let token = await Token.findOne({ userId: user._id });
    if (token) {
        await Token.deleteOne();
    }

    let resetToken = crypto.randomBytes(32).toString("hex");
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(resetToken, salt);

    await Token.create({
        userId: user._id,
        token: hash,
        createdAt: Date.now(),
    });

    const link = `https://foodrecall.vercel.app/password-reset?token=${resetToken}&id=${user._id}`;
    const welcomeSubject = `Password reset!`;
    const welcomeContent = `<div>
        <h1>Hi, ${firstName}</h1>
        <p>You requested for a password reset!</p>
        <div>Follow the link <a href=${link}>here</a></div>
        </div>`;
    sendNewsletter(email, welcomeSubject, welcomeContent)
    res.status(200).json('Password reset instructions sent to your email.');
})

//@desc Password restting
//@access Public
const resetPassword = asyncHandler(async (req, res) => {
    const { userId, token, password } = req.body;
    let passwordResetToken = await Token.findOne({ userId });
    if (!passwordResetToken) {
        res.status(400).json({ msg: "Invalid or expired password reset token!" })
        throw new Error("Invalid or expired password reset token");
    }

    const isValid = await bcrypt.compare(token, passwordResetToken.token);
    if (!isValid) {
        res.status(400).json({ msg: "Invalid or expired password reset token!" })
        throw new Error("Invalid or expired password reset token");
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    await User.updateOne(
        { _id: userId },
        { $set: { password: hashedPassword } },
        { new: true }
    );
    const user = await User.findById({ _id: userId });
    sendEmail(
        user.email,
        "Password Reset Successfully",
        {
            name: user.name,
        },
        "./template/resetPassword.handlebars"
    );

    await passwordResetToken.deleteOne();
    return true;
});


//@desc Change Password
//@route PUT /api/users/newPassword
//@access Private
const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword, confirmPassword } = req.body
    const user = await User.findById(req.user._id)
    const { password } = user
    if (!oldPassword || !newPassword || !confirmPassword) {
        res.status(400).json({ msg: 'Please enter all fields!' })
        throw new Error('Please enter all fields')
    }

    // Check if new passwords match
    if (newPassword !== confirmPassword) {
        res.status(400).json({ msg: "Passwords do not match!" });
        throw new Error("Passwords do not match!");
    }

    // check if old and new passwords match
    if (user && (await bcrypt.compare(newPassword, password))) {
        res.status(400).json({ msg: "New password can't match old password!" });
        throw new Error("New password can't match old password!")
    }

    // Check if newPassword is required length
    if (newPassword.length < 6) {
        res.status(400).json({ msg: "Passwords should have at least 6 characters!" });
        throw new Error("Passwords should have at least 6 characters!");
    }

    if (user && (await bcrypt.compare(oldPassword, password))) {
        //hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(newPassword, salt)
        await User.updateOne(
            { _id: req.user._id },
            { $set: { password: hashedPassword } },
            { new: true }
        );
        res.status(200).json({ msg: 'Password updated!' })
    }
})
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
            const { event, finished, kickoff_time, id, started, team_a, team_h,
                team_h_difficulty,
                team_a_difficulty } = fixture
            await Fixture.findOneAndUpdate({ id: id }, {
                event, finished, kickoff_time, id, started, team_a, team_h,
                team_h_difficulty,
                team_a_difficulty
            },
                { upsert: true, new: true }
            )
        }))

        res.status(201).json('Fixtures loaded')
    } catch (error) {
        console.log(error)
        res.json('An Error occured')
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
            const { id, name, deadline_time, finished, is_previous, is_current, is_next } = event
            await Event.findOneAndUpdate({ id: id }, { id, name, deadline_time, finished, is_previous, is_current, is_next },
                { upsert: true, new: true }
            )
        }))
        res.status(201).json('Events updated')
    } catch (error) {
        console.log(error)
        res.json('An error occcured')
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
        const { elements, element_types } = response
        
       const operations = element_types.map(elem => {
          const { id, plural_name, singular_name, singular_name_short } = elem;

          return {
            updateOne: {
              filter: { id },
              update: {
                $set: { id, plural_name, singular_name, singular_name_short },
              },
              upsert: true,
            },
          };
        });

       /* await Elem.bulkWrite(operations);
res.json('done')*/
     /*   await Promise.all(teams.map(async team => {
            const {code, id, name, short_name, strength} = team
            await Team.findOneAndUpdate({id:id}, {code, id, name, short_name, strength}, 
                {upsert: true, new: true}
            )
        }))*/

      try{

const chunkArray = (arr, size) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );

const chunks = chunkArray(elements, 100);

for (const batch of chunks) {
  await Promise.all(batch.map(async element => {
    try {
      const {
        element_type, event_points, first_name, web_name, id, news, now_cost, second_name,
        team, team_code, total_points, minutes, goals_scored, assists, clean_sheets, goals_conceded,
        own_goals, penalties_saved, penalties_missed, yellow_cards, red_cards, saves, bonus,
        starts, expected_goals, expected_assists, cost_change_start, expected_goal_involvements,
        expected_goals_conceded, expected_goals_per_90, saves_per_90, chance_of_playing_next_round,
        expected_assists_per_90, expected_goal_involvements_per_90, expected_goals_conceded_per_90,
        goals_conceded_per_90,
          clearances_blocks_interceptions,
          recoveries,tackles,defensive_contribution
      } = element;

      const { data: resData } = await axios.get(`https://fantasy.premierleague.com/api/element-summary/${id}/`);

      await EplPlayer.findOneAndUpdate(
        { id },
        {
          element_type, event_points, first_name, web_name, id, news, now_cost, second_name,
          team, team_code, total_points, minutes, goals_scored, assists, clean_sheets, goals_conceded,
          own_goals, penalties_saved, penalties_missed, yellow_cards, red_cards, saves, bonus,
          starts, expected_goals, expected_assists, cost_change_start, expected_goal_involvements,
          expected_goals_conceded, expected_goals_per_90, saves_per_90, chance_of_playing_next_round,
            clearances_blocks_interceptions,recoveries,tackles,defensive_contributionexpected_assists_per_90, expected_goal_involvements_per_90, expected_goals_conceded_per_90,
          goals_conceded_per_90,
          ...resData,
        },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error(`Failed to update player ${element.id}:`, err.message);
    }
  }));

  console.log(`Finished batch of 100`);
}

res.json({ message: 'All players updated in 100-batch chunks' });

        } catch (error) {
            console.log(error)
            res.status('An error occured')
        }

    } catch (error) {
        console.log(error)
    }
})

const getPlayers = asyncHandler(async (req, res) => {
    const players = await EplPlayer.find({})
    res.status(200).json(players)
})
const getTeams = asyncHandler(async (req, res) => {
    const teams = await Team.find({})
    res.status(200).json(teams)
})
const getEvents = asyncHandler(async (req, res) => {
    const events = await Event.find({})
    res.status(200).json(events.sort((x, y) => x.id < y.id ? -1 : 1))
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
                const a = await EplPlayer.findOneAndUpdate({ id: id }, {
                    element_type, event_points, first_name, web_name, id, news, now_cost, second_name,
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
                    goals_conceded_per_90, ...resData
                }, { upsert: true, new: true })
            }))
            res.status(201).json('players loaded')
        } catch (error) {
            console.log(error)
            res.status('An error occured')
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
                const a = await EplPlayer.findOneAndUpdate({ id: id }, {
                    element_type, event_points, first_name, web_name, id, news, now_cost, second_name,
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
                    goals_conceded_per_90, ...resData
                }, { upsert: true, new: true })
            }))
            res.status(201).json('players loaded')
        } catch (error) {
            console.log(error)
            res.status('An error occured')
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
                const a = await EplPlayer.findOneAndUpdate({ id: id }, {
                    element_type, event_points, first_name, web_name, id, news, now_cost, second_name,
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
                    goals_conceded_per_90, ...resData
                }, { upsert: true, new: true })
            }))
            res.status(201).json('players loaded')
        } catch (error) {
            console.log(error)
            res.status('An error occured')
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
                const a = await EplPlayer.findOneAndUpdate({ id: id }, {
                    element_type, event_points, first_name, web_name, id, news, now_cost, second_name,
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
                    goals_conceded_per_90, ...resData
                }, { upsert: true, new: true })
            }))
            res.status(201).json('players loaded')
        } catch (error) {
            console.log(error)
            res.status('An error occured')
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
                const a = await EplPlayer.findOneAndUpdate({ id: id }, {
                    element_type, event_points, first_name, web_name, id, news, now_cost, second_name,
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
                    goals_conceded_per_90, ...resData
                }, { upsert: true, new: true })
            }))
            res.status(201).json('players loaded')
        } catch (error) {
            console.log(error)
            res.status('An error occured')
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
            await Promise.all(elements.slice(600, 700).map(async element => {
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
                const a = await EplPlayer.findOneAndUpdate({ id: id }, {
                    element_type, event_points, first_name, web_name, id, news, now_cost, second_name,
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
                    goals_conceded_per_90, ...resData
                }, { upsert: true, new: true })
            }))
            res.status(201).json('players loaded')
        } catch (error) {
            console.log(error)
            res.status('An error occured')
        }

    } catch (error) {
        console.log(error)
    }
})

const addPlayersList8 = asyncHandler(async (req, res) => {
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
            await Promise.all(elements.slice(700, 800).map(async element => {
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
                const a = await EplPlayer.findOneAndUpdate({ id: id }, {
                    element_type, event_points, first_name, web_name, id, news, now_cost, second_name,
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
                    goals_conceded_per_90, ...resData
                }, { upsert: true, new: true })
            }))
            res.status(201).json('players loaded')
        } catch (error) {
            console.log(error)
            res.status('An error occured')
        }

    } catch (error) {
        console.log(error)
    }
})

// Generate JWT
const generateToken = (id, roles) => {
    return jwt.sign({ id, roles }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

export {
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
    updateEvents,
    addPlayersList2, addPlayersList3, addPlayersList4, addPlayersList5, addPlayersList6, addPlayersList7,
    addPlayersList8
}