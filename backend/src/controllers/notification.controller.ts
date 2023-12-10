import * as express from 'express';
import { BaseController } from './base.controller';
import {createMulter} from "../configs/multerConfig"
import { param } from "express-validator"
import { notificationEmitter, newNotification } from "../configs/emitterConfig";
import { Notification, userNotifications, deleteNotificationReply } from '../models/Notificationmodel';
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
        this.router.post('/:notificationID/read', this.requireAuth, [this.notificationCheck], this.verifyErrors,
			upload.none(),
			(req: express.Request, res: express.Response) => {
				this.markNotificationAsRead(req, res);
			});
        this.router.post('/:notificationID/delete', this.requireAuth, [this.notificationCheck], this.verifyErrors,
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

        console.log("Subscribed to SSE");

        res.write('event: connected\n');
        res.write(`data: You are now subscribed!\n\n`);

        notificationEmitter.on(newNotification, (notification) => {
            console.log("New SSE event sent");
            res.write('event: notification\n');
            res.write(`data: ${notification}\n\n`);
        });

        req.on('close', () => res.end('OK'))
    }

	async getNotifications(req: express.Request, res: express.Response) {
		const sessiondata = req.session;
		const result = await userNotifications(sessiondata.userID);
		res.status(200).json(result);
	}

    // everyone is able to modify notification atm
    async markNotificationAsRead(req: express.Request, res: express.Response) {
        const notification = req.body.notification;
        notification.status = 'seen';
        await notification.save();
        res.status(200).json({ success: true, message: 'The notification was marked as seen' });
    }

    async deleteNotification(req: express.Request, res: express.Response) {
        const result = req.body.notification;
        await result.destroy();
        res.status(200).json({ success: true, message: 'The notification has been deleted'});
    }

    async notificationCheck(req: express.Request, res: express.Response, next) {
        await param("notificationID").custom(async (id) => {
            const notification = await Notification.findByPk(id);
            if (notification == null) {
                throw new Error("Notification with that ID does not exist");
            } else if (notification.receiver != req.session.userID) {
                throw new Error("Notification does not belong to logged in user");
            } else {
                req.body.notification = notification;
                return true;
            }
        })(req, res, next);
    }
}
