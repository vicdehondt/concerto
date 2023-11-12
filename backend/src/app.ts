import * as express from 'express';
import { BaseController } from "./controllers/base.controller";
import { EventController } from "./controllers/event.controller";
import { UserController } from './controllers/user.controller';
import exp = require('constants');

export class App {
    app: express.Application;
    port: number = 8080;
    controllers: Map<string, BaseController> = new Map();
    path: string = "";

    constructor() {
        this.app = express();
        this.app.use(express.static('uploads'));
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(express.json());
        this._initializeControllers();
        this.listen();
    }

    private _initializeControllers(): void {
        // Add new controllers here
        this.addController(new EventController());
        this.addController(new UserController());
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
