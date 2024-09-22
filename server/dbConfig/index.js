// dbConnection.js
import mongoose from "mongoose";

const dbConnection = async () => {
  try {
    // Connect to the MongoDB database
    const connection = await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Log success message if connected
    console.log(`MongoDB Connected: ${connection.connection.host}`);
  } catch (error) {
    // Log error if connection fails
    console.error(`DB Connection Error: ${error.message}`);

    // Exit process with failure
    process.exit(1);
  }
};

export default dbConnection;
