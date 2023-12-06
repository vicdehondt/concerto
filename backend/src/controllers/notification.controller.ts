import * as express from 'express';
import { BaseController } from './base.controller';
import * as database from '../models/Usermodel';
import * as notif from "../models/Notificationmodel"
import {createMulter} from "../configs/multerConfig"
import { notificationEmitter, newNotification } from "../configs/emitterConfig";
const fs = require('fs');

const userImagePath = './public/users';

const upload = createMulter(userImagePath);

export class NotificationController extends BaseController {

    constructor() {
        super("/notifications");
    }

    initializeRoutes(): void {
        this.router.get('/subscribe', this.requireAuth,
			upload.none(),
			(req: express.Request, res: express.Response) => {
				this.createSSE(req, res);
			});
		this.router.get('/', this.requireAuth,
			upload.none(),
			(req: express.Request, res: express.Response) => {
				this.getNotifications(req, res);
			});
        this.router.post('/:notificationid/read', this.requireAuth,
			upload.none(),
			(req: express.Request, res: express.Response) => {
				this.markNotificationAsRead(req, res);
			});
        this.router.delete('/:notificationid', this.requireAuth,
			upload.none(),
			(req: express.Request, res: express.Response) => {
				this.deleteNotification(req, res);
			});
    }

    // based on: https://blog.q-bit.me/how-to-use-nodejs-for-server-sent-events-sse/#h3-3
    createSSE(req: express.Request, res: express.Response) {
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            Connection: 'keep-alive',
            'Cache-Control': 'no-cache',
        });

        res.write('event: connected\n');
        res.write(`data: You are now subscribed!\n\n`);

        notificationEmitter.on(newNotification, (notification) => {
            res.write('event: notification\n');
            res.write(`data: ${notification}\n\n`);
        });

        req.on('close', () => res.end('OK'))
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
