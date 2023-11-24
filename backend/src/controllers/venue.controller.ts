import * as express from 'express';
import { BaseController } from './base.controller';
import * as database from '../models/Venuemodel';
import {body, validationResult} from "express-validator"
import {createMulter} from "../configs/multerConfig";
import { getCorsConfiguration } from '../configs/corsConfig';

const cors = getCorsConfiguration();

export class EventController extends BaseController {

	constructor() {
		super("/venues");
	}

	initializeRoutes(): void {
		this.router.get('/', cors, (req: express.Request, res: express.Response) => {
			res.set('Access-Control-Allow-Credentials', 'true');
			this.getAllVenues(req, res);
		});
		this.router.get('/:id', cors, this.requireAuth, (req: express.Request, res: express.Response) => {
			res.set('Access-Control-Allow-Credentials', 'true');
			this.getVenue(req, res);
		});
		this.router.post("/", cors, this.requireAuth,
			[
				body("locationID").trim().trim().notEmpty(),
				body("locationName").trim().notEmpty(),
				body("longitude").trim().notEmpty(),
				body("lattitude").trim().notEmpty(),
			],
			(req: express.Request, res: express.Response) => {
				res.set('Access-Control-Allow-Credentials', 'true');
				this.addVenue(req, res);
			});
    }

    async addVenue(req: express.Request, res: express.Response): Promise<void> {
		console.log("Received post request to create venue");
		const result = validationResult(req)
		if (result.isEmpty()) {
			const {locationID, locationName, longitude, lattitude} = req.body;
			database.CreateVenue(locationID, locationName, longitude, lattitude);
			console.log("Venue created succesfully");
			res.status(200).json({ success: true, message: 'Venue created successfully' });
		} else {
			res.status(400).json({success: false, errors: result.array()});
		}
	}

	async getAllVenues(req: express.Request, res: express.Response) {
		console.log("Accepted request for all venues")
		const venues = await database.RetrieveAllVenues();
		res.status(200).json(venues);
	}

	async getVenue(req: express.Request, res: express.Response): Promise<void> {
		console.log("Accepted the incoming retrieve request");
		const id = req.params.id;
		console.log("An ID has been found: ", id);
		const venue = await database.RetrieveVenue(id);
		if (venue) {
			res.status(200).json(venue);
		} else {
			res.status(404).json({succes: false, error: "No venue was found with this ID"})
		}
	}
}
