import * as express from 'express';
import { BaseController } from './base.controller';
import * as database from '../Eventmodel';
import {body, validationResult} from "express-validator"
import { error } from 'console';
const fs = require('fs');

export class EventController extends BaseController {

    constructor() {
        super("/event");
    }

    initializeRoutes(): void {
		this.router.get("/retrieve", (req: express.Request, res: express.Response) => {
			this.retrieveGet(req, res);
		});
		this.router.post("/add", [
			body("eventid").notEmpty(),
			body("title").notEmpty().isString(),
			body("description").notEmpty(),
			body("maxpeople").notEmpty(),
			body("price").notEmpty(),
			body("image").notEmpty(),
			body("datetime").notEmpty()
		], (req: express.Request, res: express.Response) => {
			this.addPost(req, res);
		});
    }

	async retrieveGet(req: express.Request, res: express.Response): Promise<void> {
		console.log("Accepted the incoming retrieve request");
		const id = req.query.id;
		if (id) {
			console.log("An ID has been found: ", id);
			const event = await database.RetrieveEvent(id);
			res.status(200).json(event);
		} else {
			res.status(404).json({ error: 'Event not found' });
		}
	}

	IsValidEventAddPost(req: express.Request): boolean {
		const b = req.body;
		console.log(b);
		if (b &&
			b.title &&
			b.eventid &&
			b.description &&
			b.maxpeople &&
			b.datetime &&
			b.price &&
			b.image) {return true }
			else {return false}
	}

	async addPost(req: express.Request, res: express.Response): Promise<void> {
		console.log("Received post request to create event");
		const result = validationResult(req)
		if (result.isEmpty()) {
			const {title, eventid, description, maxpeople, datetime, image, price} = req.body;
			const imageBuffer = fs.readFileSync(image);
			database.CreateEvent(eventid, title, description, maxpeople, datetime, price, imageBuffer);
			res.status(200).json({ success: true, message: 'Event created successfully' });
		} else {
			console.log("Validation failed:", result.array());
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
