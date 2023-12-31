import * as express from 'express';
import { BaseController } from './base.controller';
import * as database from '../models/Usermodel';
import {createMulter} from "../configs/multerConfig"
import { body } from "express-validator"
import * as bcrypt from "bcrypt";

const userImagePath = './public/users';

const upload = createMulter(userImagePath);

// This controller is used to handle all requests to the /profile endpoint.
// It allows to retrieve and change information about the logged in user.
export class ProfileController extends BaseController {

    constructor() {
        super("/profile");
    }

    initializeRoutes(): void {
        this.router.get('/', this.requireAuth, // Route to get the information of the logged in user.
			upload.none(), this.verifyErrors,
			(req: express.Request, res: express.Response) => {
                this.getProfile(req, res);
			});
        this.router.patch('/settings/personal/profilepicture', this.requireAuth, // Route to change the profile picture of the logged in user.
			upload.single("picture"), this.verifyErrors,
			(req: express.Request, res: express.Response) => {
                this.changeProfilePicture(req, res);
			});
        this.router.patch('/settings/personal/description', this.requireAuth, // Route to change the description of the logged in user.
			upload.none(),
            [
                body("description").trim().notEmpty().isLength({ max: 400 }).withMessage('Biography must be no more than 400 characters long.'),
            ], this.verifyErrors,
			(req: express.Request, res: express.Response) => {
                this.changeDescription(req, res);
			});
        this.router.patch('/settings/personal/password', this.requireAuth, // Route to change the password of the logged in user.
			upload.none(),
            [
                body("oldPassword").trim().notEmpty(),
                body("newPassword").trim().isLength({ min: 6}).withMessage('New password must be at least 6 characters long.').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/).withMessage('Password must include at least one lowercase letter, one uppercase letter, and one number.')
            ], this.verifyErrors,
			(req: express.Request, res: express.Response) => {
                this.changePassword(req, res);
			});
        this.router.post('/genres', this.requireAuth, // route to change the genres of the logged in user.
			upload.none(),
            [
                body("firstGenre").trim().notEmpty(),
                body("firstGenre").trim().notEmpty(),
            ], this.verifyErrors,
			(req: express.Request, res: express.Response) => {
                this.changeGenres(req, res);
			});
        this.router.get('/settings/privacy', this.requireAuth, // Route to get the privacy settings of the logged in user.
			upload.none(),
			(req: express.Request, res: express.Response) => {
                this.getPrivacySettings(req, res);
			});
        this.router.post('/settings/privacy', this.requireAuth, // Route to change the privacy settings of the logged in user.
			upload.none(),
			(req: express.Request, res: express.Response) => {
                this.changePrivacySetting(req, res);
			});
        this.router.post('/settings/personal/mail', this.requireAuth, // Route to change the mail of the logged in user.
			upload.none(),
			(req: express.Request, res: express.Response) => {
                this.changeMail(req, res);
			});
    }

    async changePassword(req: express.Request, res: express.Response) {
        const saltingRounds = 12;
        try {
            const { oldPassword, newPassword } = req.body;
            const user = await database.RetrieveUser('userID', req.session.userID);
            bcrypt.compare(oldPassword, user.password, function (err, result) {
                if (result == true) {
                    bcrypt.hash(newPassword, saltingRounds, async (err, hash) => {
                        if (err) {
                            console.log("There was an error changing the password.");
                            res.status(500).json({ success: false, error: "Internal server error."});
                        } else {
                            user.password = hash;
                            user.salt = saltingRounds;
                            await user.save();
                            res.status(200).json({success: true, message: "Your password has been changed."});
                        }
                    });
                } else {
                    res.status(400).json({success: false, message: "The old password is incorrect. Your password was not changed."})
                }
            });
        } catch (err) {
            console.log("There was an error: ", err);
			res.status(500).json({ success: false, error: "Internal server error."});
        }
    }

    async changeProfilePicture(req: express.Request, res: express.Response) {
        try {
            const sessiondata = req.session;
            const user = await database.UserModel.findByPk(sessiondata.userID);
            const profilepicture = req.file;
            const picturepath = "http://localhost:8080/users/" + profilepicture.filename;
            if (user.image) {
                console.log("Deleting an old profile picture is not implemented. This is no error.")
            }
            user.image = picturepath;
            await user.save();
            res.status(200).json({success: true, message: "Profile picture has been changed."});
        } catch (err) {
            console.log("There was an error: ", err);
			res.status(500).json({ success: false, error: "Internal server error."});
        }
    }

    async changeDescription(req: express.Request, res: express.Response) {
        try {
            const sessiondata = req.session;
            const user = await database.UserModel.findByPk(sessiondata.userID);
            user.description = req.body.description;
            await user.save();
            res.status(200).json({success: true, message: "Description has been changed."});
        } catch (err) {
            console.log("There was an error: ", err);
			res.status(500).json({ success: false, error: "Internal server error."});
        }
    }

    async changeGenres(req: express.Request, res: express.Response) {
        try {
            const sessiondata = req.session;
            const user = await database.UserModel.findByPk(sessiondata.userID);
            const { firstGenre, secondGenre } = req.body;
            user.firstGenre = firstGenre;
            user.secondGenre = secondGenre;
            await user.save();
            res.status(200).json({success: true, message: "Genres have been changed."});
        } catch (err) {
            console.log("There was an error: ", err);
			res.status(500).json({ success: false, error: "Internal server error."});
        }
    }

    async getProfile(req: express.Request, res: express.Response) {
        try {
            const sessiondata = req.session;
            const user = await database.UserModel.findByPk(sessiondata.userID, {
                attributes: ['image', 'username', 'userID', 'mail', 'privacyAttendedEvents', 'privacyCheckedInEvents', 'privacyFriends', 'description', 'firstGenre', 'secondGenre']
            });
            res.status(200).json(user);
        } catch (err) {
            console.log("There was an error: ", err);
			res.status(500).json({ success: false, error: "Internal server error."});
        }
    }

    async getPrivacySettings(req: express.Request, res: express.Response) {
        try {
            const sessiondata = req.session;
            const user = await database.UserModel.findByPk(sessiondata.userID, {
                attributes: ['privacyAttendedEvents', 'privacyCheckedInEvents', 'privacyFriends']
            });
            res.status(200).json(user);
        } catch (err) {
            console.log("There was an error: ", err);
			res.status(500).json({ success: false, error: "Internal server error."});
        }
    }

    async changeMail(req: express.Request, res: express.Response) {
        try {
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
        } catch (err) {
            console.log("There was an error: ", err);
			res.status(500).json({ success: false, error: "Internal server error."});
        }
    }

    async changePrivacySetting(req: express.Request, res: express.Response) {
        try {
            const sessiondata = req.session;
            const userID = sessiondata.userID;
            const {privacyCheckedInEvents, privacyAttendedEvents, privacyFriends} = req.body;
            const user = await database.UserModel.findByPk(userID);
            user.privacyCheckedInEvents = privacyCheckedInEvents;
            user.privacyAttendedEvents = privacyAttendedEvents;
            user.privacyFriends = privacyFriends;
            await user.save();
            res.status(200).json({ success: true, message: 'Changed settings.'});
        } catch (err) {
            console.log("There was an error: ", err);
			res.status(500).json({ success: false, error: "Internal server error."});
        }
    }
}
