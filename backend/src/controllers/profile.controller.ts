import * as express from 'express';
import { BaseController } from './base.controller';
import * as database from '../models/Usermodel';
import {createMulter} from "../configs/multerConfig"
import {body, validationResult} from "express-validator"
const fs = require('fs');

const userImagePath = './public/users';

const upload = createMulter(userImagePath);

export class ProfileController extends BaseController {

    constructor() {
        super("/profile");
    }

    initializeRoutes(): void {
        this.router.get('/', this.requireAuth,
			upload.none(), this.verifyErrors,
			(req: express.Request, res: express.Response) => {
                this.getProfile(req, res);
			});
        this.router.post('/profilepicture', this.requireAuth,
			upload.single("picture"), this.verifyErrors,
			(req: express.Request, res: express.Response) => {
                this.changeProfilePicture(req, res);
			});
        this.router.post('/description', this.requireAuth,
			upload.none(),
            [
                body("description").trim().notEmpty(),
            ], this.verifyErrors,
			(req: express.Request, res: express.Response) => {
                this.changeDescription(req, res);
			});
        this.router.post('/genres', this.requireAuth,
			upload.none(),
            [
                body("firstGenre").trim().notEmpty(),
                body("firstGenre").trim().notEmpty(),
            ], this.verifyErrors,
			(req: express.Request, res: express.Response) => {
                this.changeGenres(req, res);
			});
        this.router.get('/settings/privacy', this.requireAuth,
			upload.none(),
			(req: express.Request, res: express.Response) => {
                this.getPrivacySettings(req, res);
			});
        this.router.post('/settings/privacy', this.requireAuth,
			upload.none(),
			(req: express.Request, res: express.Response) => {
                this.changePrivacySetting(req, res);
			});
        this.router.post('/settings/personal/mail', this.requireAuth,
			upload.none(),
			(req: express.Request, res: express.Response) => {
                this.changeMail(req, res);
			});
    }

    async changeProfilePicture(req: express.Request, res: express.Response) {
        const sessiondata = req.session;
        const user = await database.UserModel.findByPk(sessiondata.userID);
        const profilepicture = req.file;
        const picturepath = "http://localhost:8080/users/" + profilepicture.filename;
        if (user.image) {
            console.log("Deleting an old profile picture is not implemented yet")
        }
        user.image = picturepath;
        await user.save();
        res.status(200).json({success: true, message: "Profile picture has been changed."});
    }

    async changeDescription(req: express.Request, res: express.Response) {
        const sessiondata = req.session;
        const user = await database.UserModel.findByPk(sessiondata.userID);
        user.description = req.body.description;
        await user.save();
        res.status(200).json({success: true, message: "Description has been changed."});
    }

    async changeGenres(req: express.Request, res: express.Response) {
        const sessiondata = req.session;
        const user = await database.UserModel.findByPk(sessiondata.userID);
        const { firstGenre, secondGenre } = req.body;
        user.firstGenre = firstGenre;
        user.secondGenre = secondGenre;
        await user.save();
        res.status(200).json({success: true, message: "Genres have been changed."});
    }

    async getProfile(req: express.Request, res: express.Response) {
        const sessiondata = req.session;
        const user = await database.UserModel.findByPk(sessiondata.userID, {
            attributes: ['image', 'username', 'userID', 'mail', 'privacyAttendedEvents', 'privacyCheckedInEvents', 'privacyFriends', 'description', 'firstGenre', 'secondGenre']
        });
        res.status(200).json(user);
    }

    async getPrivacySettings(req: express.Request, res: express.Response) {
        const sessiondata = req.session;
        const user = await database.UserModel.findByPk(sessiondata.userID, {
            attributes: ['privacyAttendedEvents', 'privacyCheckedInEvents', 'privacyFriends']
        });
        res.status(200).json(user);
    }

    async changeMail(req: express.Request, res: express.Response) {
        const sessiondata = req.session;
        const userID = sessiondata.userID;
        const newMail = req.body.mail;
        const user = await database.UserModel.findByPk(userID);
        const otherUser = await database.UserModel.findOne({
            where: {
                mail: newMail
            }
        });
        if (otherUser == null) {
            user.mail = newMail;
            user.save();
            res.status(200).json({ success: true, error: 'Email was changed'});
        } else {
            res.status(400).json({ success: false, error: 'This mail is already used by another user!'});
        }
    }

    async changePrivacySetting(req: express.Request, res: express.Response) {
        const sessiondata = req.session;
        const userID = sessiondata.userID;
        const {privacyCheckedInEvents, privacyAttendedEvents, privacyFriends} = req.body;
        const user = await database.UserModel.findByPk(userID);
        user.privacyCheckedInEvents = privacyCheckedInEvents;
        user.privacyAttendedEvents = privacyAttendedEvents;
        user.privacyFriends = privacyFriends;
        await user.save();
        res.status(200).json({ success: true, message: 'Changed settings.'});
    }
}
