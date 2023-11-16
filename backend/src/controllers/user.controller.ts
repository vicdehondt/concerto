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

export class UserController extends BaseController {

    constructor() {
        super("/users");
    }

    initializeRoutes(): void {
		this.router.get('/:username', cors, this.requireAuth,
			upload.none(),
			(req: express.Request, res: express.Response) => {
				this.getUserInformation(req, res);
			});
		this.router.delete('/:username', cors, this.requireAuth,
			upload.none(), this.requireAuth,
			(req: express.Request, res: express.Response) => {
				this.deleteUser(req, res);
			});
		this.router.get('/:username/checkins', cors, this.requireAuth,
			upload.none(),
			(req: express.Request, res: express.Response) => {
				this.getCheckIns(req, res);
			});
    }

	async deleteUser(req: express.Request, res: express.Response) {
		const sessiondata = req.session;
		await database.DeleteUser(sessiondata.userID);
		sessiondata.isLoggedIn = false;
		sessiondata.userID = null;
		res.status(200).json({ success: true, message: "User successfully deleted"});
	}

	async getUserInformation(req: express.Request, res: express.Response) {
		const sessiondata = req.session;
		const username = req.params.username;
		const user = await database.RetrieveUser("username", username);
		if (user != null) {
			const result = user.get({ plain: true});
			delete result.password;
			delete result.salt;
			if (sessiondata.userID == user.userID) {
				res.status(200).json(result);
			} else {
				delete result.mail;
				res.status(200).json(result);
			}
		} else {
			res.status(400).json({ success: false, error: "User not found!"});
		}
	}
	async getCheckIns(req: express.Request, res: express.Response) {
		const sessiondata = req.session;
		const result = await allCheckedInEvents(sessiondata.userID);
		res.status(200).json(result);
	}
}
