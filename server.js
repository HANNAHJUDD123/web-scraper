const express = require("express");
const bodyParser = require("body-parser");
const logger = require("morgan");
const mongoose = require("mongoose");

const Note = require("./models/Note.js");
const Article = require("./models/Article.js");

const request = require("request");
const cheerio = require("cheerio");



mongoose.Promise = Promise;


const PORT = process.env.PORT || 8080;

let app = express();

app.use(logger("dev"));
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(express.static("public"));

let exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

let routes = require("./controllers/scraper_controller.js");

app.use("/", routes);

mongoose.connect("mongodb://localhoset/webscraper101");

let db = mongoose.connection;

db.on("error", function(error) {
    console.log("Mongoose Error: ", error);
});

db.once("open", function(){
    console.log("Mongoose connection seccessful.");
});

app.listen(PORT, function(){
    console.log("App running on PORT " + PORT);
});