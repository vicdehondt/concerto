import * as express from 'express';
import { BaseController } from './base.controller';
import * as database from '../models/Eventmodel';
import * as userdatabase from '../models/Usermodel';
import { userCheckIn, userCheckOut, allCheckedInUsers, retrieveCheckIn } from  '../models/Checkinmodel';
import { NotificationObject, createNewNotification } from '../models/Notificationmodel';
import {body, validationResult} from "express-validator"
import {createMulter} from "../configs/multerConfig";
import { getCorsConfiguration } from '../configs/corsConfig';

const eventImagePath = './public/events';

const cors = getCorsConfiguration();

const upload = createMulter(eventImagePath);

export class EventController extends BaseController {

	constructor() {
		super("/events");
	}

	initializeRoutes(): void {
		this.router.get('/', cors, (req: express.Request, res: express.Response) => {
			res.set('Access-Control-Allow-Credentials', 'true');
			this.getAllEvents(req, res);
		});
		this.router.post("/", cors,
			upload.fields([{ name: 'banner', maxCount: 1}, { name: 'eventPicture', maxCount: 1}]),
			[
				body("title").trim().notEmpty(),
				body("description").trim().notEmpty(),
				body("main").trim().notEmpty(),
				body("doors").trim().notEmpty(),
				body("price").trim().notEmpty(),
				body("price").trim().notEmpty(),
				body("dateAndTime").trim().notEmpty(),
			],
			(req: express.Request, res: express.Response) => {
				res.set('Access-Control-Allow-Credentials', 'true');
				this.addPost(req, res);
		});
		this.router.get('/:id', cors, this.requireAuth, (req: express.Request, res: express.Response) => {
			res.set('Access-Control-Allow-Credentials', 'true');
			this.getEvent(req, res);
		});
		this.router.get('/:id/checkins', cors, this.requireAuth, (req: express.Request, res: express.Response) => {
			res.set('Access-Control-Allow-Credentials', 'true');
			this.allCheckedIn(req, res);
		});
		this.router.post('/:id/invite', cors, this.requireAuth, (req: express.Request, res: express.Response) => {
			res.set('Access-Control-Allow-Credentials', 'true');
			this.inviteFriend(req, res);
		});
		this.router.post('/:id/checkins', cors, this.requireAuth, (req: express.Request, res: express.Response) => {
			res.set('Access-Control-Allow-Credentials', 'true');
			this.checkIn(req, res);
		});
		this.router.delete('/:id/checkins', cors, this.requireAuth, (req: express.Request, res: express.Response) => {
			res.set('Access-Control-Allow-Credentials', 'true');
			this.checkOut(req, res);
		});
    }

	async inviteFriend(req: express.Request, res: express.Response) {
		console.log("Received request to invite friend");
		const inviterID = req.session.userID;
		const receiverID = req.body.userID;
		const eventID = req.params.id;
		console.log(receiverID);
		const event = await database.EventModel.findByPk(eventID);
		if (event != null) {
			if (await retrieveCheckIn(receiverID, event) == null) {
				const object = await NotificationObject.create({
					notificationType: 'eventInviteReceived',
                	actor: inviterID,
					typeID: eventID,
				});
				await createNewNotification(object.ID, receiverID);
				res.status(200).json({ success: true, message: "Invite of event has been sent to user"});
			} else {
				res.status(200).json({ success: false, error: "This user is already checked in for this event"});
			}
		} else {
			res.status(400).json({ success: false, error: "The event was not found"});
		}
	}

	async getAllEvents(req: express.Request, res: express.Response) {
		console.log("Accepted request for all events")
		const events = await database.RetrieveAllEvents();
		res.status(200).json(events);
	}

	async getEvent(req: express.Request, res: express.Response): Promise<void> {
		console.log("Accepted the incoming retrieve request");
		const id = req.params.id;
		console.log("An ID has been found: ", id);
		const event = await database.RetrieveEvent(id);
		if (event) {
			res.status(200).json(event);
		} else {
			res.status(404).json({succes: false, error: "No event was found with this ID"})
		}
	}

	async addPost(req: express.Request, res: express.Response): Promise<void> {
		console.log("Received post request to create event");
		const result = validationResult(req);
		const bannerpictures = req.files['banner']
		const eventPictures = req.files['eventPicture']
		if (result.isEmpty() && bannerpictures && eventPictures) {
			const {title, description, dateAndTime, price, doors, main, support} = req.body;
			const bannerPath = "http://localhost:8080/events/" + bannerpictures[0].filename;
			const eventPicturePath = "http://localhost:8080/events/" + eventPictures[0].filename;
			database.CreateEvent(title, description, dateAndTime, price, doors, main, support, bannerPath, eventPicturePath);
			console.log("Event created succesfully");
			res.status(200).json({ success: true, message: 'Event created successfully' });
		} else {
			if (bannerpictures) {
				this.DeleteFile(eventImagePath, bannerpictures[0]);
			} if (eventPictures) {
				this.DeleteFile(eventImagePath, eventPictures[0]);
			}
			res.status(400).json({success: false, errors: result.array()});
		}
	}

	async checkIn(req: express.Request, res: express.Response) {
		console.log("Received request to check in for event");
		const sessiondata = req.session;
		const eventid = req.params.id;
		const event = await database.RetrieveEvent(eventid);
		if (event != null) {
			const result = await userCheckIn(sessiondata.userID, event);
			if (result) {
				res.status(200).json({ success: true, message: "Succesfully registered for event"});
			} else {
				res.status(400).json({ success: false, error: "Already registered for this event"});
			}
		} else {
			res.status(400).json({ success: false, error: "The event was not found"});
		}
	}

	async checkOut(req: express.Request, res: express.Response) {
		console.log("Received request to check out for event");
		const sessiondata = req.session;
		const eventid = req.params.id;
		const event = await database.RetrieveEvent(eventid);
		if (event != null) {
			const result = await userCheckOut(sessiondata.userID, event);
			if (result) {
				res.status(200).json({ success: true, message: "Succesfully checked out for event"});
			} else {
				res.status(400).json({ success: false, error: "Unable to check out: You were not checked in for this event"});
			}
		} else {
			res.status(400).json({ success: false, error: "The event was not found"});
		}
	}

	async allCheckedIn(req: express.Request, res: express.Response) {
		console.log("Received request to get all checked in users");
		const eventid = req.params.id;
		const event = await database.RetrieveEvent(eventid);
		if (event != null) {
			const result = await allCheckedInUsers(eventid);
			res.status(200).json(result);
		} else {
			res.status(400).json({ success: false, error: "The event was not found"});
		}
	}
}
