import { Request, Response } from "express";
import { createQueryBuilder, getConnection, getRepository, createConnection, Connection, Like, Any} from "typeorm";
import { validate } from "class-validator";
import { Post } from "../entity/Post";
import { User } from "../entity/User";
import CategoryController from "../controllers/CategoryController"
import { Category } from "../entity/Category";
import { Review } from "../entity/Review";
import { post } from "cypress/types/jquery";



class PostController{

static listAll = async (req: Request, res: Response) => {
    const repo = getRepository(Post);
    //Get from database
    const posts = await repo.createQueryBuilder('post')
    .leftJoinAndSelect("post.reviews", "reviews")
    .leftJoinAndSelect("post.categories", "categories")
    .leftJoinAndSelect("post.user", "user")
    .select(["post.id", "post.title", "user.id", "user.firstName", "user.lastName", "user.description", "post.content", "post.createdAt", "post.updatedAt", "categories", "reviews"])
    .paginate(5)
    
    res.send(posts);
};

static newPost = async (req: Request, res: Response) => {
    const postsRepository = getRepository(Post);
    let { title, content, categories } = req.body;

    const post = new Post();
    post.title = title;
    post.content = content;
    post.user = res.locals.jwtPayload.userId;
    post.categories = categories;

    await postsRepository.save(post);
    //If all ok, send 201 response
    res.status(201).send({ id: post.id })
    
    
};

static listPostByCategoryName = async (req: Request, res: Response) => {
    const tags = req.params.name.split(",");
    const repo = getRepository(Post);
    //Get from database
    const postsWithCategories = await repo.createQueryBuilder('post')
    .leftJoinAndSelect("post.categories", "categories")
    .leftJoinAndSelect("post.user", "user")
    .select(["post.id", "post.title", "user.id", "user.firstName", "user.lastName","user.description", "post.content", "post.createdAt", "post.updatedAt", "categories"])
    .where("categories.name IN (:...names)", { names:tags })
    .paginate(5)
    res.send(postsWithCategories);
};

static getOneById = async (req: Request, res: Response) => {
    // Get the post ID from the url
    const id = req.params.id;

    // Get the post from database
    const post = await getRepository(Post)
        .createQueryBuilder("post")
        .leftJoinAndSelect("post.categories", "categories")
        .leftJoinAndSelect("post.user", "user")
        .select(["post.id", "post.title", "user.id", "user.firstName", "user.lastName", "user.description", "post.content", "post.createdAt", "post.updatedAt", "categories"])
        .where("post.id = :id", { id })
        .getOne();
    
    // Get the reviews for this post
    const repo = getRepository(Review);
        // Get from database
        const reviews = await repo.createQueryBuilder('reviews')
        .leftJoinAndSelect("reviews.user", "user")
        .leftJoinAndSelect("reviews.post", "post")
        .select(["reviews", "user.id", "user.firstName", "user.lastName"])
        .where("post.id = :id", { id })
        .paginate(10)

        // Send post and review data together
        res.send({ data: post, reviews: reviews });
    
};

static listPostByUserId = async (req: Request, res: Response) => {
    //Get the user ID from the url
    const id = req.params.id;

    const repo = getRepository(Post);
    //Get from database
    const postsWithCategories = await repo.createQueryBuilder('post')
    .leftJoinAndSelect("post.categories", "categories")
    .leftJoinAndSelect("post.user", "user")
    .select(["post.id", "post.title", "user.id", "user.firstName", "user.lastName", "user.description", "post.content", "post.createdAt", "post.updatedAt", "categories"])
    .where("user_id = :id", { id })
    .paginate(5)
    res.send(postsWithCategories);
};

static editPost = async (req: Request, res: Response) => {
    //Get the user ID 
    const userId = res.locals.jwtPayload.userId;
    
    //Get the post ID
    const postId = req.params.id;

    //Get values from the body
    const { title, content, categories} = req.body;

    //Try to find post on database
    const postRepository = getRepository(Post);
    let post;

    try {
        post = await postRepository.findOneOrFail(postId)
        } catch (error) {
        //If not found, send a 404 response
        res.status(404).send("Post not found");
        return;
        }
    
    //Validate the new values on model
    post.title = title;
    post.content = content;
    post.categories = categories;

    const errors = await validate(post);
    if (errors.length > 0) {
    res.status(400).send("Something went wrong");
    return;
    }
    console.log(userId, post.user)
    
    //Try to save
    try {
    await postRepository.save(post);
    } catch (e) {
    res.status(409).send("Something went wrong");
    return;
    }

    //After all send a 200 request OK response
    res.status(200).send(post);
    console.log(post);
};

static deleteAd = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id = req.params.id;

    //Check which user id is logged in
    const userId = res.locals.jwtPayload.userId;
  
    const postRepository = getRepository(Post);
    let post: Post;
    
    try {
      post = await postRepository.findOneOrFail(id);
    } catch (error) {
      res.status(404).send("Post not found");
      return;
    }

    if (post.user!=userId) return res.status(401).send({data: "You are not authorized"})
    postRepository.delete(id);
  
    //After all send a 204 (no content, but accepted) response
    res.status(204).send();

};
}

export default PostController;