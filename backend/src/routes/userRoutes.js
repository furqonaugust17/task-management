import express from "express";
import { 
    register,
    getAlluser, 
    getUserById, 
    getUserByEmails, 
    updateUSers, 
    hardDeleteController, 
    softDeleteController,
    loginController
} from "../controller/User.Conttroller.js";

const RouteUser = express.Router();

// register rute
RouteUser.post("/register", register);

// login rute
RouteUser.post("/login", loginController);

// ambil semua data user
RouteUser.get("/", getAlluser);

// ambil user bedasarkan email
// http://localhost:5000/api/users/email?email=aldioyaspindo1@gmail.com
RouteUser.get("/email", getUserByEmails);

// ambil user bedasarkan id
RouteUser.get("/:id", getUserById);

// update data user
RouteUser.put("/:id", updateUSers);

// hard delete
RouteUser.delete("/hard/:id", hardDeleteController);

// soft delte
RouteUser.delete("/soft/:id", softDeleteController);

export default RouteUser;