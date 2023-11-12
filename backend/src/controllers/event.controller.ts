import * as express from 'express';
import { BaseController } from './base.controller';
import * as database from '../models/Eventmodel';
import {body, validationResult} from "express-validator"
import * as multer from "multer";
const fs = require('fs');

const cors = require("cors");

const upload = multer({ dest: "./src/uploads/"});

export class EventController extends BaseController {

    constructor() {
        super("/event");
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
			this.router.get("/retrieve", cors(corsOptions), (req: express.Request, res: express.Response) => {
				this.retrieveGet(req, res);
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
			const imagepath = "http://localhost:8080/src/uploads" + req.file.filename;
			database.CreateEvent(eventid, title, description, maxpeople, datetime, price, imagepath);
			res.status(200).json({ success: true, message: 'Event created successfully' });
		} else {
			// console.log("Validation failed:", result.array());
			res.status(400).json({succes: false, errors: result.array()});
		}
	}
}
