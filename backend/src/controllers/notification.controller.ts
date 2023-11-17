import * as express from 'express';
import { BaseController } from './base.controller';
import * as database from '../models/Usermodel';
import {createMulter} from "../configs/multerConfig"
import { getCorsConfiguration } from '../configs/corsConfig';
import { allCheckedInEvents } from "../models/Checkinmodel"
const fs = require('fs');

const userImagePath = './public/users';

const cors = getCorsConfiguration();

const upload = createMulter(userImagePath);

export class NotificationController extends BaseController {

    constructor() {
        super("/notifications");
    }

    initializeRoutes(): void {
		this.router.get('/', cors, this.requireAuth,
			upload.none(),
			(req: express.Request, res: express.Response) => {
				this.getNotifications(req, res);
			});
    }
	async getNotifications(req: express.Request, res: express.Response) {
		const sessiondata = req.session;
		const result = await database.userNotifications(sessiondata.userID);
		res.status(200).json(result);
	}
}
