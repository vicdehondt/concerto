import * as express from 'express';
import { BaseController } from './base.controller';
import * as database from '../models/Eventmodel';
import {body, validationResult} from "express-validator"
import * as multer from "multer";
import * as crypto from "crypto"

const cors = require("cors");

const EventImagePath = './public/events';

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
		super("/events");
	}

	initializeRoutes(): void {
		const environment = {
			frontendURL: "http://localhost:3000"
		}
		if (process.env.NODE_ENV == "production") {
			environment.frontendURL = "http://concerto.dehondt.dev"
		}
		const corsOptions = {
			// https://www.npmjs.com/package/cors
			"origin": environment.frontendURL,
			"methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
			"preflightContinue": false,
			"optionsSuccessStatus": 204
		}
		this.router.get('/', cors(corsOptions), (req: express.Request, res: express.Response) => {
			this.getAllEvents(req, res);
		});
		this.router.get('/:id', cors(corsOptions), (req: express.Request, res: express.Response) => {
			this.getEvent(req, res);
		});
		this.router.post("/", cors(corsOptions),
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

		this.router.get("/filter", cors(corsOptions),
		upload.single("image"),
		(req: express.Request, res: express.Response) => {
			this.filterEvents(req, res);
		})
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
		if (result.isEmpty() && req.file) {
			const {title, eventid, description, maxpeople, datetime, price} = req.body;
			const imagepath = "http://localhost:8080/events/" + req.file.filename;
			database.CreateEvent(eventid, title, description, maxpeople, datetime, price, imagepath);
			console.log("Event created succesfully");
			res.status(200).json({ success: true, message: 'Event created successfully' });
		} else {
			if (req.file) {
				this.DeleteFile(EventImagePath, req.file);
			}
			res.status(400).json({success: false, errors: result.array()});
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
