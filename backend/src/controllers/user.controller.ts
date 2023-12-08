import * as express from 'express';
import { BaseController } from './base.controller';
import * as database from '../models/Usermodel';
import {createMulter} from "../configs/multerConfig"
import { allCheckedInEvents, allAttendedEvents } from "../models/Checkinmodel"
const fs = require('fs');

const userImagePath = './public/users';

const upload = createMulter(userImagePath);

export class UserController extends BaseController {

    constructor() {
        super("/users");
    }

    initializeRoutes(): void {
		this.router.get('/:userid', this.requireAuth,
			upload.none(),
			(req: express.Request, res: express.Response) => {
				this.getUserInformation(req, res);
			});
		this.router.delete('/:userid', this.requireAuth,
			upload.none(), this.requireAuth,
			(req: express.Request, res: express.Response) => {
				this.deleteUser(req, res);
			});
		this.router.get('/:userid/checkins', this.requireAuth, this.checkUserExists,
			upload.none(),
			(req: express.Request, res: express.Response) => {
				this.getCheckIns(req, res);
			});
		this.router.get('/:userid/attended', this.requireAuth, this.checkUserExists,
			upload.none(),
			(req: express.Request, res: express.Response) => {
				this.getAttendedEvents(req, res);
			});
		this.router.get('/:userid/friends', this.requireAuth, this.checkUserExists,
			upload.none(),
			(req: express.Request, res: express.Response) => {
				this.getFriends(req, res);
			});
    }

	async deleteUser(req: express.Request, res: express.Response) {
		const sessiondata = req.session;
		const loggedInUser = sessiondata.userID;
		if (loggedInUser == req.params.userid) {
			await database.DeleteUser(sessiondata.userID);
			sessiondata.userID = null;
			res.status(200).json({ success: true, message: "User successfully deleted"});
		} else {
			res.status(400).json({ success: false, error: "You do not have permission to delete this user!"});
		}
	}

	async getUserInformation(req: express.Request, res: express.Response) {
		const sessiondata = req.session;
		const userID = req.params.userid;
		const user = await database.RetrieveUser("userID", userID);
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

	async getUserRelations(req: express.Request, res: express.Response, retrievePrivacySetting, retrieveDataFunction) {
		const sessiondata = req.session;
		const user = req.body.user;
		const privacy = retrievePrivacySetting(user)
		console.log(privacy)
		if (user.userID == sessiondata.userID) {
			const result = await retrieveDataFunction(user.userID);
			console.log("Requesting your own information")
			res.status(200).json(result);
		}
		else if (privacy == 'private') {
			res.status(401).json({ error: database.privacyErrorMsg});
		} else {
			const result = await retrieveDataFunction(user.userID);
			if (privacy == 'public') {
				console.log("This information is public")
				res.status(200).json(result);
			} else {
				const friendship = await database.FindFriend(user.userID, sessiondata.userID);
				if ((friendship != null) && (friendship.status == 'accepted')) {
					console.log("You are friends so able to receive the information")
					res.status(200).json(result);
				} else {
					res.status(401).json({ error: database.privacyErrorMsg});
				}
			}
		}
	}

	async getFriends(req: express.Request, res: express.Response) {
		this.getUserRelations(req, res, user => { return user.privacyFriends},async userid => {
			return await database.GetAllFriends(userid)
		});
	}

	async getCheckIns(req: express.Request, res: express.Response) {
		this.getUserRelations(req, res, user => { return user.privacyCheckedInEvents}, async userid => {
			return await allCheckedInEvents(userid)
		});
	}

	async getAttendedEvents(req: express.Request, res: express.Response) {
		this.getUserRelations(req, res, user => { return user.privacyCheckedInEvents}, async userid => {
			return await allAttendedEvents(userid);
		});
	}
}
