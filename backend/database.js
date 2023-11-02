var sqlite3 = require('sqlite3').verbose()

const DBSOURCE = "src/SQLite/CustomerDB.db"

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
      // Cannot open database
      console.error(err.message)
      throw err
    }else{
        console.log('Connected to the SQLite database.')
    }
});


db.all('SELECT * FROM Customers', [], (selectErr, rows) => {
    if (selectErr) {
        throw selectErr;
    }

    // Handle the retrieved data here, 'rows' contains the results
    console.log(rows);
});

function AddCustomer(User, EMail) {
    db.run('INSERT INTO Customers (Username, Mail) VALUES (?, ?)', 
    [User, EMail], (err) =>{
        if (err) {
            console.log("There was an error adding a customer")
        } else {
            console.log("The user was succesfully added to the database")
        }
    })
}

AddCustomer("Vic", "vic@gmail.com")