import { Router } from "express";
import UserController from "../controllers/UserController";
import { checkJwt } from "../middlewares/checkJwt";
import { checkRole } from "../middlewares/checkRole";


const router = Router();

//Create a new user
router.post("/register", UserController.newUser);

//Get all users
router.get("/", [checkJwt], UserController.listAll);

// Get one user
//router.get("/:id([0-9]+)",[checkJwt],UserController.getOneById);

// Get one user with posts
router.get("/:id([0-9]+)",[checkJwt], UserController.listUserWithPosts);

//Edit one user
router.patch("/:id([0-9]+)",[checkJwt], UserController.editUser);

//Delete one user
router.delete("/:id([0-9]+)",[checkJwt, checkRole(["ADMIN"])],UserController.deleteUser);

export default router;