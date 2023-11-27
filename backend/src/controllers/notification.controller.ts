import * as express from 'express';
import { BaseController } from './base.controller';
import * as database from '../models/Usermodel';
import * as notif from "../models/Notificationmodel"
import {createMulter} from "../configs/multerConfig"
import { getCorsConfiguration } from '../configs/corsConfig';
import { allCheckedInEvents } from "../models/Checkinmodel"
const fs = require('fs');

const userImagePath = './public/users';

const cors = getCorsConfiguration();

const upload = createMulter(userImagePath);

export class NotificationController extends BaseController {

    constructor() {
        super("/notifications");
    }

    initializeRoutes(): void {
		this.router.get('/', cors, this.requireAuth,
			upload.none(),
			(req: express.Request, res: express.Response) => {
				this.getNotifications(req, res);
			});
        this.router.post('/:notificationid/read', cors, this.requireAuth,
			upload.none(),
			(req: express.Request, res: express.Response) => {
				this.markNotificationAsRead(req, res);
			});
        this.router.delete('/:notificationid', cors, this.requireAuth,
			upload.none(),
			(req: express.Request, res: express.Response) => {
				this.deleteNotification(req, res);
			});
    }
	async getNotifications(req: express.Request, res: express.Response) {
		const sessiondata = req.session;
		const result = await notif.userNotifications(sessiondata.userID);
		res.status(200).json(result);
	}

    // everyone is able to modify notification atm
    async markNotificationAsRead(req: express.Request, res: express.Response) {
        const id = req.params.notificationid
        const result = await notif.notificationSeen(id);
        if (result) {
            res.status(200).json({ success: true, message: 'The notification was marked as seen' });
        } else {
            res.status(400).json({ success: false, error: "There was an error marking this notification as seen"});
        }
    }

    async deleteNotification(req: express.Request, res: express.Response) {
        const id = req.params.notificationid;
        const result = await notif.deleteNotification(req.session.userID, id);
        if (result == notif.deleteNotificationReply.SUCCES) {
            res.status(200).json({ success: true, message: 'The notification has been deleted'});
        } else if (result == notif.deleteNotificationReply.ILLEGAL) {
            res.status(400).json({ success: false, error: "You do not have rights to delete this notification"});
        } else {
            res.status(400).json({ success: false, error: "The notification was not found"});
        }
    }
}
