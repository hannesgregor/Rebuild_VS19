import "reflect-metadata";
import { createConnection } from "typeorm";
import * as express from "express";
import * as bodyParser from "body-parser"
import * as cookieParser from "cookie-parser";
import * as helmet from "helmet";
import * as cors from "cors";
import routes from "./routes";
import {pagination} from "typeorm-pagination";
import { Request, Response, NextFunction } from "express";


//Connects to the Database -> then starts the express
createConnection()
  .then(async connection => {
    
    // Create a new express application instance
    const app = express();

    // Call midlewares
    app.use(helmet());
    app.use(bodyParser.json());
    app.use(cookieParser());
    app.use(pagination);
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());


    /* app.use(cors({
      origin: 'http://localhost:3000',
      credentials: true, 
    })); */

    const allowedOrigins = ['http://localhost:3000', 'http://localhost:5000']
    const corsOptions = {
    credentials: true,
    origin: function (origin, callback) {
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    }
    }
    app.use(cors(corsOptions));

    //Set all routes from routes folder
    app.use("/", routes);

    app.listen(5000, () => {
      console.log("Server started on port 5000");
    });
  })
  .catch(error => console.log(error));