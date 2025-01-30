import mongoose from "mongoose";
const fixtureSchema = mongoose.Schema({
    event: {type: Number},
    finished: { type: Boolean},
    kickoff_time: {type: String},
    id: {type: Number},
    started: {type: Boolean},
    team_a: {type: Number},
    team_h: {type: Number},
    team_h_difficulty: {type: Number},
  team_a_difficulty: {type: Number}
},
{
  timestamps: true,
})

const Fixture = mongoose.model('Fixture', fixtureSchema)
export default Fixture