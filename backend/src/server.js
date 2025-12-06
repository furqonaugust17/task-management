import dotenv from "dotenv";
import app from "./app.js";

dotenv.config();

// port
const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>{
    console.log(`SERVER RUNNING : ${PORT}`);
})