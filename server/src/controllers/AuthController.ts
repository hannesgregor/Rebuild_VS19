import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { getRepository } from "typeorm";
import { validate } from "class-validator";
import cookieParser from "cookie-parser";
import { User } from "../entity/User";


class AuthController {
  static login = async (req: Request, res: Response) => {
    //Check if email and password are set
    let { email, password } = req.body;
    if (!(email && password)) {
      res.status(400).send({ error: 'Sisesta e-posti aadress ja salasõna' });
    }

    //Get user from database
    const userRepository = getRepository(User);
    let user: User;
    try {
      user = await userRepository.findOneOrFail({ where: { email } });
    } catch (error) {
      res.status(401).send({ error: "Vale e-posti aadress või salasõna"}) ;
    }

    //Check if encrypted password match
    if (!user.checkIfUnencryptedPasswordIsValid(password)) {
      res.status(401).send({ error: "Vale e-posti aadress või salasõna"});
      return;
    }

    //check if user email is verified
    if(!user.isActive) {
      res.status(400).send({ error: "Sisselogimiseks kinnitage oma e-posti aadress!"});
    }

    //Sing JWT, valid for 30 DAYS
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        firstName: user.firstName, 
        lastName: user.lastName
       },
       process.env.jwtSecret, 
      { expiresIn: "30d" }
    );

    //Set token as cookie, expires in 1 MONTH
    res.cookie("token", token, {httpOnly: true, maxAge: 1000 * 3600 * 24 * 30, sameSite: "lax" });
    res.status(200).send({ data: user.id })
    console.log(token);
  };

  static getMe = async (req: Request, res: Response) => {
    const token = req.cookies.token;
    if (token == null) return res.status(401).send("Palun logige sisse")
    let jwtPayload;
    let userId;
    try {
      jwtPayload = <any>jwt.verify(token, process.env.jwtSecret);
    } catch (error) {
      //If token is not valid, respond with 401 (unauthorized)
      res.status(401).send({ error: "Palun logige sisse"});
      return;
    }
    res.send(jwtPayload);

    
  };

  static changePassword = async (req: Request, res: Response) => {
    //Get ID from JWT
    const id = res.locals.jwtPayload.userId;

    //Get parameters from the body
    const { oldPassword, newPassword } = req.body;
    if (!(oldPassword && newPassword)) {
      res.status(400).send("Täida nõutud väljad");
    }

    //Get user from the database
    const userRepository = getRepository(User);
    let user: User;
    try {
      user = await userRepository.findOneOrFail(id);
    } catch (id) {
      res.status(401).send();
    }

    //Check if old password matchs
    if (!user.checkIfUnencryptedPasswordIsValid(oldPassword)) {
      res.status(401).send("Eksisteeriv salasõna on vale!");
      return;
    }

    //Validate the model (password length)
    user.password = newPassword;
    const errors = await validate(user);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }
    //Hash the new password and save
    user.hashPassword();
    userRepository.save(user);

    res.sendStatus(200);
  };

  static logout = (req: Request, res: Response) => {
    res.clearCookie("token");
    res.send("Välja logitud!");
  };

  
};
export default AuthController;