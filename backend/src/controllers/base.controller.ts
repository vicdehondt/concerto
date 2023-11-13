import * as express from 'express';
const fs = require('fs');

export abstract class BaseController {
    router = express.Router();
    path = "/";

    constructor(path: string) {
        this.path = path;
        this.initializeRoutes();
    }

    abstract initializeRoutes();

    // It is important for this function that BaseController is in the same directory as the other controllers.
    DeleteFile(path: String, file) {
        fs.unlink(path + '/' + file.filename, (err) => {
            if (err) {
                throw err;
            } console.log("File deleted succesfully.");
        })
    }
}
