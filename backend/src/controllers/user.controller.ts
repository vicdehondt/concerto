import * as express from 'express';
import { BaseController } from './base.controller';
import * as database from '../models/Usermodel';
import * as multer from "multer";
const fs = require('fs');

const cors = require("cors");

const environment = {
	frontendURL: "http://localhost:3000"
}
if (process.env.NODE_ENV == "production") {
	environment.frontendURL = "https://concerto.dehondt.dev"
}

const corsOptions = {
	// https://www.npmjs.com/package/cors
	"origin": environment.frontendURL,
	"methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
	"preflightContinue": false,
	"optionsSuccessStatus": 204
}

export class UserController extends BaseController {

    constructor() {
        super("/users");
    }

    initializeRoutes(): void {
		this.router.get('/:username', cors(corsOptions), this.requireAuth,
        // upload.single("image"),
        (req: express.Request, res: express.Response) => {
					res.set('Access-Control-Allow-Credentials', 'true');
					this.getUserInformation(req, res);
		});
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
}
