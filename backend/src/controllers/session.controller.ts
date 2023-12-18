import * as express from 'express';
import { BaseController } from './base.controller';
import * as database from '../models/Usermodel';
import {body, validationResult} from "express-validator"
import {createMulter} from "../configs/multerConfig"
import * as bcrypt from "bcrypt";
const fs = require('fs');

const sessionFilePath = './public/sessions';

const upload = createMulter(sessionFilePath)

const saltingRounds = 12;

export class SessionController extends BaseController {

    constructor() {
        super("/");
    }

    initializeRoutes(): void {
		this.router.get("/auth/status",
			upload.none(),
			(req: express.Request, res: express.Response) => {
				this.checkAuthentication(req, res);
			});
		// Route to let users register
        this.router.post("/register",
			upload.none(),
			[
				body("username").custom(async value => {
					const user = await database.RetrieveUser('username', value);
					if  (user != null) {
						throw new Error('Username already in use by other user.');
					}
				}),
				body("password").trim().isLength({ min: 6}).withMessage('Password must be at least 6 characters long.').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/).withMessage('Password must include at least one lowercase letter, one uppercase letter, and one number.'),
				body("verifyPassword").trim().custom((value, { req }) => {
					if (value !== req.body.password) {
						throw new Error('Passwords do not match!');
					} else {
						return true;
					}
				}),
				body("mail").isEmail().withMessage("Provide an email").custom(async value => {
					const user = await database.RetrieveUser('mail', value);
					if (user != null) {
						throw new Error("Email already used by other user.");
					}
				}),
				body("firstGenre").trim().notEmpty(),
				body("secondGenre").trim().notEmpty(),
			],
			(req: express.Request, res: express.Response) => {
				this.registerUser(req, res);
			});
		// Route to handle login
		this.router.post("/login",
			upload.none(),
			[
				body("username").trim().custom(async (value, { req }) => {
					const user = await database.RetrieveUser('username', value);
					if (user == null) {
						throw new Error("There exists no user with this username.");
					} else {
						req.body.user = user;
						return true;
					}
				}),
				body("password").trim().notEmpty(),
			],
			(req: express.Request, res: express.Response) => {
				this.loginUser(req, res);
			});
		// Route to handle logout
		this.router.post("/logout", this.requireAuth,
			upload.none(),
			(req: express.Request, res: express.Response) => {
				this.logoutUser(req, res);
			});
    }

	async loginUser(req: express.Request, res: express.Response) {
		try {
			console.log("Received request to login.");
			const sessiondata = req.session;
			const result = validationResult(req);
			if (sessiondata.userID != null) {
				res.status(200).json({success: true, message: "You are already loggin in."})
			} else if (result.isEmpty()){
				const {username, password} = req.body;
				const user = req.body.user;
				bcrypt.compare(password, user.password, function (err, result) {
					if (result == true) {
						sessiondata.userID = user.userID;
						res.status(200).json({success: true, message: "You are succesfully logged in."})
					} else {
						res.status(400).json({success: false, message: "The provided password is incorrect."})
					}
				});
			} else {
				res.status(400).json({sucess: false, errors: result.array()});
			}
		} catch (err) {
			console.log("There was an error: ", err);
			res.status(500).json({ success: false, error: "Internal server error."});
		}
	}

    async registerUser(req: express.Request, res: express.Response): Promise<void> {
		try {
			console.log("Received request to register user");
			const result = validationResult(req);
			if (result.isEmpty()){
				bcrypt.hash(req.body.password, saltingRounds, async (err, hash) => {
				database.sendMailVerification(req.body.username, req.body.mail);
				const {username, mail, firstGenre, secondGenre } = req.body;
				const user = await database.CreateUser(username, mail, firstGenre, secondGenre, hash, saltingRounds);
				res.status(200).json({success: true, message: "User has been created!", userID: user.userID});
				})
			} else {
				res.status(400).json({success: false, errors: result.array()});
			}
		} catch (err) {
			console.log("There was an error: ", err);
			res.status(500).json({ success: false, error: "Internal server error."});
		}
    }

	logoutUser(req: express.Request, res: express.Response) {
		const sessiondata = req.session;
		sessiondata.userID = null;
		res.status(200).json({success: true, message: "You are succesfully logged out."})
	}

	checkAuthentication(req, res) {
		const sessiondata = req.session;
		if (sessiondata.userID != null) {
			res.status(200).json();
		} else {
			res.status(400).json();
		}
	}
}
