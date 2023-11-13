import * as express from 'express';
import { BaseController } from './base.controller';
import * as database from '../models/Usermodel';
import {body, validationResult} from "express-validator"
import * as multer from "multer";
import * as bcrypt from "bcrypt";
const fs = require('fs');

const UserImagePath = './public/users';

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

export class SessionController extends BaseController {

    constructor() {
        super("/");
    }

    initializeRoutes(): void {
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

	async loginUser(req: express.Request, res: express.Response) {
        console.log("Received request to login");
		const sessiondata = req.session;
		if (sessiondata.isLoggedIn == true) {
			res.status(200).json({success: true, message: "You are already loggin in."})
		} else {
			const {username, password} = req.body;
			const user: typeof database.UserModel = await database.RetrieveUser("username",username);
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

    async addUser(req: express.Request, res: express.Response): Promise<void> {
        console.log("Received request to register user");
		const result = validationResult(req);
		if (result.isEmpty()){
			bcrypt.hash(req.body.password, saltingRounds, async (err, hash) => {
            const samename = await database.RetrieveUser("username", req.body.username);
            const samemail = await database.RetrieveUser("mail", req.body.mail);
            if (samename == null && samemail == null){
			    await database.CreateUser(req.body.username, req.body.mail, hash, saltingRounds);
			    res.status(200).json({success: true, message: "User has been created!"});
            } else {
                res.status(400).json({success: false, errors: "The fields are already used by other user!"});
            }
			})
		} else {
			res.status(400).json({success: false, errors: result.array()});
		}
    }

	logoutUser(req: express.Request, res: express.Response) {
		const sessiondata = req.session;
		sessiondata.isLoggedIn = false;
		sessiondata.userID = null;
		res.status(200).json({success: true, message: "You are succesfully logged out."})
	}
}
