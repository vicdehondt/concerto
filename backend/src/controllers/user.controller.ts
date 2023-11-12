import * as express from 'express';
import { BaseController } from './base.controller';
import * as database from '../models/Usermodel';
import {body, validationResult} from "express-validator"
import * as multer from "multer";
import * as bcrypt from "bcrypt";
import { setEngine } from 'crypto';
const fs = require('fs');

const UserImagePath = './uploads/users';

// Set up storage with a custom filename function
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
	  // Specify the destination folder where the file will be saved
	  cb(null, UserImagePath);
	},
	filename: function (req, file, cb) {
	  // Customize the filename here
	  const originalname = file.originalname;
	  const parts = originalname.split(".");
	  const random = crypto.randomUUID(); // Create unique identifier for each image
	  const newname = random + "." + parts[parts.length - 1];
	  cb(null, newname);
	}
  });

const upload = multer({ storage: storage});

const saltingRounds = 12;

export class UserController extends BaseController {

    constructor() {
        super("/user");
    }

    initializeRoutes(): void {
		this.router.post("/profile/:username", this.requireAuth,
        upload.single("image"),
        (req: express.Request, res: express.Response) => {
			this.getUserInformation(req, res);
		});
		// Route to let users register
        this.router.post("/register",
        upload.single("image"),
        (req: express.Request, res: express.Response) => {
			this.addUser(req, res);
		});
		// Route to handle login
		this.router.post("/login",
		upload.single("image"),
		(req: express.Request, res: express.Response) => {
			this.loginUser(req, res);
		});
		// Route to handle logout
		this.router.post("/logout", this.requireAuth,
		upload.single("image"),
		(req: express.Request, res: express.Response) => {
			this.logoutUser(req, res);
		});
    }
	async addUser(req: express.Request, res: express.Response): Promise<void> {
        bcrypt.hash(req.body.password, saltingRounds, async (err, hash) => {
            await database.CreateUser(req.body.username, req.body.mail, hash, saltingRounds, req.file);
            res.status(200).json({succes: true, message: "User has been created!"});
        })
    }

	async loginUser(req: express.Request, res: express.Response) {
		const sessiondata = req.session;
		if (sessiondata.isLoggedIn == true) {
			res.status(200).json({success: true, message: "You are already loggin in."})
		} else {
			const {username, password} = req.body;
			const user: typeof database.UserModel = await database.RetrieveUser(username);
			if (user != null) {
				bcrypt.compare(password, user.password, function (err, result) {
					if (result == true) {
						sessiondata.isLoggedIn = true;
						sessiondata.userID = user.userID;
						res.status(200).json({success: true, message: "You are succesfully logged in!"})
					} else {
						res.status(400).json({success: false, message: "The provided password is incorrect"})
					}
				})
			} else {
				res.status(400).json({success: false, message: "There was no user found with this username"})
			}
		}
	}

	logoutUser(req: express.Request, res: express.Response) {
		const sessiondata = req.session;
		if (sessiondata.isLoggedIn == true) {
			sessiondata.isLoggedIn = false;
			sessiondata.userID = null;
			res.status(200).json({success: true, message: "You are succesfully logged out."})
		} else {
			res.status(400).json({success: false, message: "You are not logged in."})
		}
	}

	async getUserInformation(req: express.Request, res: express.Response) {
		const sessiondata = req.session;
		const username = req.params.username;
		const user = await database.RetrieveUser(username);
		if (user != null) {
			delete user.password;
			if (sessiondata.userID == user.userID) {
				res.status(200).json(user);
			} else {
				delete user.mail;
				res.status(200).json(user);
			}
		} else {
			res.status(400).json({ success: false, error: "User not found!"});
		}
	}

	requireAuth(req, res, next) {
		if (req.session && req.session.isLoggedIn){
			next()
		} else {
			res.status(401).json({ error: "Unauthorized access" });
		}
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
