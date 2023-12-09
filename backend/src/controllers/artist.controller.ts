import * as express from 'express';
import { BaseController } from './base.controller';
import {body, validationResult} from "express-validator"
import {createMulter} from "../configs/multerConfig";
import { Artist, EventModel, retrieveArtist, createArtist, RetrieveEvent } from '../models/Eventmodel';
import { Rating, Review, createReview } from '../models/Ratingmodel';
import { retrieveCheckIn } from '../models/Checkinmodel';

const eventImagePath = './public/artists';

const upload = createMulter(eventImagePath);

export class ArtistController extends BaseController {

	constructor() {
		super("/artists");
	}

	initializeRoutes(): void {
        this.router.get('/:artistID', upload.none(),
            (req: express.Request, res: express.Response) => {
                res.set('Access-Control-Allow-Credentials', 'true');
                this.getArtist(req, res);
            });
        this.router.get('/:artistID/reviews', upload.none(),
            (req: express.Request, res: express.Response) => {
                res.set('Access-Control-Allow-Credentials', 'true');
                this.getReviews(req, res);
            });
        this.router.post('/:artistID/reviews', this.requireAuth, upload.none(),
        [
            body("eventID").trim().notEmpty().custom(async (value, {req}) => {
                const event = await RetrieveEvent(value)
                if (event != null) {
                    req.body.event = event;
                } else {
                    throw new Error("This event does not exist");
                }
            }),
        ],
            (req: express.Request, res: express.Response) => {
                res.set('Access-Control-Allow-Credentials', 'true');
                this.reviewArtist(req, res);
            });
        this.router.get('/', upload.none(),
            (req: express.Request, res: express.Response) => {
                res.set('Access-Control-Allow-Credentials', 'true');
                this.getAllArtists(req, res);
            });
    }

    async getReviews(req: express.Request, res: express.Response) {
        const artistID = req.params.artistID;
        const artist = await retrieveArtist(artistID);
        if (artist != null) {
            const ratingID = artist.Rating.ratingID;
            const result = await Review.findAll({
                where: {
                    ratingID: ratingID
                }
            });
            res.status(200).json(result);
        } else {
            res.status(400).json({ success: false, error: "Artist not found in database"});
        }
    }

    async reviewArtist(req: express.Request, res: express.Response) {
        const sessiondata = req.session;
        const artistID = req.params.artistID;
        const artist = await retrieveArtist(artistID)
        if (artist != null) {
            const {message, score, event} = req.body;
            const checkedin = await retrieveCheckIn(sessiondata.userID, event);
            if (checkedin == null) {
                res.status(400).json({ success: false, error: "Not allowed to review this event"});
            } else {
                try {
                    const rating = artist.Rating;
                    const result = await createReview(sessiondata.userID, rating, event.eventID, score, message);
                    if (result) {
                        res.status(200).json({ success: true, message: "Created a review for this artist"});
                    } else {
                        res.status(400).json({ success: false, error: "Already reviewed this artist for this event"});
                    }
                } catch (error) {
                    res.status(400).json({success: false, error: "You are not allowed to review this event"});
                }
            }
    } else {
            res.status(400).json({ success: false, error: "Artist not found in database"});
        }
    }

    async getAllArtists(req: express.Request, res: express.Response) {
        console.log("Accepted request for all artists")
		const artists = await Artist.findAll({
            attributes: {
                exclude: ['createdAt', 'updatedAt'],
          }});
		res.status(200).json(artists);
    }

    async getArtist(req: express.Request, res: express.Response) {
        console.log("Received request to lookup artist information");
        const artist = await retrieveArtist(req.params.artistID);
        if (artist != null) {
           res.status(200).json(artist);
        } else {
            if (await createArtist(req.params.artistID)) {
                const result = await retrieveArtist(req.params.artistID);
                res.status(200).json(result);
            } else {
                res.status(400).json({ success: false, error: "There was an error adding an artist"});
            }
        }
    }
}
