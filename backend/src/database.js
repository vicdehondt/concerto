var sqlite3 = require('sqlite3').verbose()
const fs = require('fs');

// relative path - DOES NOT WORK because of compiling this file
// const DBSOURCE = "SQLite/CustomerDB.db"

// absolute path - FILL IN YOURSELF ex. "users/john/documents/webtech-project/backend/src/SQLite/CustomerDB.db"
const DBSOURCE = "/Users/reinout/Documents/GitHub/webtech-project/backend/src/SQLite/"

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

module.exports = {

}