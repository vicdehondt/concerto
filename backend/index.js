const express = require("express");

const DBFunctions = require("./database.js");

const app = express();

app.listen(8080,() => console.log("Server listening at port 8080"));

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/customer", async (req, res) => {
  try { 
    id = req.query.customerid
    const mail = await DBFunctions.FindMail(id)
    res.send(mail);
  } catch (error) {
    console.error(error)
  }
});

app.get("/about", (req, res) => {
  res.send("About route");
});