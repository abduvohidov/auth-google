import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import router from "./routes";
import session from "express-session";
import "./config/passport";
import path from "path";
import { ErrorHandlerMiddleware } from "@middlewares";
import passport from "passport";
dotenv.config();

class Server {
  public app: Application;
  private port: string | number;

  constructor() {
    this.app = express();
    this.port = process.env.APP_PORT || 8000;

    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    this.app.use(express.json());
    this.app.use(
      session({
        secret: "secretni",
        resave: false,
        saveUninitialized: false,
      })
    );
    this.app.set("view engine", "ejs");
    this.app.set("views", path.join(process.cwd(), "src", "views"));
  }

  private initializeRoutes(): void {
    this.app.use("/api/v1", router);
    this.app.use(
      "/auth/google/login",
      passport.authenticate("google", { scope: ["profile", "email"] })
    );

    this.app.get("/login", (req: Request, res: Response) => {
      res.render("login");
    });

    this.app.use(
      "/auth/google/callback",
      passport.authenticate("google"),
      (req: Request, res: Response) => {
        let user = req.user as any;
        res.send(user);
      }
    );
  }

  private initializeErrorHandling(): void {
    this.app.use("/*", ErrorHandlerMiddleware.errorHandlerMiddleware);
  }

  public listen(): void {
    this.app.listen(this.port, () => {
      console.log(`Server is running on port http://localhost:${this.port}`);
    });
  }
}

const server = new Server();
server.listen();
