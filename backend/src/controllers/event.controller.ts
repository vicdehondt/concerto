import * as express from 'express';
import { BaseController } from './base.controller';
import * as database from '../models/Eventmodel';
import {body, validationResult} from "express-validator"
import {createMulter} from "./multerConfig";
import { getCorsConfiguration } from './corsConfig';
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
		this.router.get('/:id', cors, (req: express.Request, res: express.Response) => {
			res.set('Access-Control-Allow-Credentials', 'true');
			this.getEvent(req, res);
		});
		this.router.post("/", cors,
			upload.fields([{ name: 'banner', maxCount: 1}, { name: 'eventpicture', maxCount: 1}]),
			[
				body("title").trim().trim().notEmpty(),
				body("description").trim().notEmpty(),
				body("price").trim().notEmpty(),
				body("datetime").trim().notEmpty(),
			],
			(req: express.Request, res: express.Response) => {
				res.set('Access-Control-Allow-Credentials', 'true');
				this.addPost(req, res);
			});

		this.router.get("/filter",
		upload.none(), [
			body("maxpeople").trim().custom(async value => {
				if(value){
					const rangeValues = value.split('/');
                	if (rangeValues.length != 2 || Number.isInteger(rangeValues[0]) || Number.isInteger(rangeValues[1])) {
                    	throw Error('Invalid range format. Use two integers separated by a hyphen.');
                	}
				}
			}),
			body("price").trim().custom(async value => {
				if(value){
					const rangeValues = value.split('/');
                	if (rangeValues.length != 2 || Number.isInteger(rangeValues[0]) || Number.isInteger(rangeValues[1])) {
                    	throw Error('Invalid range format. Use two integers separated by a hyphen.');
                	}
				}
			}),
		],
		(req: express.Request, res: express.Response) => {
			this.filterEvents(req, res);
		})
		this.router.get("/search", 
		upload.none(),
		(req: express.Request, res: express.Response) => {
			this.searchEvents(req, res);
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
		const eventpictures = req.files['eventpicture']
		if (result.isEmpty() && bannerpictures && eventpictures) {
			const {title, eventid, description, datetime, price} = req.body;
			const bannerpath = "http://localhost:8080/events/" + bannerpictures[0].filename;
			const picturepath = "http://localhost:8080/events/" + eventpictures[0].filename;
			database.CreateEvent(title, description, datetime, price, bannerpath, picturepath);
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

	//expand with an optional limitator so if no filters are selected you only get for example the first 10 events
	async filterEvents(req: express.Request, res: express.Response): Promise<void>{
		console.log("Received post request to filter events");
		const filters = req.body;
		let filterfields: any[] = [];
		let filtervalues: any[] = [];
		if (filters.length === 0){
			res.status(404).json({succes: false, error: "No filters were activated"})
		} else{
			if(req.body.maxpeople){
				filterfields.push("maxpeople");
				filtervalues.push(req.body.maxpeople);
			}
			if(req.body.datetime){
				filterfields.push("datetime");
				filtervalues.push(req.body.datetime);
			}
			if(req.body.price){
				filterfields.push("price");
				filtervalues.push(req.body.price);
			}
			const events = await database.FilterEvents(filterfields, filtervalues);//gives the events that match the given filters
			if(events){
				res.status(200).json(events); //succes
			}else{
				res.status(400).json({succes: false, error: events});// something went wrong while retrieving the events
			}
		}
	}

	async searchEvents(req: express.Request, res: express.Response): Promise<void> {
		console.log("Accepted the incoming search request");
		const searchValue = req.query.searchvalue;
		if (searchValue) {
			const events = await database.SearchEvents(searchValue);
			if (events) {
				res.status(200).json(events);
			} else {
				res.status(404).json({succes: false, error: "No event was found with this search value"})
			}
		} else {
			res.status(400).json({succes: false, error: "No search value was provided!" });
		}
	}

}
