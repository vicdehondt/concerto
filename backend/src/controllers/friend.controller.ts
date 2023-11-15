import * as express from 'express';
import { BaseController } from './base.controller';
import * as database from '../models/Usermodel';
import {body, validationResult} from "express-validator";
import {createMulter} from "./multiferConfig"
const fs = require('fs');

const friendFilePath = './public/friends';

const upload = createMulter(friendFilePath);

export class FriendController extends BaseController {

    constructor() {
        super("/friends");
    }

    initializeRoutes(): void {
        this.router.get("/",
        upload.single("image"), this.requireAuth,
        (req: express.Request, res: express.Response) => {
			this.getAllFriends(req, res);
		});
    }

    async getAllFriends(req: express.Request, res: express.Response){
        const sessiondata = req.session;
        const friends = await database.GetAllFriends(sessiondata.userID);
        res.status(200).json(friends);
    }
}
