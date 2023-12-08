import * as express from 'express';
import { RetrieveUser } from '../models/Usermodel';
import { validationResult } from 'express-validator';
const fs = require('fs');

export abstract class BaseController {
    router = express.Router();
    path = "/";

    constructor(path: string) {
        this.path = path;
        this.initializeRoutes();
    }

    abstract initializeRoutes();

    requireAuth(req, res, next) {
		if (req.session && (req.session.userID != null)){
			next()
		} else {
			res.status(401).json({ error: "Unauthorized access" });
		}
	}

    async checkUserExists(req: express.Request, res: express.Response, next) {
		const userid = req.params.userid;
		const user = await RetrieveUser('userID', userid);
		if (user != null) {
			req.body.user = user;
			next();
		} else {
			res.status(400).json({ error: `The user with userID ${ userid } is not found`});
		}
	}

    verifyErrors(req: express.Request, res: express.Response, next) {
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            next();
        } else {
            res.status(400).json({success: false, errors: errors.array()});
        }
    }

    // It is important for this function that BaseController is in the same directory as the other controllers.
    DeleteFile(path: String, file) {
        fs.unlink(path + '/' + file.filename, (err) => {
            if (err) {
                throw err;
            } console.log("File deleted succesfully.");
        })
    }
}
