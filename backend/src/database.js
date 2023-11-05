var sqlite3 = require('sqlite3').verbose()
const fs = require('fs');

// relative path - DOES NOT WORK because of compiling this file
const DBSOURCE = "../src/SQLite/ConcertoDB.db"

// absolute path - FILL IN YOURSELF ex. "users/john/documents/webtech-project/backend/src/SQLite/CustomerDB.db"
// const DBSOURCE = ""

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
            console.log("The connection with the database has been closed!");
        }
    })
}

function AddEvent(title, description, people, DateTime, price, image){
    db.run('INSERT INTO Events (title, description, maxPeople, datetime, price, image) VALUES (?,?,?,?,?,?)',
    [title, description, people, DateTime, price, image],
    (err) => {
        if (err) {
            console.log("There was an error adding this event to the database");
            console.log(err.message);
        } else {
            console.log("Succesfully added an event to the database");
        }
    })
}

const imageFilePath = '/Users/reinout/Documents/GitHub/webtech-project/backend/src/eventimages/ariana.jpeg';
const imageBuffer = fs.readFileSync(imageFilePath);

function FindEventTitle(ID) {
    return new Promise((resolve, reject) => {
        db.get('SELECT title FROM Events WHERE eventID=?',
        [ID], (err, row) => {
            if (err) {
                console.log("There was an error retrieving an event name");
                console.log(err.message);
            } else if (row) {
                console.log(row.title) // Should be removed, to test
                resolve(row.title);
            } else {
                console.log("Event not found with ID: ", ID);
            }
        })
    })
}

module.exports = {
    FindEventTitle,
    AddEvent
}

// This query was executed once. So the database contains this Event.
// AddEvent("Ariana Grande", "She is a wonderfull woman", 500, '2023-11-04 18:00:00', 100, imageBuffer);