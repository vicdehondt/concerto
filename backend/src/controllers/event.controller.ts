import * as express from 'express';
import { BaseController } from './base.controller';
import * as database from '../database';

export class EventController extends BaseController {

    constructor() {
        super("/event");
    }

    initializeRoutes(): void {
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
