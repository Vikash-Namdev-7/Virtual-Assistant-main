import mongoose from "mongoose";

const connectDb = async () => {
  try {
    const url = process.env.MONGODB_URL;
    if (!url) {
      throw new Error("MONGODB_URL is not defined in .env file");
    }
    await mongoose.connect(url);
    console.log("✅ Database Connected Successfully");
  } catch (error) {
    console.error("❌ Database connection failed!");
    console.error("Error Message:", error.message);
    
    if (error.message.includes("querySrv ECONNREFUSED")) {
      console.log("\n--- DNS RESOLUTION ERROR DETECTED ---");
      console.log("Aapka Internet/DNS provider MongoDB Atlas ko connect nahi hone de raha hai.");
      console.log("FIX: Apne PC ki DNS Settings change karke 8.8.8.8 aur 8.8.4.4 (Google DNS) set karein.");
      console.log("OR: MongoDB Atlas se 'Legacy Connection String' (mongodb:// instead of mongodb+srv://) ka use karein.");
    } else {
      console.log("Check if your IP is whitelisted in MongoDB Atlas or if your internet connection is stable.");
    }
    
    process.exit(1);
  }
};

export default connectDb;
