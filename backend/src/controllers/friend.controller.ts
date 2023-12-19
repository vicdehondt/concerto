import * as express from 'express';
import { BaseController } from './base.controller';
import * as database from '../models/Usermodel';
import { NotificationObject, createNewNotification, Notification } from '../models/Notificationmodel';
import {createMulter} from "../configs/multerConfig"

const friendFilePath = './public/friends';

const upload = createMulter(friendFilePath);

export class FriendController extends BaseController {

    constructor() {
        super("/friends");
    }

    initializeRoutes(): void {
        this.router.get("/",
            upload.none(), this.requireAuth,
            (req: express.Request, res: express.Response) => {
                res.set('Access-Control-Allow-Credentials', 'true');
                this.getAllFriends(req, res);
            });
        this.router.post('/', this.requireAuth,
            upload.none(),
            (req: express.Request, res: express.Response) => {
                res.set('Access-Control-Allow-Credentials', 'true');
                this.sendFriendRequest(req, res);
            });
        this.router.delete('/:userID/request', this.requireAuth, this.checkUserExists,
            upload.none(),
            (req: express.Request, res: express.Response) => {
                res.set('Access-Control-Allow-Credentials', 'true');
                this.undoRequest(req, res);
            });
        this.router.post('/:userID/accept', this.requireAuth, this.checkUserExists,
            upload.none(),
            (req: express.Request, res: express.Response) => {
                res.set('Access-Control-Allow-Credentials', 'true');
                this.responseFriendRequest(req, res, true);
            });
        this.router.delete('/:userID', this.requireAuth, this.checkUserExists,
            upload.none(),
            (req: express.Request, res: express.Response) => {
                res.set('Access-Control-Allow-Credentials', 'true');
                this.unfriend(req, res);
            });
        this.router.post('/:userID/deny', this.requireAuth, this.checkUserExists,
            upload.none(),
            (req: express.Request, res: express.Response) => {
                res.set('Access-Control-Allow-Credentials', 'true');
                this.responseFriendRequest(req, res, false);
            });
    }

    async undoRequest(req: express.Request, res: express.Response) {
        try {
            const friendship = await database.FindFriend(req.session.userID, req.params.userID);
            if (friendship) {
                if (friendship.status == 'pending') {
                    await friendship.destroy();
                    const notification = await Notification.findOne({
                        include: {
                            model: NotificationObject,
                            where: {
                                notificationType: 'friendrequestreceived',
                                actor: req.session.userID,
                            }
                        },
                        where: {
                            receiver: req.params.userID
                        }
                    });
                    if (notification) {
                        await notification.destroy();
                    }
                    res.status(200).json({success: true, message: "Removed friend request."});
                } else {
                    res.status(400).json({ success: false, error: "You are already friends, there is no request anymore."});
                }
            } else {
                res.status(400).json({ success: false, error: "Unable to remove request as you did not have a friend request"});
            }
        } catch (err) {
            console.log("There was an error: ", err);
			res.status(500).json({ success: false, error: "Internal server error."});
        }
    }

    async unfriend(req: express.Request, res: express.Response) {
        try {
            const friendship = await database.FindFriend(req.session.userID, req.params.userID);
            if (friendship) {
                await friendship.destroy();
                res.status(200).json({success: true, message: "Removed this user from your friends."})
            } else {
                res.status(400).json({success: false, error: "You were no friends with this user."})
            }
        } catch (err) {
            console.log("There was an error: ", err);
			res.status(500).json({ success: false, error: "Internal server error."});
        }
    }

    async getAllFriends(req: express.Request, res: express.Response){
        try {
            console.log("Received request to get all friends from logged in user.");
            const sessiondata = req.session;
            const friends = await database.GetAllFriends(sessiondata.userID);
            res.status(200).json(friends);
        } catch (err) {
            console.log("There was an error: ", err);
			res.status(500).json({ success: false, error: "Internal server error."});
        }
    }

    async sendFriendRequest(req: express.Request, res: express.Response) {
        try {
            console.log("Received request to send a friend request");
            const sessiondata = req.session;
            const result = await database.SendFriendRequest(sessiondata.userID, req.body.receiverID);
            if (result == database.FriendInviteResponses.SENT) {
                const object = await NotificationObject.create({
                    notificationType: 'friendrequestreceived',
                    actor: sessiondata.userID,
                });
                await createNewNotification(object.ID, req.body.receiverID);
                res.status(200).json({succes: true, message: "A friend request has been sent."});
            } else if (result == database.FriendInviteResponses.ILLEGALREQUEST) {
                res.status(400).json({ succes: false, message: "Cannot send a friend request to yourself."});
            } else if (result == database.FriendInviteResponses.ALREADYFRIEND) {
                res.status(400).json({ succes: false, message: "There is already a friend relation with this user."});
            } else {
                res.status(400).json({ succes: false, message: "The other user was not found."});
            }
        } catch (err) {
            console.log("There was an error: ", err);
			res.status(500).json({ success: false, error: "Internal server error."});
        }
	}

    async responseFriendRequest(req: express.Request, res: express.Response, answer: boolean) {
        try {
            console.log("Received request to respond to friend request.");
            const sender = req.body.user;
            const sessiondata = req.session;
            const friendrelation = await database.FindFriend(sender.userID, sessiondata.userID);
            if (friendrelation != null) {
                const status = friendrelation.status;
                if (status == 'pending') {
                    if (answer) {
                        const object = await NotificationObject.create({
                            notificationType: 'friendrequestaccepted',
                            actor: sessiondata.userID,
                        });
                        await createNewNotification(object.ID, sender.userID);
                        friendrelation.status = 'accepted';
                        friendrelation.save();
                        res.status(200).json({ success: true, message: 'Friend request accepted.'});
                    } else {
                        const object = await NotificationObject.create({
                            notificationType: 'friendrequestdenied',
                            actor: sessiondata.userID,
                        });
                        await createNewNotification(object.ID, sender.userID);
                        friendrelation.destroy();
                        res.status(200).json({ success: true, message: 'Friend request denied.'});
                    }
                } else {
                    res.status(400).json({ success: false, error: 'You are already friends.'});
                }
            } else {
                res.status(400).json({ success: false, error: 'There is no friend request.'});
            }
        } catch (err) {
            console.log("There was an error: ", err);
			res.status(500).json({ success: false, error: "Internal server error."});
        }
    }
}
