import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { User } from "../entity/User";

export const checkJwt = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token //authHeader && authHeader.split(' ')[1]
  if (token == null) return res.status(401).send({data: "You are not authorized"}) // if there isn't any token
  let jwtPayload;
  
  //Try to validate the token and get data
  try {
    jwtPayload = <any>jwt.verify(token, process.env.jwtSecret);
    res.locals.jwtPayload = jwtPayload;
  } catch (error) {
    //If token is not valid, respond with 401 (unauthorized)
    res.status(401).send({ error });
    return;
  }


  //Call the next middleware or controller
  next();
};