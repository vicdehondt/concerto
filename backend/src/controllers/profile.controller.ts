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
		this.router.post('/settings/privacy/attendedevents', this.requireAuth,
			upload.none(),
			(req: express.Request, res: express.Response) => {
                this.changePrivacySetting(req, res, 'privacyAttendedEvents');
			});
        this.router.post('/settings/privacy/friends', this.requireAuth,
			upload.none(),
			(req: express.Request, res: express.Response) => {
                this.changePrivacySetting(req, res, 'privacyFriends');
			});
        this.router.post('/settings/privacy/checkedinnevents', this.requireAuth,
			upload.none(),
			(req: express.Request, res: express.Response) => {
                this.changePrivacySetting(req, res, 'privacyCheckedInEvents');
			});
        this.router.put('/settings/personal/mail', this.requireAuth,
			upload.none(),
			(req: express.Request, res: express.Response) => {
                this.changeMail(req, res);
			});
    }

    async changeMail(req: express.Request, res: express.Response) {
        const sessiondata = req.session;
        const userID = sessiondata.userID;
        const newMail = req.body.mail;
        const user = database.UserModel.findByPk(userID);
        const otherUser = database.UserModel.findOne({
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
