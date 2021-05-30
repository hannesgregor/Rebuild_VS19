import { Router } from "express";
import AuthController from "../controllers/AuthController";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();
//Login route
router.post("/login", AuthController.login);

//Logout route
router.get("/logout", [checkJwt], AuthController.logout);

//auth route
router.get("/me", [checkJwt], AuthController.getMe);

//Change my password
router.post("/change-password", [checkJwt], AuthController.changePassword);


export default router;