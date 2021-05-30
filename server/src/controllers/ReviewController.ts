import { Request, Response } from "express";
import { createQueryBuilder, getConnection, getRepository, createConnection, Connection, Like, Any, getManager} from "typeorm";
import { IsNumber, isNumber, validate } from "class-validator";
import { Post } from "../entity/Post";
import { User } from "../entity/User";
import { Review } from "../entity/Review";
import * as dotenv from 'dotenv';
import { isInteger } from "cypress/types/lodash";
dotenv.config();





class ReviewController{
    static listAllReviews = async (req: Request, res: Response) => {  
        const id = req.params.id;
        console.log(id);
        const repo = getRepository(Review);
        //Get from database
        const reviews = await repo.createQueryBuilder('reviews')
        .leftJoinAndSelect("reviews.user", "user")
        .leftJoinAndSelect("reviews.post", "post")
        .select(["reviews", "user.id", "user.firstName", "user.lastName"])
        .where("post.id = :id", { id })
        .paginate(10)
        res.send(reviews);

    };

    static listOnePostReviews = async (req: Request, res: Response) => {

        // Get the post with reviews with post ID
        const postId = req.params.id;
        const repo = getRepository(Review);

        // Get from database
        const reviews = await repo.createQueryBuilder('reviews')
        .leftJoinAndSelect("reviews.user", "user")
        .select(["reviews", "user.id", "user.firstName", "user.lastName"])
        .paginate(10)
        res.send(reviews);

    };

    static listReviewById = async (req: Request, res: Response) => {
        //Get user from database
        const id = req.params.review_id
        const review = await getRepository(Review)
            .createQueryBuilder("reviews")
            .leftJoinAndSelect("reviews.user", "user")
            .select(["reviews", "user.id", "user.firstName", "user.lastName"])
            .where("reviews.id = :id", { id })
            .getOne();

            res.send(review);
    };

    static createReview = async (req: Request, res: Response) => {

        // Get post and review params
        const postId = req.params.id;
        const { rating, review_text } = req.body;

        // Check which user id is logged in and creating a review
        const userId = res.locals.jwtPayload.userId;

        // Convert to numbers
        const postitus = parseInt(postId);
        const ratingNumber = parseInt(rating);
        if (ratingNumber < 0 || ratingNumber > 5 ) {
            res.status(400).send("Rating must be between 1 and 5");
            return;
        }
        
        // Get review repo and create new review
        const reviewRepository = getRepository(Review);
        const review = new Review();
        review.user = userId;
        review.rating = ratingNumber;
        review.review_text = review_text;
        review.post = postitus;

        const errors = await validate(review);
        if (errors.length > 0) {
        res.status(400).send("Bad request");
        return;
        }
        console.log(review);
      
        try {
            await reviewRepository.save(review);
        } catch (error) {
            res.status(409).send("Post does not exist");
            return;
        }
        //After all send a 200 request OK response
        res.status(200).send(review);
        
    };
      
    static getPostRatings = async (req: Request, res: Response) => {
        const { postId } = req.params;

        return await getManager().find(Review, { where: { postId } });
    };

    static removeReview = async (req: Request, res: Response) => {


    };
      
}

export default ReviewController;

