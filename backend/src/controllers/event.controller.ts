import * as express from 'express';
import { BaseController } from './base.controller';
import * as database from '../models/Eventmodel';
import {body, validationResult} from "express-validator"
import * as multer from "multer";
import * as crypto from "crypto"
import { spliceStr } from 'sequelize/types/utils';
const fs = require('fs');

const EventImagePath = './uploads/events';

// Set up storage with a custom filename function
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
	  // Specify the destination folder where the file will be saved
	  cb(null, EventImagePath);
	},
	filename: function (req, file, cb) {
	  // Customize the filename here
	  const originalname = file.originalname;
	  const parts = originalname.split(".");
	  const random = crypto.randomUUID(); // Create unique identifier for each image
	  const newname = random + "." + parts[parts.length - 1];
	  cb(null, newname);
	}
  });

const upload = multer({ storage: storage});

export class EventController extends BaseController {

    constructor() {
        super("/event");
    }

    initializeRoutes(): void {
		this.router.get("/retrieve", (req: express.Request, res: express.Response) => {
			this.retrieveGet(req, res);
		});
		this.router.post("/add",
		upload.single("image"), [
			body("title").trim().trim().notEmpty(),
			body("description").trim().notEmpty(),
			body("maxpeople").trim().notEmpty(),
			body("price").trim().notEmpty(),
			body("datetime").trim().notEmpty(),
			body("eventid").trim().notEmpty().custom(async value => {
				const event = await database.RetrieveEvent(value);
				if (event != null) {
					throw Error("There already exists an event with that ID!");
				}
			}),
		],
		(req: express.Request, res: express.Response) => {
			this.addPost(req, res);
		});

		this.router.get("/filter",
		upload.single("image"), [
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
    }

	async retrieveGet(req: express.Request, res: express.Response): Promise<void> {
		console.log("Accepted the incoming retrieve request");
		const id = req.query.id;
		if (id) {
			console.log("An ID has been found: ", id);
			const event = await database.RetrieveEvent(id);
			if (event) {
				res.status(200).json(event);
			} else {
				res.status(404).json({succes: false, error: "No event was found with this ID"})
			}
		} else {
			res.status(400).json({succes: false, error: "No event ID was provided!" });
		}
	}

	async addPost(req: express.Request, res: express.Response): Promise<void> {
		console.log("Received post request to create event");
		const result = validationResult(req)
		if (result.isEmpty() && req.file) {
			const {title, eventid, description, maxpeople, datetime, price} = req.body;
			const imagepath = "http://localhost:8080/events/" + req.file.filename;
			database.CreateEvent(eventid, title, description, maxpeople, datetime, price, imagepath);
			console.log("Event created succesfully");
			res.status(200).json({ success: true, message: 'Event created successfully' });
		} else {
			if (req.file) {
				fs.unlink(EventImagePath + '/' + req.file.filename, (err) => {
					if (err) {
						throw err;
					} console.log("File deleted succesfully.");
				})
			}
			res.status(400).json({succes: false, errors: result.array()});
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
}
