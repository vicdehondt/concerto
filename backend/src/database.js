var sqlite3 = require('sqlite3').verbose()
const fs = require('fs');

// relative path - DOES NOT WORK because of compiling this file
// const DBSOURCE = "SQLite/CustomerDB.db"

// absolute path - FILL IN YOURSELF ex. "users/john/documents/webtech-project/backend/src/SQLite/CustomerDB.db"
const DBSOURCE = "/Users/reinout/Documents/GitHub/webtech-project/backend/src/SQLite/CustomerDB.db"

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
      // Cannot open database
      console.error(err.message)
      throw err
    }else{
        console.log('Connected to the SQLite database.')
    }
});

function Disconnect() {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log("The connection with the database has been closed!")
        }
    })
}

function AddCustomer(User, EMail) {
    db.run('INSERT INTO Customers (Username, Mail) VALUES (?, ?)', 
    [User, EMail], (err) =>{
        if (err) {
            console.log("Thereå was an error adding a customer")
        } else {
            console.log("The user was succesfully added to the database")
        }
    })
}

function FindMail(Customerid) {
    return new Promise((resolve, reject) => {
        db.get('SELECT Mail FROM Customers WHERE CustomerID = ?', [Customerid], (err, row) => {
            if (err) {
                console.log("There was an error retrieving the mail of a customer!");
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

// testing to read an image from file
const imageFilePath = '/Users/reinout/Documents/GitHub/webtech-project/backend/src/testimages/ariana.jpeg';
const imageBuffer = fs.readFileSync(imageFilePath);

function AddImage() {
    db.run('INSERT INTO Images (imsrc) VALUES (?)',
    [imageBuffer], (err)=> {
        if (err) {
            console.log("There was an error adding an image");
            console.log(err.message)
        } else {
            console.log("Succesfully added image to database");
        }
    });
}

function ReadImage() {
    db.get("SELECT imsrc FROM Images WHERE id = 1", (err, row) => {
        if (!err && row) {
            fs.writeFileSync('output_image.jpg', row.imsrc);
        } else {
            console.error("Error retrieving image:", err);
          }
    })
}

// AddImage()

ReadImage()

module.exports = {
    FindMail,
    AddCustomer,
    Disconnect
}