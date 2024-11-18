import mongoose from "mongoose";
const teamSchema = mongoose.Schema({
    code: { type: Number, required: true }, id: { type: Number, required: true }, name: { type: String, required: true },
    short_name: { type: String, required: true }, strength: { type: Number, required: true }
}, { timestamps: true })
const Team = mongoose.model('Team', teamSchema)
export default Team