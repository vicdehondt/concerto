import * as express from 'express';
import { BaseController } from './base.controller';
import * as database from '../models/Eventmodel';
import { userCheckIn, userCheckOut, allCheckedInUsers, retrieveCheckIn } from  '../models/Checkinmodel';
import { NotificationObject, createNewNotification } from '../models/Notificationmodel';
import { VenueModel } from '../models/Venuemodel';
import { retrieveArtist, createArtist, RetrieveEvent, isFinished } from '../models/Eventmodel';
import {body, param, validationResult} from "express-validator"
import {createMulter} from "../configs/multerConfig";
import { WishListedEvents } from '../models/Wishlistmodel';
import { RetrieveUser } from '../models/Usermodel';

const eventImagePath = './public/events';

const upload = createMulter(eventImagePath);

export class EventController extends BaseController {

	constructor() {
		super("/events");
	}

	initializeRoutes(): void {
		this.router.get('/', upload.none(), (req: express.Request, res: express.Response) => {
			res.set('Access-Control-Allow-Credentials', 'true');
			this.getAllEvents(req, res);
		});
		this.router.post("/",  this.requireAuth,
			upload.fields([{ name: 'banner', maxCount: 1}, { name: 'eventPicture', maxCount: 1}]),
			[	body("artistID").trim().notEmpty().custom(async value => {
				const artist = await retrieveArtist(value);
				if (artist == null) {
					const result = await createArtist(value);
					if (!result) {
						throw new Error("No artist was found with this ID.");
					} else {
						return true;
					}
			}}),
				body("venueID").trim().notEmpty().custom(async value => {
					const venue = await VenueModel.findByPk(value);
					if (venue == null) {
						throw new Error("No venue was found with this ID.");
					}
				}),
				body("title").trim().notEmpty(),
				body("description").trim().notEmpty(),
				body("main").trim().notEmpty(),
				body("doors").trim().notEmpty(),
				body("price").trim().notEmpty(),
				body("mainGenre").trim().notEmpty(),
				body("secondGenre").trim().notEmpty(),
				body("dateAndTime").trim().notEmpty(),
			],
			(req: express.Request, res: express.Response) => {
				res.set('Access-Control-Allow-Credentials', 'true');
				this.addPost(req, res);
		});
		this.router.get('/:eventID', this.requireAuth, [this.checkEventExists], this.verifyErrors, (req: express.Request, res: express.Response) => {
			res.set('Access-Control-Allow-Credentials', 'true');
			this.getEvent(req, res);
		});
		this.router.post('/:eventID', this.requireAuth,  upload.none(), [this.checkEventExists, this.checkUnfinished], this.verifyErrors, (req: express.Request, res: express.Response) => {
			res.set('Access-Control-Allow-Credentials', 'true');
			this.editEvent(req, res);
		});
		this.router.get('/:eventID/auth', this.requireAuth,  upload.none(), [this.checkEventExists, this.checkUnfinished], this.verifyErrors, (req: express.Request, res: express.Response) => {
			res.set('Access-Control-Allow-Credentials', 'true');
			this.checkEventAuth(req, res);
		});
		this.router.get('/:eventID/checkins', this.requireAuth, [this.checkEventExists], this.verifyErrors, (req: express.Request, res: express.Response) => {
			res.set('Access-Control-Allow-Credentials', 'true');
			this.allCheckedIn(req, res);
		});
		this.router.post('/:eventID/invite', upload.none(),this.requireAuth, [this.checkEventExists, this.checkFriendExists, this.checkUnfinished], this.verifyErrors, (req: express.Request, res: express.Response) => {
			res.set('Access-Control-Allow-Credentials', 'true');
			this.inviteFriend(req, res);
		});
		this.router.post('/:eventID/checkins', this.requireAuth, [this.checkEventExists], this.verifyErrors, (req: express.Request, res: express.Response) => {
			res.set('Access-Control-Allow-Credentials', 'true');
			this.checkIn(req, res);
		});
		this.router.delete('/:eventID/checkins', this.requireAuth, [this.checkEventExists, this.checkUnfinished], this.verifyErrors, (req: express.Request, res: express.Response) => {
			res.set('Access-Control-Allow-Credentials', 'true');
			this.checkOut(req, res);
		});
    }

	async checkEventAuth(req: express.Request, res: express.Response) {
		const event = req.body.event;
		const sessiondata = req.session;
		if (sessiondata.userID == event.userID) {
			res.status(200).json({ success: true, message: "Allowed to edit event."});
		} else {
			res.status(401).json({ success: false, message: "Not allowed to edit event."});
		}
	}

	async editEvent(req: express.Request, res: express.Response) {
		console.log("Received request to edit event.");
		const event = req.body.event;
		const sessiondata = req.session;
		if (event.userID != sessiondata.userID) {
			res.status(401).json({ success: true, error: "No permission to update this event."});
		} else {
			const {description, main, doors, support, price} = req.body;
			event.price = price;
			event.description = description;
			event.main = main;
			event.doors = doors;
			event.support = support;
			event.save();
			res.status(200).json({ success: true, message: "Event has been updated."});
		}
	}

	async inviteFriend(req: express.Request, res: express.Response) {
		console.log("Received request to invite friend");
		const inviterID = req.session.userID;
		const receiverID = req.body.userID;
		const event = await req.body.event;
		if (await retrieveCheckIn(receiverID, event) == null) {
			const object = await NotificationObject.create({
				notificationType: 'eventInviteReceived',
				actor: inviterID,
				typeID: event.eventID,
			});
			await createNewNotification(object.ID, receiverID);
			res.status(200).json({ success: true, message: "Invite of event has been sent to user."});
		} else {
			res.status(200).json({ success: false, error: "This user is already checked in for this event."});
		}
	}

	async getAllEvents(req: express.Request, res: express.Response) {
		console.log("Accepted request for all events");
		const limit = req.query.limit;
		console.log(limit);
		const events = await database.retrieveUnfinishedEvents(limit);
		res.status(200).json(events);
	}

	async getEvent(req: express.Request, res: express.Response): Promise<void> {
		console.log("Accepted the incoming retrieve request");
		const event = req.body.event;
		const sessiondata = req.session;
		const wishlisted = await WishListedEvents.findOne({
			where: {
				eventID: event.eventID,
				userID: sessiondata.userID,
			}
		});
		const checkedIn = await retrieveCheckIn(sessiondata.userID, event) != null;
		const eventWithWishlist = {
			...event.toJSON(),
			wishlisted: wishlisted !== null,
			checkedIn: checkedIn,
		};
		res.status(200).json(eventWithWishlist);
	}

	async addPost(req: express.Request, res: express.Response): Promise<void> {
		console.log("Received post request to create event");
		const result = validationResult(req);
		const bannerpictures = req.files['banner']
		const eventPictures = req.files['eventPicture']
		if (result.isEmpty() && bannerpictures && eventPictures) {
			const sessiondata = req.session;
			const {artistID, venueID, title, description, dateAndTime, price, doors, main, support, mainGenre, secondGenre} = req.body;
			const bannerPath = "http://localhost:8080/events/" + bannerpictures[0].filename;
			const eventPicturePath = "http://localhost:8080/events/" + eventPictures[0].filename;
			const result = await database.CreateEvent(sessiondata.userID, artistID, venueID, title, description, dateAndTime, price, doors, main, support, mainGenre, secondGenre, bannerPath, eventPicturePath);
			res.status(200).json({ success: true, eventID: result.eventID, message: 'Event created successfully.' });
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
		const event = req.body.event;
		const result = await userCheckIn(sessiondata.userID, event);
		if (result) {
			res.status(200).json({ success: true, message: "Succesfully registered for event."});
		} else {
			res.status(400).json({ success: false, error: "Already registered for this event."});
		}
	}

	async checkOut(req: express.Request, res: express.Response) {
		console.log("Received request to check out for event");
		const sessiondata = req.session;
		const event = req.body.event;
		const result = await userCheckOut(sessiondata.userID, event);
		if (result) {
			res.status(200).json({ success: true, message: "Succesfully checked out for event."});
		} else {
			res.status(400).json({ success: false, error: "Unable to check out: You were not checked in for this event."});
		}
	}

	async allCheckedIn(req: express.Request, res: express.Response) {
		console.log("Received request to get all checked in users");
		const event = req.body.event;
		const eventid = event.eventID;
		const result = await allCheckedInUsers(eventid);
		res.status(200).json(result);
	}

	async checkFriendExists(req: express.Request, res: express.Response, next) {
		await body("userID").custom(async (userID) => {
            const user = await RetrieveUser('userID', userID);
            if (user != null) {
                return true;
            } else {
                throw new Error("Friend does not exist.");
            }
        })(req, res, next);
	}

	async checkUnfinished(req: express.Request, res: express.Response, next) {
        await body("event").custom((event) => {
            if (event != null) {
				if (isFinished(event)) {
					throw new Error("This event has been finished.")
				} else {
					return true;
				}
            } else {
                return true
            }
        })(req, res, next);
    }



	async checkEventExists(req: express.Request, res: express.Response, next) {
        await param("eventID").custom(async (eventID, { req }) => {
            const event = await RetrieveEvent(eventID);
            if (event != null) {
                req.body.event = event;
                return true;
            } else {
                throw new Error("Event with that ID does not exist.");
            }
        })(req, res, next);
    }
}
