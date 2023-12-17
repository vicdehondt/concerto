import * as express from 'express';
import { BaseController } from './base.controller';
import * as database from '../models/Eventmodel';
import * as userdatabase from '../models/Usermodel';
import {body, param} from "express-validator"
import {createMulter} from "../configs/multerConfig";
import { Op } from 'sequelize';

const eventImagePath = './public/events';

const upload = createMulter(eventImagePath);

export class SearchController extends BaseController {

	constructor() {
		super("/search");
	}

	initializeRoutes(): void {
		this.router.get('/events/filter',
			upload.none(), [
				// body("maxpeople").trim().custom(async value => {
				// 	if(value){
				// 		const rangeValues = value.split('/');
				// 		if (rangeValues.length != 2 || Number.isInteger(rangeValues[0]) || Number.isInteger(rangeValues[1])) {
				// 			throw Error('Invalid range format. Use two integers separated by a hyphen.');
				// 		}
				// 	}
				// }),
				body("price").trim().custom(async value => {
					if(value){
						const rangeValues = value.split('/');
						if (rangeValues.length != 2 || Number.isInteger(rangeValues[0]) || Number.isInteger(rangeValues[1])) {
							throw Error('Invalid range format. Use two integers separated by a hyphen.');
						}
					}
				}),
			],
			(req: express.Request, res: express.Response) => {
				this.filterEvents(req, res);
			});
		this.router.get('/users',
			upload.none(), this.verifyErrors,
			(req: express.Request, res: express.Response) => {
				console.log("search request");
				res.set('Access-Control-Allow-Credentials', 'true');
				this.searchUsers(req, res);
			});
		this.router.get('/events',
			upload.none(),
			(req: express.Request, res: express.Response) => {
				console.log("search request");
				res.set('Access-Control-Allow-Credentials', 'true');
				this.searchEvents(req, res);
			});
    }

	//expand with an optional limitator so if no filters are selected you only get for example the first 10 events
	async filterEvents(req: express.Request, res: express.Response): Promise<void>{
		console.log("Received post request to filter events");
		const limit = req.query.limit;
		const offset = req.query.offset;
		const lol = req.query;
		if (lol.length === 0){
			res.status(404).json({succes: false, error: "No filters were activated."})
		} else{
			const filters = database.extractFilters(req);
			const events = await database.FilterEvents(filters[0], filters[1], limit, offset);//gives the events that match the given filters
			if(events){
				res.status(200).json(events);
			}else{
				res.status(400).json({succes: false, error: events});// something went wrong while retrieving the events
			}
		}
	}

	async searchUsers(req: express.Request, res: express.Response): Promise<void> {
		console.log("Accepted the incoming search request for users");
		var username = req.query.username;
		var limit = req.query.limit;
		if (username == null) {
			username = "";
		}
		if (limit == null || limit > 10) {
			limit = 10;
		}
		const foundUsers = await userdatabase.UserModel.findAll({
			limit: limit,
			offset: req.query.offset,
			attributes: ['username', 'userID', 'image'],
			where: {
				username: {
					[Op.like]:  '%' + username + '%',
				}
			}
		});
		res.status(200).json(foundUsers);
	}

	async searchEvents(req: express.Request, res: express.Response): Promise<void> {
		console.log("Accepted the incoming search request");
		const searchValue = req.query.title;
		const limit = req.query.limit;
		const offset = req.query.offset;
		if (searchValue) {
			const events = await database.SearchEvents(searchValue);
			if (events) {
				res.status(200).json(events);
			} else {
				res.status(404).json({succes: false, error: "No event was found with this search value."})
			}
		} else {
			res.status(400).json({succes: false, error: "No search value was provided!" });
		}
	}
}
