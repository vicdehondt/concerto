import * as express from 'express';
import { BaseController } from './base.controller';
import {createMulter} from "../configs/multerConfig"
import { param } from "express-validator"
import { Notification, userNotifications, NotificationObject, createNewNotification } from '../models/Notificationmodel';
import { EventModel, expiredEventTreshold } from '../models/Eventmodel';
import { Op } from 'sequelize';
import { CheckedInUsers } from '../models/Checkinmodel';
const cron = require('node-cron');

const userImagePath = './public/users';

const upload = createMulter(userImagePath);

cron.schedule('* * * * *', async () => {
    console.log("Checking all events if they are finished");
    const events = await EventModel.findAll({
        attributes: ['eventID', 'title', 'dateAndTime'],
        where: {
            finishedNotificationSent: false,
            dateAndTime: {
            [Op.lte]: expiredEventTreshold(),
            }
        }
    });
    events.forEach(async event => {
        console.log("Handling finished event with id: ", event.eventID);
        const checkedIns = await CheckedInUsers.findAll({
            where: {
                eventID: event.eventID,
            }
        });
        const object = await NotificationObject.create({
            notificationType: 'reviewEvent',
            typeID: event.eventID,
        });
        checkedIns.forEach(async checkin => {
            const userID = checkin.userID;
            await createNewNotification(object.ID, userID);
        });
        event.finishedNotificationSent = true;
        await event.save();
    });
  });

export class NotificationController extends BaseController {

    constructor() {
        super("/notifications");
    }

    initializeRoutes(): void {
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
        this.router.delete('/:notificationID', this.requireAuth, [this.notificationCheck], this.verifyErrors,
			upload.none(),
			(req: express.Request, res: express.Response) => {
				this.deleteNotification(req, res);
			});
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
        res.status(200).json({ success: true, message: 'The notification was marked as seen.' });
    }

    async deleteNotification(req: express.Request, res: express.Response) {
        const result = req.body.notification;
        await result.destroy();
        res.status(200).json({ success: true, message: 'The notification has been deleted.'});
    }

    async notificationCheck(req: express.Request, res: express.Response, next) {
        await param("notificationID").custom(async (id) => {
            const notification = await Notification.findByPk(id);
            if (notification == null) {
                throw new Error("Notification with that ID does not exist.");
            } else if (notification.receiver != req.session.userID) {
                throw new Error("Notification does not belong to logged in user.");
            } else {
                req.body.notification = notification;
                return true;
            }
        })(req, res, next);
    }
}
