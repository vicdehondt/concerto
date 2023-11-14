import * as express from 'express';
import { BaseController } from './base.controller';
import * as database from '../models/Usermodel';
import * as multer from "multer";
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

export class UserController extends BaseController {

    constructor() {
        super("/users");
    }

    initializeRoutes(): void {
		this.router.get('/:username', this.requireAuth,
        upload.single("image"),
        (req: express.Request, res: express.Response) => {
			this.getUserInformation(req, res);
		});
		this.router.delete('/:username', this.requireAuth,
        upload.single("image"), this.requireAuth,
        (req: express.Request, res: express.Response) => {
			this.deleteUser(req, res);
		});
		this.router.post('/friends', this.requireAuth,
        upload.single("image"),
        (req: express.Request, res: express.Response) => {
			this.sendFriendRequest(req, res);
		});
    }

	async deleteUser(req: express.Request, res: express.Response) {
		const sessiondata = req.session;
		await database.DeleteUser(sessiondata.userID);
		sessiondata.isLoggedIn = false;
		sessiondata.userID = null;
		res.status(200).json({ success: true, message: "User successfully deleted"});
	}

	async sendFriendRequest(req: express.Request, res: express.Response) {
		console.log("Received request to add a friend");
		const sessiondata = req.session;
		const result = await database.SendFriendRequest(sessiondata.userID, req.body.receiverusername);
		if (result == database.FriendInviteResponses.SENT) {
			res.status(200).json({succes: true, message: "A friend request has been sent."});
		} else if (result == database.FriendInviteResponses.ALREADYFRIEND) {
			res.status(400).json({ succes: false, message: "The other user already has a friend relationship"});
		} else {
			res.status(400).json({ succes: false, message: "The other user was not found"});
		}
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
