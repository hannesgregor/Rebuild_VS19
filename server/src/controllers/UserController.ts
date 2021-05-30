import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { validate } from "class-validator";
import { User } from "../entity/User";
import * as nodemailer from "nodemailer";
import * as crypto from "crypto";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import * as dotenv from 'dotenv';
dotenv.config();


class UserController{

static listAll = async (req: Request, res: Response) => {
  //Get users from database
  const userRepository = getRepository(User);
  const users = await userRepository.find({
    select: ["id", "email", "firstName", "lastName", "description"] //We dont want to send the passwords on response
  });

  //Send the users object
  res.send(users);
};

static listUserWithPosts = async (req: Request, res: Response) => {
  //Get user from database
  const id = req.params.id
  const user = await getRepository(User)
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.posts", "post")
    .leftJoinAndSelect("post.categories", "categories")
    .select(["user.id", "user.email", "user.firstName", "user.lastName", "user.description", "post", "categories"])
    .where("user.id = :id", { id })
    .getOne();

    res.send(user);

};

static getOneById = async (req: Request, res: Response) => {
  //Get the ID from the url
  const id = req.params.id;

  //Get the user from database
  const userRepository = getRepository(User);
  try {
    const user = await userRepository.findOneOrFail(id, {
        select: ["id", "email", "firstName", "lastName", "description"] //We dont want to send the password on response
    });
    res.send(user);
  } catch (error) {
    res.status(404).send("Kasutajat ei leitud");
  }
};

static newUser = async (req: Request, res: Response) => {
    //Get parameters from the body
    let { email, password, firstName, lastName, role, isActive, description } = req.body;
    let user = new User();
    user.email = email;
    user.password = password;
    user.firstName = firstName;
    user.lastName = lastName;
    user.role = role;
    user.isActive = isActive;
    user.description = description;

    if (!email || !password){
      return res.status(400).send({
        message: "Email or password missing."
      })
    };

    //Validate if the parameters are ok
    const errors = await validate(user);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }

    // async email

    const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: "rebuildingnoreply@gmail.com",
      pass: "pw"
    }
    });

  const emailToken = jwt.sign(
    {
      userId: user.id, 
      email: user.email, 
      firstName: user.firstName, 
      lastName: user.lastName
    },
    process.env.EMAIL_SECRET,
    {
      expiresIn: '1d',
    });

    const url = `http://localhost:3000/confirmation/${emailToken}`;

      transporter.sendMail({
        to: email,
        subject: 'E-posti aadressi kinnitamine',
        html: `Oma ReBuild kasutaja kinnitamiseks klikkige lingil <a href="${url}">${url}</a>`,
      });
    
  //Hash the password, to securely store on DB
  user.hashPassword();
  
  //Try to save. If fails, the email is already in use
  const userRepository = getRepository(User);
  try {
    await userRepository.save(user);
  } catch (e) {
    res.status(409).send("E-posti aadress on juba kasutusel");
    return;
  }
  
  //If all ok, send 201 response
  res.status(201).send({ id: user.id });// and confirmation email sent!");
  return user;
};

static confirmation = async (req: Request, res: Response) => {

  //Get email from JWT
  let jwtPayload;
  
  try {
    jwtPayload = <any>jwt.verify(req.params.token, process.env.EMAIL_SECRET);
    res.locals.jwtPayload = jwtPayload;
    const { email } = jwtPayload;
    //Get user from the database
    await getRepository(User)
    .createQueryBuilder("user")
    .update({ isActive: true })
    .where("user.email = :email", { email: email })
    .execute();
  } catch (error) {
    //If token is not valid, respond with 401 (unauthorized)
    res.status(401).send({ error: "Please try to confirm email again"});
    return;
  }

  res.status(201).send("Teie ReBuild veebilehe kasutaja on kinnitatud!" );// and confirmation email sent!");
  //res.redirect(201, '/auth/login');// and confirmation email sent!");
  
};

static editUser = async (req: Request, res: Response) => {
  
  //Get the user ID from the url
  const id = req.params.id;

  //Check which user id is logged in
  const userId = res.locals.jwtPayload.userId;

  //Get values from the body
  const { description } = req.body;

  const token = req.cookies.token;
  if (token == null) return res.status(401).send("Palun logige sisse")

  //Try to find user on database
  const userRepository = getRepository(User);
  let user;
  if (id!= userId) return res.status(401).send({data: "Sinu kasutaja on kinnitamata!"})
  try {
    user = await userRepository.findOneOrFail(id);
  } catch (error) {
    //If not found, send a 404 response
    res.status(404).send("Kasutajat ei leitud");
    return;
  }

  //Validate the new values on model
  user.description = description;

  const errors = await validate(user);
  if (errors.length > 0) {
    res.status(400).send(errors);
    return;
  }

 //Try to save, if fails, that means email is already in use
 try {
    await userRepository.save(user);
  } catch (e) {
    res.status(409).send("Something was missing");
    return;
  }
  //After all send a 202 (Accepted) response
  res.status(202).send("Kasutaja uuendatud");
};

static deleteUser = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id = req.params.id;
  
    const userRepository = getRepository(User);
    let user: User;
    try {
      user = await userRepository.findOneOrFail(id);
    } catch (error) {
      res.status(404).send("Kasutajat ei leitud");
      return;
    }
    userRepository.delete(id);
  
    //After all send a 204 (no content, but accepted) response
    res.status(204).send();
};

static forgotPassword = async (req: Request, res: Response) => {

  const { email } = req.body
  const userRepository = getRepository(User);
  try {

    const user = await userRepository.findOneOrFail({
      where : { email }
    })
    
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: "rebuildingnoreply@gmail.com",
          pass: "pw"
        }
    });

    const newPassword = crypto.randomBytes(4).toString('HEX')

    transporter.sendMail({
      from: 'Rebuild <b9cec8212a-7e0177@inbox.mailtrap.io>',
      to: email,
      subject: 'Sinu uus salasõna',
      html: `<p>Tere! <br> <br>
      Oled oma Rebuild veebilehe salasõna unustanud? <br>
      Sinu uus salasõna on: <b> ${newPassword} </b></p>` //<a href="htttp://localhost:3000/auth/login">Click here to log in</a>`
    }).then(
      () => {
        bcrypt.hash(newPassword, 8).then(
          password => {
            userRepository.update(user.id, {
              password 
            }).then (
              () => {
                return res.status(200).send ({ message: 'E-post saadetud!' })
              }
            ).catch(
              () => {
                return res.status(404).send ({ message: 'E-posti saatmine ebaõnnestus' })
              }
            )
          }
        )
      }
    ).catch(
      () => {
        return res.status(404).send ({ message: 'E-posti saatmine ebaõnnestus' })
      }
    )
  } catch (error) {
    //If not found, send a 404 response
    res.status(404).send("Kasutajat ei leitud");
    return;
  }
  };

}
  
export default UserController;