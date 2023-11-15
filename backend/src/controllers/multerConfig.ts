import * as multer from "multer";
import * as crypto from "crypto";


function configureMulter(destinationpath) {
    // Set up storage with a custom filename function
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
        // Specify the destination folder where the file will be saved
        cb(null, destinationpath);
        },
        filename: function (req, file, cb) {
        // Customize the filename here
        const originalname = file.originalname;
        const parts = originalname.split(".");
        const random = crypto.randomUUID(); // Create unique identifier for each image
        const newname = random + "." + parts[parts.length - 1];
        cb(null, newname);
        }
    });
    return storage;
}

export function createMulter(destination) {
    const storage = configureMulter(destination);
    return multer({ storage: storage });
}