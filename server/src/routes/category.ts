import { Router } from "express";
import CategoryController from "../controllers/CategoryController";
import { checkJwt } from "../middlewares/checkJwt";
import { checkRole } from "../middlewares/checkRole";


const router = Router();

//Get all categories
router.get("/", [checkJwt], CategoryController.listAllCat);

//Get all categories with posts
router.get("/all", [checkJwt], CategoryController.listAllCatWithPosts);

//Create a new category
router.post("/new-category", [checkJwt], CategoryController.createCat);

router.get("/:name", [checkJwt], CategoryController.listAllByCategoryName);









export default router;