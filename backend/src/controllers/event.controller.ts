import * as express from 'express';
import { BaseController } from './base.controller';
import * as database from '../models/Eventmodel';
import * as userdatabase from '../models/Usermodel';
import { userCheckIn, userCheckOut, allCheckedInUsers } from  '../models/Checkinmodel'
import {body, validationResult} from "express-validator"
import {createMulter} from "../configs/multerConfig";
import { getCorsConfiguration } from '../configs/corsConfig';
import * as crypto from "crypto"

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
				body("title").trim().trim().notEmpty(),
				body("description").trim().notEmpty(),
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
		this.router.get('/:id/checkin', cors, this.requireAuth, (req: express.Request, res: express.Response) => {
			res.set('Access-Control-Allow-Credentials', 'true');
			this.allCheckedIn(req, res);
		});
		this.router.post('/:id/checkin', cors, this.requireAuth, (req: express.Request, res: express.Response) => {
			res.set('Access-Control-Allow-Credentials', 'true');
			this.checkIn(req, res);
		});
		this.router.delete('/:id/checkin', cors, this.requireAuth, (req: express.Request, res: express.Response) => {
			res.set('Access-Control-Allow-Credentials', 'true');
			this.checkOut(req, res);
		});
		this.router.get("/filter", cors,
			upload.none(),
			(req: express.Request, res: express.Response) => {
				res.set('Access-Control-Allow-Credentials', 'true');
				this.filterEvents(req, res);
			});
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
		const result = validationResult(req)
		const bannerpictures = req.files['banner']
		const eventpictures = req.files['eventPicture']
		if (result.isEmpty() && bannerpictures && eventpictures) {
			const {title, eventid, description, dateAndTime, price} = req.body;
			const bannerpath = "http://localhost:8080/events/" + bannerpictures[0].filename;
			const picturepath = "http://localhost:8080/events/" + eventpictures[0].filename;
			database.CreateEvent(title, description, dateAndTime, price, bannerpath, picturepath);
			console.log("Event created succesfully");
			res.status(200).json({ success: true, message: 'Event created successfully' });
		} else {
			if (bannerpictures) {
				this.DeleteFile(eventImagePath, bannerpictures[0]);
			}
			if (eventpictures) {
				this.DeleteFile(eventImagePath, eventpictures[0]);
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
			const result = await userCheckIn(sessiondata.userID, eventid);
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
			const result = await userCheckOut(sessiondata.userID, eventid);
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

	//expand with an optional limitator so if no filters are selected you only get for example the first 10 events
	async filterEvents(req: express.Request, res: express.Response): Promise<void>{
		console.log("Received post request to filter events");
		const filters = req.body;
		if (filters.length === 0){
			res.status(404).json({succes: false, error: "No filters were activated"})
		} else{
			const events = await database.FilterEvents(filters.maxpeople, filters.datetime, filters.price);//gives the events that match the given filters
			if(events){
				res.status(200).json(events); //succes
			}else{
				res.status(400).json({succes: false, error: events});// something went wrong while retrieving the events
			}
		}
	}
}
