import * as express from 'express';
import { BaseController } from './base.controller';
import * as database from '../models/Usermodel';
import {body, validationResult} from "express-validator";
import {createMulter} from "../configs/multerConfig"
import { getCorsConfiguration } from '../configs/corsConfig';
const fs = require('fs');

const friendFilePath = './public/friends';

const cors = getCorsConfiguration();

const upload = createMulter(friendFilePath);

export class FriendController extends BaseController {

    constructor() {
        super("/friends");
    }

    initializeRoutes(): void {
        this.router.get("/",
            upload.none(), cors, this.requireAuth,
            (req: express.Request, res: express.Response) => {
                res.set('Access-Control-Allow-Credentials', 'true');
                this.getAllFriends(req, res);
            });
        this.router.post('/', cors, this.requireAuth,
            upload.none(),
            (req: express.Request, res: express.Response) => {
                res.set('Access-Control-Allow-Credentials', 'true');
                this.sendFriendRequest(req, res);
            });
        this.router.post('/:senderusername/accept', cors, this.requireAuth,
            upload.none(),
            (req: express.Request, res: express.Response) => {
                res.set('Access-Control-Allow-Credentials', 'true');
                this.responseFriendRequest(req, res, true);
            });
        this.router.post('/:senderusername/deny', cors, this.requireAuth,
            upload.none(),
            (req: express.Request, res: express.Response) => {
                res.set('Access-Control-Allow-Credentials', 'true');
                this.responseFriendRequest(req, res, false);
            });
    }

    async getAllFriends(req: express.Request, res: express.Response){
        console.log("Received request to get all friends form logged in user");
        const sessiondata = req.session;
        const friends = await database.GetAllFriends(sessiondata.userID);
        res.status(200).json(friends);
    }

    async sendFriendRequest(req: express.Request, res: express.Response) {
		console.log("Received request to send a friend request");
		const sessiondata = req.session;
		const result = await database.SendFriendRequest(sessiondata.userID, req.body.receiverusername);
		if (result == database.FriendInviteResponses.SENT) {
			res.status(200).json({succes: true, message: "A friend request has been sent."});
		} else if (result == database.FriendInviteResponses.ILLEGALREQUEST) {
            res.status(400).json({ succes: false, message: "Cannot send a friend request to yourself!"});
        } else if (result == database.FriendInviteResponses.ALREADYFRIEND) {
			res.status(400).json({ succes: false, message: "There is already a friend relation with this user"});
		} else {
			res.status(400).json({ succes: false, message: "The other user was not found"});
		}
	}

    async responseFriendRequest(req: express.Request, res: express.Response, answer: boolean) {
        console.log("Received request to respond to friend request");
        const sendername = req.params.senderusername;
        const sender = await database.RetrieveUser('username', sendername);
        if (sender != null) {
            const sessiondata = req.session;
            const friendrelation = await database.FindFriend(sender.userID, sessiondata.userID);
            if (friendrelation != null) {
                const status = friendrelation.status;
                if (status == 'pending') {
                    if (answer) {
                        friendrelation.status = 'accepted';
                        friendrelation.save();
                        res.status(200).json({ success: true, message: 'Friend request accepted'});
                    } else {
                        friendrelation.destroy();
                        res.status(200).json({ success: true, message: 'Friend request denied'});
                    }
                } else {
                    res.status(400).json({ success: false, error: 'you are already friends'});
                }
            } else {
                res.status(400).json({ success: false, error: 'there is no friend request'});
            }
        } else {
            res.status(400).json({ success: false, error: 'the user does not exist'});
        }
    }
}
