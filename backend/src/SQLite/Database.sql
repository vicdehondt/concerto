-- Create a table to represent Customers
-- Do not execute is there is a file CustomerDB.db
CREATE TABLE Customers ( 
	[CustomerID] INTEGER  NOT NULL PRIMARY KEY AUTOINCREMENT, 
	[Username] NVARCHAR(50)  NOT NULL ,
    [Mail] NVARCHAR(50) NOT NULL
); 


-- Template to insert values into the database
INSERT INTO Customers (Username, Mail)
VALUES ("JohnDoe", "johndoe@gmail.com");

--  Template to query information from database
SELECT * 
FROM Customers;
