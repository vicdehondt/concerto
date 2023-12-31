import * as express from 'express';
import { BaseController } from "./controllers/base.controller";
import { EventController } from "./controllers/event.controller";
import { UserController } from './controllers/user.controller';
import { SessionController } from './controllers/session.controller';
import { FriendController } from './controllers/friend.controller';
import { VenueController } from './controllers/venue.controller';
import { ArtistController } from './controllers/artist.controller';
import { NotificationController } from './controllers/notification.controller';
import { ProfileController } from './controllers/profile.controller';
import { WishlistController } from './controllers/wishlist.controller';
import { getCorsConfiguration, environment } from './configs/corsConfig';
import { synchronize } from './configs/sequelizeConfig';
const session = require("express-session");
var FileStore = require('session-file-store')(session);
import exp = require('constants');
import { SearchController } from './controllers/search.controller';

const cors = getCorsConfiguration();

synchronize(); // Synchronize the database
var fileStoreOptions = {path: './src/sessions', reapInterval: 900};

export class App {
    app: express.Application;
    port: number = 8080;
    controllers: Map<string, BaseController> = new Map();
    path: string = "";

    constructor() {
        this.app = express();
        this.app.use(cors);
        this.app.use(session({
            store: new FileStore(fileStoreOptions),
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
        this.addController(new SearchController());
        this.addController(new VenueController());
        this.addController(new ArtistController());
        this.addController(new NotificationController());
        this.addController(new ProfileController());
        this.addController(new WishlistController());
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
