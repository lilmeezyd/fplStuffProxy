import mongoose from "mongoose";
const elemSchema = mongoose.Schema({
    id:{
        type: Number,
        required: true
    }, plural_name:{
        type: String
    }, singular_name: {
        type: String
    }, singular_name_short:{
        type: String
    }
}, {
    timestamps: true,
})
const Elem = mongoose.model('Elem', elemSchema)
export default Elem