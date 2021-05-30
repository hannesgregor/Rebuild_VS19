import { Router } from "express";
import PostController from "../controllers/PostController";
import ReviewController from "../controllers/ReviewController";
import { checkJwt } from "../middlewares/checkJwt";
import { checkRole } from "../middlewares/checkRole";


const router = Router();

// Get all posts
router.get("/", [checkJwt], PostController.listAll);

// Create a new post
router.post("/new-post", [checkJwt], PostController.newPost);

// Get by 1 category
router.get("/:name?", [checkJwt], PostController.listPostByCategoryName);

// Get one post by ID
//router.get("/:id([0-9]+)", [checkJwt], PostController.getOneById);

// Get posts by user ID
router.get("/user/:id([0-9]+)", PostController.listPostByUserId);
    
// Edit one post by post ID
router.patch("/edit/:id([0-9]+)",[checkJwt], PostController.editPost);

// Delete one post by post ID
router.delete("/:id([0-9]+)",[checkJwt], PostController.deleteAd);

// Get all reviews for 1 post ID
router.get("/:id([0-9]+)/reviews", [checkJwt], ReviewController.listAllReviews);

//Create a new review
router.post("/:id([0-9]+)/add-review", [checkJwt], ReviewController.createReview);


export default router;