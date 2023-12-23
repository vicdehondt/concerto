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

cron.schedule('* * * * *', async () => { // Check every minute if there are events that are finished that still need to send notifications to users.
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
    events.forEach(async event => { // For each finished event, create a notification object and send it to all users that checked in to that event.
        console.log("Handling finished event with id: ", event.eventID);
        const checkedIns = await CheckedInUsers.findAll({
            where: {
                eventID: event.eventID,
            }
        }); // Only one notification object is created for all users.
        const object = await NotificationObject.create({
            notificationType: 'reviewEvent',
            typeID: event.eventID,
        }); // All notifications are individually created for each user.
        checkedIns.forEach(async checkin => {
            const userID = checkin.userID;
            await createNewNotification(object.ID, userID);
        });
        event.finishedNotificationSent = true;
        await event.save();
    });
  });

// This controller is used to handle all requests to the /notifications endpoint.
export class NotificationController extends BaseController {

    constructor() {
        super("/notifications");
    }

    initializeRoutes(): void {
		this.router.get('/', this.requireAuth, // Route to get all notifications of the logged in user.
			upload.none(),
			(req: express.Request, res: express.Response) => {
				this.getNotifications(req, res);
			});
        this.router.post('/:notificationID/read', this.requireAuth, [this.notificationCheck], this.verifyErrors, // Route to mark a notification as read.
			upload.none(),
			(req: express.Request, res: express.Response) => {
				this.markNotificationAsRead(req, res);
			});
        this.router.delete('/:notificationID', this.requireAuth, [this.notificationCheck], this.verifyErrors, // Route to delete a notification.
			upload.none(),
			(req: express.Request, res: express.Response) => {
				this.deleteNotification(req, res);
			});
    }

	async getNotifications(req: express.Request, res: express.Response) {
        try {
            const sessiondata = req.session;
            const result = await userNotifications(sessiondata.userID);
            res.status(200).json(result);
        } catch (err) {
            console.log("There was an error: ", err);
			res.status(500).json({ success: false, error: "Internal server error."});
        }
	}

    // everyone is able to modify notification atm
    async markNotificationAsRead(req: express.Request, res: express.Response) {
        try {
            const notification = req.body.notification;
            notification.status = 'seen';
            await notification.save();
            res.status(200).json({ success: true, message: 'The notification was marked as seen.' });
        } catch (err) {
            console.log("There was an error: ", err);
			res.status(500).json({ success: false, error: "Internal server error."});
        }
    }

    async deleteNotification(req: express.Request, res: express.Response) {
        try {
            const result = req.body.notification;
            await result.destroy();
            res.status(200).json({ success: true, message: 'The notification has been deleted.'});
        } catch (err) {
            console.log("There was an error: ", err);
			res.status(500).json({ success: false, error: "Internal server error."});
        }
    }

    async notificationCheck(req: express.Request, res: express.Response, next) {
        try {
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
        } catch (err) {
            console.log("There was an error: ", err);
			res.status(500).json({ success: false, error: "Internal server error."});
        }
    }
}
