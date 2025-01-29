import mongoose from "mongoose";
const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };
const connectDB = async()=> {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, clientOptions)
        console.log(`MongoDB connect ${conn.connection.host}`)
    } catch (error) {
        console.log(error.message)
        process.exit(1)
    }
}

export default connectDB 