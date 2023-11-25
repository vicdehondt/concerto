import * as express from 'express';
import { BaseController } from './base.controller';
import * as database from '../models/Venuemodel';
import {body, validationResult} from "express-validator"
import {createMulter} from "../configs/multerConfig";
import { getCorsConfiguration } from '../configs/corsConfig';
import { CreateVenue, VenueModel } from '../models/Venuemodel';

const axios = require('axios');
const eventImagePath = './public/venues';
const cors = getCorsConfiguration();
const upload = createMulter(eventImagePath);


export class VenueController extends BaseController {

    lastRequest = new Date();
    timeTreshold = 1000; // Musicbrainz API has limit of maximum 1 request per second. Take 0.5s margin


	constructor() {
		super("/venues");
	}

	initializeRoutes(): void {
        this.router.get('/:venueID', cors, upload.none(), this.requireAuth, (req: express.Request, res: express.Response) => {
			res.set('Access-Control-Allow-Credentials', 'true');
			this.getVenue(req, res);
		});
		this.router.get('/', cors, upload.none(), (req: express.Request, res: express.Response) => {
			res.set('Access-Control-Allow-Credentials', 'true');
			this.getAllVenues(req, res);
		});
    }

	async getAllVenues(req: express.Request, res: express.Response) {
		console.log("Accepted request for all venues")
		const venues = await VenueModel.findAll({
            attributes:{
                exclude: ['createdAt', 'updatedAt'],
            }
        });
		res.status(200).json(venues);
	}

    async getVenue(req: express.Request, res: express.Response) {
        console.log("Received request to lookup venue information");
        const venue = await VenueModel.findByPk(req.params.artistID);
        const currentTime = new Date();
        if (venue != null) {
           res.status(200).json(venue);
        } else if ((currentTime.getTime() - this.lastRequest.getTime()) < this.timeTreshold) {
            res.status(400).json({ success: false, error: "Too many requests!"});
        }
        else {
            const musicBrainzApiUrl = `http://musicbrainz.org/ws/2/place/${req.params.venueID}`;
            this.lastRequest = new Date();
            const response = await axios.get(musicBrainzApiUrl);
            const data = await response.data
            console.log(data.id)
            console.log(data.name)
            console.log(data.coordinates.longitude)
            console.log(data.coordinates.latitude)
            const venue = await CreateVenue(data.id, data.name, data.coordinates.longitude, data.coordinates.latitude);
            res.status(200).json(data);
        }
    }
}
