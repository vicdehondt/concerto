var sqlite3 = require('sqlite3').verbose()

// relative path - DOES NOT WORK because of compiling this file
// const DBSOURCE = "SQLite/CustomerDB.db"

// absolute path - FILL IN YOURSELF ex. "users/john/documents/webtech-project/backend/src/SQLite/CustomerDB.db"
const DBSOURCE = ""

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

module.exports = {
    FindMail,
    AddCustomer,
    Disconnect
}