import * as express from 'express';
import { BaseController } from './base.controller';
import {createMulter} from "../configs/multerConfig";
import { wishlistEvent, getAllWishListed, removeWishlist } from '../models/Wishlistmodel';

const eventImagePath = './public';

const upload = createMulter(eventImagePath);

export class WishlistController extends BaseController {

	constructor() {
		super("/wishlist");
	}

	initializeRoutes(): void {
        this.router.get('/', upload.none(), this.requireAuth,
            (req: express.Request, res: express.Response) => {
                res.set('Access-Control-Allow-Credentials', 'true');
                this.getWishlist(req, res);
            });
        this.router.post('/', upload.none(), this.requireAuth,
            (req: express.Request, res: express.Response) => {
                res.set('Access-Control-Allow-Credentials', 'true');
                this.addWishlist(req, res);
            });
        this.router.delete('/', upload.none(), this.requireAuth,
            (req: express.Request, res: express.Response) => {
                res.set('Access-Control-Allow-Credentials', 'true');
                this.deleteWishlist(req, res);
            });
    }

    async getWishlist(req: express.Request, res: express.Response) {
        try {
            const sessiondata = req.session;
            const userID = sessiondata.userID;
            const result = await getAllWishListed(userID);
            res.status(200).json(result);
        } catch (err) {
            console.log("There was an error: ", err);
			res.status(500).json({ success: false, error: "Internal server error."});
        }
    }

    async addWishlist(req: express.Request, res: express.Response) {
        try {
            const sessiondata = req.session;
            const userID = sessiondata.userID;
            const { eventID } = req.body;
            const result = await wishlistEvent(userID, eventID);
            if (result) {
                res.status(200).json({success: true, message: "Event has been wishlisted."});
            } else {
                res.status(400).json({success: false, error: "Event is already wishlisted."});
            }
        } catch (err) {
            console.log("There was an error: ", err);
			res.status(500).json({ success: false, error: "Internal server error."});
        }
    }

    async deleteWishlist(req: express.Request, res: express.Response) {
        try {
            const sessiondata = req.session;
            const userID = sessiondata.userID;
            const { eventID } = req.body;
            const result = await removeWishlist(userID, eventID);
            if (result) {
                res.status(200).json({success: true, message: "Event has been removed from wishlist."});
            } else {
                res.status(200).json({success: false, error: "Event was not wishlisted."});
            }
        } catch (err) {
            console.log("There was an error: ", err);
			res.status(500).json({ success: false, error: "Internal server error."});
        }
    }
}
