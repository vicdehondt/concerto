import * as express from 'express';
import { BaseController } from "./controllers/base.controller";
import { EventController } from "./controllers/event.controller";
import { UserController } from './controllers/user.controller';
import { SessionController } from './controllers/session.controller';
import { FriendController } from './controllers/friend.controller';
import { getCorsConfiguration, environment } from './configs/corsConfig';
const session = require("express-session");
import exp = require('constants');


const cors = getCorsConfiguration();

// const cookieParser = require("cookie-parser"); // Uit video van cookies: https://www.youtube.com/watch?v=34wC1C61lg0&t=1214s&ab_channel=SteveGriffith-Prof3ssorSt3v3

export class App {
    app: express.Application;
    port: number = 8080;
    controllers: Map<string, BaseController> = new Map();
    path: string = "";

    constructor() {
        this.app = express();
        // this.app.use(cookieParser()); // Ook uit video van cookies.
        // this.app.use(cors)
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', environment.frontendURL);
            res.header('Access-Control-Allow-Credentials', true);
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

            if (req.method === 'OPTIONS') {
              res.sendStatus(200);
            } else {
              next();
            }
          });
        this.app.use(session({
            secret: 'secret-field',
            resave: false,
            saveUninitialized: true,
            rolling: true,
            cookie: {
                maxAge: 600000,
                domain: environment.domain,
            },
        }));
        this.app.use(express.static('public'));
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(express.json());
        this._initializeControllers();
        this.listen();
    }

    private _initializeControllers(): void {
        // Add new controllers here
        this.addController(new EventController());
        this.addController(new UserController());
        this.addController(new SessionController());
        this.addController(new FriendController());
        // We link the router of each controller to our server
        this.controllers.forEach(controller => {
            this.app.use(`${this.path}${controller.path}`, controller.router);
        });
    }

    public addController(controller: BaseController): void {
        this.controllers.set(controller.constructor.name, controller);
    }

    public listen() {
        this.app.listen(this.port, () => {
            console.log(`App listening on http://localhost:${this.port}`);
        });
    }

}
export default new App();
