import * as express from 'express';
import { BaseController } from './base.controller';
import {body, validationResult} from "express-validator"
import {createMulter} from "../configs/multerConfig";
import { getCorsConfiguration } from '../configs/corsConfig';
import { CreateArtist, Artist } from '../models/Eventmodel';

const eventImagePath = './public/artists';

const cors = getCorsConfiguration();

const upload = createMulter(eventImagePath);

export class ArtistController extends BaseController {

	constructor() {
		super("/artists");
	}

	initializeRoutes(): void {
		this.router.post('/', cors, upload.single('artistPicture'),
            [body("artistName").trim().notEmpty()],
            (req: express.Request, res: express.Response) => {
                res.set('Access-Control-Allow-Credentials', 'true');
                this.addArtist(req, res);
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
    async addArtist(req: express.Request, res: express.Response) {
        console.log("Received post request to create an artist");
        const result = validationResult(req);
        const image = req.file;
        if (result.isEmpty() && image) {
            const imagepath = "http://localhost:8080/artists/" + image.filename;
            CreateArtist(req.body.artistName, imagepath);
            res.status(200).json({ success: true, message: 'Artist created successfully'});
        } else {
			if (image) {
				this.DeleteFile(eventImagePath, image);
			}
			res.status(400).json({success: false, errors: result.array()});
		}
    }
}
