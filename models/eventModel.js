import mongoose from "mongoose";
const eventSchema = mongoose.Schema({
    id: {type: Number, required: true},
  name: {type:String, required: true},
  deadline_time: {type: String},
  finished: {type: Boolean},
  is_previous: {type: Boolean},
  is_current: {type: Boolean},
  is_next: {type: Boolean},
})
const Event = mongoose.model('Event', eventSchema)
export default Event