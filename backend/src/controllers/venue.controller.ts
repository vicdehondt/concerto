import * as express from 'express';
import { BaseController } from './base.controller';
import * as database from '../models/Venuemodel';
import {body, validationResult} from "express-validator"
import {createMulter} from "../configs/multerConfig";
import { getCorsConfiguration } from '../configs/corsConfig';
import { CreateVenue, retrieveVenue, VenueModel } from '../models/Venuemodel';

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

    async delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async initialize(){
        console.log("Adding all venues of Brussels")
        const limit = 100;
        for(let offset = 0; true ;offset += limit){
            const musicBrainzApiUrl = `http://musicbrainz.org/ws/2/place?query='Brussels'&offset=${offset}&limit=${limit}`;
            this.lastRequest = new Date();
            const response = await axios.get(musicBrainzApiUrl);
            const data = await response.data
            const places = data.places;
            if (places.length == 0) {
                console.log("no places left")
                break;
            }
            const venuesInBrussels = places.filter(place => place.type === 'Venue' || place.type == 'Indoor arena' || place.type == 'Stadium');
            //console.log(venuesInBrussels);
            for (let i = 0; i < venuesInBrussels.length; i++) {
                if (venuesInBrussels[i].coordinates !== undefined){
                    //console.log(venuesInBrussels[i].name);
                    //console.log(venuesInBrussels[i].id);
                    const venue = await retrieveVenue(venuesInBrussels[i].id);
                    if(venue == null) {
                        await CreateVenue(venuesInBrussels[i].id, venuesInBrussels[i].name, venuesInBrussels[i].coordinates.longitude, venuesInBrussels[i].coordinates.latitude);
                    }
                }
            }
            await this.delay(1000);
        }
    }

	initializeRoutes(): void {
        this.initialize();
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
        const venue = await retrieveVenue(req.params.venueID);
        if (venue) {
           res.status(200).json(venue);
        } else {
            res.status(404).json({succes: false, error: "No venue was found with this ID"})
        }
    }
}
