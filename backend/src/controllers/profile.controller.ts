import * as express from 'express';
import { BaseController } from './base.controller';
import * as database from '../models/Usermodel';
import {createMulter} from "../configs/multerConfig"

const userImagePath = './public/users';

const upload = createMulter(userImagePath);

export class ProfileController extends BaseController {

    constructor() {
        super("/profile");
    }

    initializeRoutes(): void {
        this.router.get('/', this.requireAuth,
			upload.none(),
			(req: express.Request, res: express.Response) => {
                this.getProfile(req, res);
			});
        this.router.get('/settings/privacy', this.requireAuth,
			upload.none(),
			(req: express.Request, res: express.Response) => {
                this.getPrivacySettings(req, res);
			});
		this.router.put('/settings/privacy/attendedevents', this.requireAuth,
			upload.none(),
			(req: express.Request, res: express.Response) => {
                this.changePrivacySetting(req, res, 'privacyAttendedEvents');
			});
        this.router.put('/settings/privacy/friends', this.requireAuth,
			upload.none(),
			(req: express.Request, res: express.Response) => {
                this.changePrivacySetting(req, res, 'privacyFriends');
			});
        this.router.put('/settings/privacy/checkedinevents', this.requireAuth,
			upload.none(),
			(req: express.Request, res: express.Response) => {
                this.changePrivacySetting(req, res, 'privacyCheckedInEvents');
			});
        this.router.put('/settings/privacy/attendedevents', this.requireAuth,
			upload.none(),
			(req: express.Request, res: express.Response) => {
                this.changePrivacySetting(req, res, 'privacyAttendedeEvents');
			});
        this.router.put('/settings/personal/mail', this.requireAuth,
			upload.none(),
			(req: express.Request, res: express.Response) => {
                this.changeMail(req, res);
			});
    }

    async getProfile(req: express.Request, res: express.Response) {
        const sessiondata = req.session;
        const user = await database.UserModel.findByPk(sessiondata.userID, {
            attributes: ['image', 'username', 'userID', 'mail', 'privacyAttendedEvents', 'privacyCheckedInEvents', 'privacyFriends']
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

    async changePrivacySetting(req: express.Request, res: express.Response, settingType) {
        const sessiondata = req.session;
        const userID = sessiondata.userID;
        const newSetting = req.body.setting;
        const user = await database.UserModel.findByPk(userID);
        if (database.isValidPrivacySetting(newSetting)) {
            user[settingType] = newSetting;
            await user.save();
            console
            res.status(200).json({ success: true, message: 'Changed setting'});
        } else {
            res.status(400).json({ success: false, error: 'Invalid setting value'});
        }
    }
}
