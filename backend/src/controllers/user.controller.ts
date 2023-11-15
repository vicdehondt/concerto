import * as express from 'express';
import { BaseController } from './base.controller';
import * as database from '../models/Usermodel';
import {createMulter} from "./multiferConfig"
const fs = require('fs');

const userImagePath = './public/users';

const upload = createMulter(userImagePath);

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
			res.status(400).json({ succes: false, message: "There is already a friend relation with this user"});
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
