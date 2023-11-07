-- Table which represent an event
CREATE TABLE Events (
	[eventID] INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	[title] TEXT NOT NULL,
	[description] TEXT NOT NULL,
	[maxPeople] INTEGER NOT NULL,
	[datetime] DATETIME NOT NULL,
	[price] REAL NOT NULL,
	[image] BLOB NOT NULL
);

-- Table which represent a location <-> Has not been added to database
CREATE TABLE Locations (
	[locationID] INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	[locationname] TEXT NOT NULL,
	[latitude] REAL NOT NULL,
	[longitute] REAL NOT NULL
)