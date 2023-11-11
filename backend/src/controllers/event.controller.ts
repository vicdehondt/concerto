import * as express from 'express';
import { BaseController } from './base.controller';
import * as database from '../Eventmodel';
import {body, validationResult} from "express-validator"
import { error } from 'console';
import * as multer from "multer";
const fs = require('fs');

const upload = multer({ dest: "./src/uploads/"});

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
			res.status(404).json({succes: false, error: "No event ID was provided!" });
		}
	}

	async addPost(req: express.Request, res: express.Response): Promise<void> {
		console.log("Received post request to create event");
		const result = validationResult(req)
		console.log(req.body)
		console.log(req.file)
		if (result.isEmpty()) {
			const {title, eventid, description, maxpeople, datetime, price} = req.body;
			const imagepath = req.file.destination + req.file.filename;
			const imageBuffer = fs.readFileSync(imagepath);
			database.CreateEvent(eventid, title, description, maxpeople, datetime, price, imageBuffer);
			res.status(200).json({ success: true, message: 'Event created successfully' });
		} else {
			// console.log("Validation failed:", result.array());
			res.status(400).json({succes: false, errors: result.array()});
		}
	}

    /**
	 * Check if a string is actually provided
	 *
	 * @param {string} param Provided string
	 * @returns {boolean} Valid or not
	 */
	private _isGiven(param: string): boolean {
		if (param == null)
			return false;
		else
			return param.trim().length > 0;
	}

    /**
	 * Check if a string is a valid email
	 *
	 * @param {string} email Email string
	 * @returns {boolean} Valid or not
	 */
	private _isEmailValid(email: string): boolean {
		const atIdx = email.indexOf("@");
		const dotIdx = email.indexOf(".");
		return atIdx != -1 && dotIdx != -1 && dotIdx > atIdx;
	}
}
