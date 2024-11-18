import mongoose from "mongoose";

const eplPlayerSchema = mongoose.Schema({
    element_type: {
        type: Number
    }, event_points: {
        type: Number
    }, first_name: {
        type: String
    }, id: {
        type: Number
    }, news: {
        type: String
    }, now_cost: {
        type: Number
    }, second_name: {
        type: String
    },
    team: {
        type: Number
    }, team_code: {
        type: Number
    }, total_points: {
        type: Number
    }, minutes: {
        type: Number
    }, goals_scored: {
        type: Number
    }, assists: {
        type: Number
    }, clean_sheets: {
        type: Number
    }, goals_conceded: {
        type: Number
    },
    own_goals: {
        type: Number
    }, penalties_saved: {
        type: Number
    }, penalties_missed: {
        type: Number
    }, yellow_cards: {
        type: Number
    }, red_cards: {
        type: Number
    }, saves: {
        type: Number
    }, bonus: {
        type: Number
    },
    starts: {
        type: Number
    }, expected_goals: {
        type: String
    },
    expected_assists: {
        type: String
    },
    expected_goal_involvements: {
        type: String
    },
    expected_goals_conceded: {
        type: String
    }, expected_goals_per_90: {
        type: Number
    },
    saves_per_90: {
        type: Number
    },
    expected_assists_per_90: {
        type: Number
    },
    expected_goal_involvements_per_90: {
        type: Number
    },
    expected_goals_conceded_per_90: {
        type: Number
    },
    goals_conceded_per_90: {
        type: Number
    },
    fixtures: {
        type: Array,
        required: true
    },
    history: {
        type: Array,
        required: true
    }
}, {
    timestamps: true,
})

const EplPlayer = mongoose.model('Player', eplPlayerSchema)
export default EplPlayer