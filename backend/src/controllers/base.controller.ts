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

    isValidTimeFormat(timeValue) {
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(timeValue);
    }

    isValidDate(value) {
        if (/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
            const date = new Date(value);
            return !isNaN(date.getTime())
        } else {
            return false;
        }
    }

    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    requireAuth(req, res, next) {
		if (req.session && (req.session.userID != null)){
			next()
		} else {
			res.status(401).json({ error: "Unauthorized access" });
		}
	}

    async checkUserExists(req: express.Request, res: express.Response, next) {
        try {
            const userid = req.params.userID;
            const user = await RetrieveUser('userID', userid);
            if (user != null) {
                req.body.user = user;
                next();
            } else {
                res.status(400).json({ error: `The user with userID ${ userid } is not found.`});
            }
        } catch (err) {
            res.status(500).json({success: false, error: "Internal server error"});
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
        });
    }
}
