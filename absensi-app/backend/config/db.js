const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    console.log(`🟢 DB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`🔴 Database Error: ${error.message}`);
    process.exit(1); 
  }
};

module.exports = connectDB;