import * as express from 'express';
import { BaseController } from './base.controller';
import * as database from '../models/Venuemodel';
import {body, param, validationResult} from "express-validator"
import {createMulter} from "../configs/multerConfig";
import { getCorsConfiguration } from '../configs/corsConfig';
import { CreateVenue, retrieveVenue, VenueModel } from '../models/Venuemodel';
import { retrieveCheckIn } from '../models/Checkinmodel';
import { RetrieveEvent } from '../models/Eventmodel';
import { Rating, Review, createReview } from '../models/Ratingmodel';

const axios = require('axios');
const eventImagePath = './public/venues';
const cors = getCorsConfiguration();
const upload = createMulter(eventImagePath);


export class VenueController extends BaseController {

    lastRequest = new Date();
    timeTreshold = 1000; // Musicbrainz API has limit of maximum 1 request per second


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
        this.router.get('/:venueID', cors, upload.none(), (req: express.Request, res: express.Response) => {
			res.set('Access-Control-Allow-Credentials', 'true');
			this.getVenue(req, res);
		});
		this.router.get('/', cors, upload.none(), (req: express.Request, res: express.Response) => {
			res.set('Access-Control-Allow-Credentials', 'true');
			this.getAllVenues(req, res);
		});
        this.router.get('/:venueID/reviews', cors, upload.none(),
        [
            param("venueID").custom(async (value, { req }) => {
                const venue = await retrieveVenue(value);
                if (venue != null) {
                    req.body.venue = venue;
                } else {
                    throw new Error("The venue was not found!");
                }
            }),
        ],
            (req: express.Request, res: express.Response) => {
                res.set('Access-Control-Allow-Credentials', 'true');
                this.getReviews(req, res);
            });
        this.router.post('/:venueID/reviews', cors, upload.none(),
            [
                body("eventID").trim().notEmpty().custom(async (value, {req}) => {
                    const event = await RetrieveEvent(value)
                    if (event != null) {
                        req.body.event = event;
                    } else {
                        throw new Error("This event does not exist");
                    }
                }),
                param("venueID").custom(async (value, { req }) => {
                    const venue = await retrieveVenue(value);
                    if (venue != null) {
                        req.body.venue = venue;
                    } else {
                        throw new Error("The venue was not found!");
                    }
                }),
            ],
            (req: express.Request, res: express.Response) => {
                res.set('Access-Control-Allow-Credentials', 'true');
                this.reviewVenue(req, res);
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

    async getReviews(req: express.Request, res: express.Response) {
        const result = validationResult(req);
        if (result.isEmpty()) {
            const venue = req.body.venue;
            const ratingID = venue.Rating.ratingID;
            const result = await Review.findAll({
                where: {
                    ratingID: ratingID
                }
            });
            res.status(200).json(result);
        } else {
            res.status(400).json({success: false, errors: result.array()});
        }
    }

    async reviewVenue(req: express.Request, res: express.Response) {
        const result = validationResult(req);
        if (result.isEmpty()) {
            const venue = req.body.venue;
            const sessiondata = req.session;
            const {message, score, event} = req.body;
            const checkedin = await retrieveCheckIn(sessiondata.userID, event);
            if (checkedin == null) {
                res.status(400).json({ success: false, error: "Not allowed to review this event"});
            } else {
                const rating = venue.Rating;
                const result = await createReview(sessiondata.userID, rating, event.eventID, score, message);
                if (result) {
                    res.status(200).json({ success: true, message: "Created a review for this venue"});
                } else {
                    res.status(400).json({ success: false, error: "Already reviewed this venue for this event"});
                }
            }
        } else {
            res.status(400).json({success: false, errors: result.array()});
        }
    }
}
