import * as express from 'express';
import { BaseController } from './base.controller';
import {body, param } from "express-validator"
import {createMulter} from "../configs/multerConfig";
import { Artist, retrieveArtist, createArtist, RetrieveEvent } from '../models/Eventmodel';
import { Review, createReview } from '../models/Ratingmodel';
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
        this.router.get('/:artistID/reviews', upload.none(), [this.checkArtistExists], this.verifyErrors,
            (req: express.Request, res: express.Response) => {
                res.set('Access-Control-Allow-Credentials', 'true');
                this.getReviews(req, res);
            });
        this.router.post('/:artistID/reviews', this.requireAuth, upload.none(), [this.checkArtistExists], this.verifyErrors,
        [
            body("eventID").trim().notEmpty().custom(async (value, {req}) => {
                const event = await RetrieveEvent(value)
                if (event != null) {
                    req.body.event = event;
                } else {
                    throw new Error("This event does not exist.");
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
        const artist = req.body.artist;
        const ratingID = artist.Rating.ratingID;
        try {
            const result = await Review.findAll({
                where: {
                    ratingID: ratingID
                }
            });
            res.status(200).json(result);
        } catch (err) {
            console.log("An error occurred: ", err);
            res.status(500).json({success: false, error: "Internal server error"});
        }
    }

    async reviewArtist(req: express.Request, res: express.Response) {
        const sessiondata = req.session;
        const artist = req.body.artist;
        const {message, score, event} = req.body;
        try {
            const checkedin = await retrieveCheckIn(sessiondata.userID, event);
            if (checkedin == null) {
                res.status(400).json({ success: false, error: "Not allowed to review this event."});
            } else {
                const rating = artist.Rating;
                const result = await createReview(sessiondata.userID, rating, event.eventID, score, message);
                if (result) {
                    res.status(200).json({ success: true, message: "Created a review for this artist."});
                } else {
                    res.status(400).json({ success: false, error: "Already reviewed this artist for this event."});
                }
            }
        } catch (err) {
            console.log("An error occurred: ", err);
            res.status(500).json({success: false, error: "Internal server error"});
        }
    }

    async getAllArtists(req: express.Request, res: express.Response) {
        console.log("Accepted request for all artists")
        try {
            const artists = await Artist.findAll({
                attributes: {
                    exclude: ['createdAt', 'updatedAt'],
              }});
            res.status(200).json(artists);
        } catch (err) {
            console.log("An error occurred: ", err);
            res.status(500).json({success: false, error: "Internal server error"});
        }
    }

    async getArtist(req: express.Request, res: express.Response) {
        console.log("Received request to lookup artist information");
        try {
            const artist = await retrieveArtist(req.params.artistID);
        if (artist != null) {
           res.status(200).json(artist);
        } else {
            if (await createArtist(req.params.artistID)) {
                const result = await retrieveArtist(req.params.artistID);
                res.status(200).json(result);
            } else {
                res.status(400).json({ success: false, error: "This artist was not found in the database."});
            }
        }
        } catch (err) {
            console.log("An error occurred: ", err);
            res.status(500).json({success: false, error: "Internal server error"});
        }
    }

    async checkArtistExists(req: express.Request, res: express.Response, next) {
        await param("artistID").custom(async (artistID, { req }) => {
            const artist = await retrieveArtist(artistID);
            if (artist != null) {
                req.body.artist = artist;
                return true;
            } else {
                throw new Error("Artist with that ID does not exist.");
            }
        })(req, res, next);
    }
}
