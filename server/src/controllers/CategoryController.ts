import { Request, Response } from "express";
import { createQueryBuilder, getConnection, getRepository, Like } from "typeorm";
import { validate } from "class-validator";
import { Post } from "../entity/Post";
import { Category } from "../entity/Category";
const crypto = require("crypto");

class CategoryController{

static listAllCatWithPosts = async (req: Request, res: Response) => {
    const categoriesRepository = getRepository(Category);
    const categories = await categoriesRepository.find({
        relations: ['posts']
    });
    res.send(categories);
    
};

static listAllCat = async (req: Request, res: Response) => {
    const categoriesRepository = getRepository(Category);
    const categories = await categoriesRepository.find();
    res.send(categories);
    
};

static listAllByCategoryName = async (req: Request, res: Response) => {
    // const categoriesRepository = getRepository(Category);
    // const categories = await categoriesRepository.find({ WHERE ("name=name")});
    // res.send(categories);
    const tags  = req.params.name;
    const categoriesRepository = getRepository(Category);
    const categories = await categoriesRepository.find({ 
        where: { name: Like (tags)},
        relations: ['posts'],
        take: 5
    });
    res.send(categories);
};

static createCat = async (req: Request, res: Response) => {
    const categoriesRepository = getRepository(Category);
    let { tag } = req.body;
    let category = new Category();

    category.name = tag;

    //Validate if category already exists
    const errors = await validate(category);
    if (errors.length > 0) {
        res.status(400).send(errors);
        return;
    }
    //Try to save. If fails, the category already exists
    try {
        await categoriesRepository.save(category);
    } catch (e) {
        res.status(409).send("Category already in database");
        return;
    }
    //If all ok, send 201 response
    res.status(201).send("Category created");
};

};

export default CategoryController;