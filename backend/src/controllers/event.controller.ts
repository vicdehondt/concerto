import * as express from 'express';
import { BaseController } from './base.controller';
import * as database from '../models/Eventmodel';
import {body, validationResult} from "express-validator"
import * as multer from "multer";
import * as crypto from "crypto"
const fs = require('fs');

// Set up storage with a custom filename function
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
	  // Specify the destination folder where the file will be saved
	  cb(null, './uploads');
	},
	filename: function (req, file, cb) {
	  // Customize the filename here
	  const originalname = file.originalname;
	  const random = crypto.randomBytes(20).toString('hex');
	  const newname = random + originalname;
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
		upload.single("image"),
		(req: express.Request, res: express.Response) => {
			this.addPost(req, res);
		});
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
		if (result.isEmpty()) {
			const {title, eventid, description, maxpeople, datetime, price} = req.body;
			console.log(req.file)
			const imagepath = "http://localhost:8080/" + req.file.filename;
			database.CreateEvent(eventid, title, description, maxpeople, datetime, price, imagepath);
			res.status(200).json({ success: true, message: 'Event created successfully' });
		} else {
			// console.log("Validation failed:", result.array());
			res.status(400).json({succes: false, errors: result.array()});
		}
	}
}
