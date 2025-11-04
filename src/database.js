import mongoose from "mongoose";

mongoose.set('strictQuery',true)

const connection=async()=>{
    try {
        const{connection}=await mongoose.connect(process.env.MONGODB_URI_LOCAL)
        console.log(`DATABASE IS CONNECTED`)

       
    } catch (error) {
        console.log(error);
    }
}

export default connection