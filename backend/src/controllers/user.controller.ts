import * as express from 'express';
import { BaseController } from './base.controller';
import * as database from '../models/Usermodel';
import * as multer from "multer";
import * as bcrypt from "bcrypt";
const fs = require('fs');

const upload = multer({ dest: "./src/uploads/"});
const saltingRounds = 12;

export class UserController extends BaseController {

    constructor() {
        super("/user");
    }

    initializeRoutes(): void {
        this.router.post("/add",
        upload.single("image"),
        (req: express.Request, res: express.Response) => {
			this.addUser(req, res);
		});
    }

    async addUser(req: express.Request, res: express.Response): Promise<void> {
        bcrypt.hash(req.body.password, saltingRounds, async (err, hash) => {
            console.log(hash)
            await database.CreateUser(req.body.username, req.body.mail, hash, saltingRounds, req.file);
            res.status(200).json({succes: true, message: "User has been created!"});
        })
    }

    /**
	 * Check if a string is actually provided
	 *
	 * @param {string} param Provided string
	 * @returns {boolean} Valid or not
	 */
	private _isGiven(param: string): boolean {
		if (param == null)
			return false;
		else
			return param.trim().length > 0;
	}

    /**
	 * Check if a string is a valid email
	 *
	 * @param {string} email Email string
	 * @returns {boolean} Valid or not
	 */
	private _isEmailValid(email: string): boolean {
		const atIdx = email.indexOf("@");
		const dotIdx = email.indexOf(".");
		return atIdx != -1 && dotIdx != -1 && dotIdx > atIdx;
	}
}
