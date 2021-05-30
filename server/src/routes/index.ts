import { Router, Request, Response } from "express";
import auth from "./auth";
import user from "./user";
import post from "./post";
import review from "./review";
import category from "./category";
import UserController from "../controllers/UserController";
import PostController from "../controllers/PostController";
import ReviewController from "../controllers/ReviewController";

const routes = Router();

routes.use("/auth", auth);
routes.use("/user", user);
routes.use("/register", UserController.newUser);
routes.use("/posts", post);
routes.use("/forgot-password", UserController.forgotPassword);
routes.use("/categories", category);
routes.use("/post/:id([0-9]+)", PostController.getOneById);
//routes.use("/posts/:id([0-9]+)/reviews/", ReviewController.listAllReviews);
//routes.use("/reviews", review);

//confirm token for email verification
routes.get("/confirmation/:token", UserController.confirmation);

export default routes;