import mongoose from "mongoose";

mongoose.set("strictQuery", true);

const connection = async () => {
    try {
        // Reuse existing connection when running in serverless environments
        if (mongoose.connection && mongoose.connection.readyState === 1) {
            console.log("Database already connected (reused connection)");
            return mongoose.connection;
        }

        // If a connection is in progress, wait for it
        if (mongoose.connection && mongoose.connection.readyState === 2) {
            console.log("Database connection in progress, waiting...");
            return new Promise((resolve, reject) => {
                const check = setInterval(() => {
                    if (mongoose.connection.readyState === 1) {
                        clearInterval(check);
                        resolve(mongoose.connection);
                    }
                }, 50);
            });
        }

        const conn = await mongoose.connect(process.env.MONGODB_URI_LOCAL);

        console.log("Database connected successfully!!");
        console.log(`Database: ${conn.connection.name}`);
        console.log(`Host: ${conn.connection.host}`);
        return conn.connection;
    } catch (error) {
        console.error("Error connecting to MongoDB Atlas:");
        console.error(error.message);
        throw error;
    }
};

export default connection;