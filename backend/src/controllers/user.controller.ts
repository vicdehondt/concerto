import * as express from 'express';
import { BaseController } from './base.controller';

export class UserController extends BaseController {

    constructor() {
        super("/user");
    }

    initializeRoutes(): void {
		this.router.post("/register", this.registerPost.bind(this));
    }

	registerPost(req: express.Request, res: express.Response): void {
        console.log("GET request received for /add");

        const sessionData: any = req.session;

    }

    /**
	 * Check if a string is actually provided
	 * 
	 * @param {string} param Provided string
	 * @returns {boolean} Valid or not
	 */
	private _isGiven(param: string): boolean {
		if (param == null)
			return false;
		else
			return param.trim().length > 0;
	}

    /**
	 * Check if a string is a valid email
	 * 
	 * @param {string} email Email string
	 * @returns {boolean} Valid or not
	 */
	private _isEmailValid(email: string): boolean {
		const atIdx = email.indexOf("@");
		const dotIdx = email.indexOf(".");
		
		return atIdx != -1 && dotIdx != -1 && dotIdx > atIdx;
	}
}
