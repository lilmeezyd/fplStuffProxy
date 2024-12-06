import mongoose from "mongoose";
const uri = "mongodb+srv://denismoini09:4xg6pbL4IBCiCPeZ@ugFantasy.7pl0whs.mongodb.net/eplfantasy?retryWrites=true&w=majority&appName=ugFantasy"
const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };
const connectDB = async()=> {
    try {
        const conn = await mongoose.connect(uri, clientOptions)
        console.log(`MongoDB connect ${conn.connection.host}`)
    } catch (error) {
        console.log(error.message)
        process.exit(1)
    }
}

export default connectDB