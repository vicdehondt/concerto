import * as express from 'express';
import { BaseController } from './base.controller';
import {body, validationResult} from "express-validator"
import {createMulter} from "../configs/multerConfig";
import { getCorsConfiguration } from '../configs/corsConfig';
import { CreateArtist, Artist } from '../models/Eventmodel';

const axios = require('axios');

const eventImagePath = './public/artists';

const cors = getCorsConfiguration();

const upload = createMulter(eventImagePath);

export class ArtistController extends BaseController {

    lastRequest = new Date();
    timeTreshold = 1000; // Musicbrainz API has limit of maximum 1 request per second. Take 0.5s margin

	constructor() {
		super("/artists");
	}

	initializeRoutes(): void {
        this.router.get('/:artistID', cors, upload.none(),
            (req: express.Request, res: express.Response) => {
                res.set('Access-Control-Allow-Credentials', 'true');
                this.getArtist(req, res);
            });
        this.router.get('/', cors, upload.none(),
            (req: express.Request, res: express.Response) => {
                res.set('Access-Control-Allow-Credentials', 'true');
                this.getAllArtists(req, res);
            });
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
        const artist = await Artist.findByPk(req.params.artistID);
        const currentTime = new Date();
        if (artist != null) {
           res.status(200).json(artist);
        } else if ((currentTime.getTime() - this.lastRequest.getTime()) < this.timeTreshold) {
            res.status(400).json({ success: false, error: "Too many requests!"});
        }
        else {
            const musicBrainzApiUrl = `http://musicbrainz.org/ws/2/artist/${req.params.artistID}`;
            this.lastRequest = new Date();
            const response = await axios.get(musicBrainzApiUrl);
            const data = await response.data
            const artist = await CreateArtist(data.name, data.id, data.type);
            res.status(200).json(data);
        }
    }
}
