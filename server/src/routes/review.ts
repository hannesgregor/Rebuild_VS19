import { Router } from "express";
import ReviewController from "../controllers/ReviewController";
import { checkJwt } from "../middlewares/checkJwt";
import { checkRole } from "../middlewares/checkRole";


const router = Router();

//Get all reviews
//router.get("/", [checkJwt], ReviewController.listAllReviews);

//Create a new review
//router.post("/add-review", [checkJwt], ReviewController.createReview);

//Get reviews 
router.get("/:review_id([0-9]+)", [checkJwt], ReviewController.listReviewById);

// Edit one review by review ID
//router.patch("/edit/:id([0-9]+)",[checkJwt], ReviewController.editReview);

// //Delete one review by ID
//router.delete("/:review_id([0-9]+)",[checkJwt, ,ReviewController.deleteReview);











export default router;