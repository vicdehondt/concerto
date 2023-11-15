import * as express from 'express';
import { BaseController } from './base.controller';
import * as database from '../models/Usermodel';
import {body, validationResult} from "express-validator"
import * as multer from "multer";
import * as bcrypt from "bcrypt";
const fs = require('fs');

const UserImagePath = './public/users';

// Set up storage with a custom filename function
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
	  // Specify the destination folder where the file will be saved
	  cb(null, UserImagePath);
	},
	filename: function (req, file, cb) {
	  // Customize the filename here
	  const originalname = file.originalname;
	  const parts = originalname.split(".");
	  const random = crypto.randomUUID(); // Create unique identifier for each image
	  const newname = random + "." + parts[parts.length - 1];
	  cb(null, newname);
	}
  });

const upload = multer({ storage: storage });

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
