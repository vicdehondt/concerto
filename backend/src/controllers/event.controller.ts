import * as express from 'express';
import { BaseController } from './base.controller';
import * as database from '../Eventmodel';
const fs = require('fs');

export class EventController extends BaseController {

    constructor() {
        super("/event");
    }

    initializeRoutes(): void {
		this.router.get("/retrieve", (req: express.Request, res: express.Response) => {
			this.retrieveGet(req, res);
		});
		this.router.post("/add", (req: express.Request, res: express.Response) => {
			this.addPost(req, res);
		});
    }

	async retrieveGet(req: express.Request, res: express.Response): Promise<void> {
		console.log("Accepted the incoming retrieve request");
		const id = req.query.id;
		if (id) {
			console.log("An ID has been found: ", id);
			const event = await database.RetrieveEvent(id);
			res.json(event);
		} else {
			res.status(404).json({ error: 'Event not found' });
		}
	} 

	// Temporary way to deal with images
	imageFilePath = './src/eventimages/ariana.jpeg';
	imageBuffer = fs.readFileSync(this.imageFilePath);

	async addPost(req: express.Request, res: express.Response): Promise<void> {
		console.log("Received post request to create event");
		const id = req.query.id;
		const title = req.query.title;
		const description = req.query.description;
		const maxPeople = req.query.maxpeople;
		const datetime = req.query.datetime;
		const price = req.query.price;
		if (id && title && description && maxPeople && datetime && price) {
			database.CreateEvent(id, title, description, maxPeople, datetime, price, this.imageBuffer);
		} else {
			res.status(404).json({ error: 'Unable to add event to database!' });
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
