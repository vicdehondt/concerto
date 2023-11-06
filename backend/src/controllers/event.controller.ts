import * as express from 'express';
import { BaseController } from './base.controller';
import * as database from '../Eventmodel';

export class EventController extends BaseController {

    constructor() {
        super("/event");
    }

    initializeRoutes(): void {
		this.router.get("/retrieve", (req: express.Request, res: express.Response) => {
			this.retrieveGet(req, res);
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
