import * as express from 'express';
import { BaseController } from './base.controller';
import * as database from '../models/Usermodel';
import {createMulter} from "../configs/multerConfig"
const fs = require('fs');

const userImagePath = './public/users';

const upload = createMulter(userImagePath);

export class ProfileController extends BaseController {

    constructor() {
        super("/profile");
    }

    initializeRoutes(): void {
		this.router.get('/', this.requireAuth,
			upload.none(),
			(req: express.Request, res: express.Response) => {

			});
    }
}
