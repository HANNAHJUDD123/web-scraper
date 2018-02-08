// import Promise from "mongoose";

const express = require("express");

const router = express.Router();

const request = require("request");

const cheerio = require("cheerio");

const mongoose = require("mongoose");

mongoose.Promise = Promise;

let Note = require("../models/Note.js");
let Article = require("../models/Article.js");

router.get("/", function(req, res) {
    res.render("index");
});

router.get("/savedartivles", function(req, res) {
    Article.find({}, function(error, doc) {
        if (error) {
            console.log(error);
        }
        else {
            let hbsArticleObject = {
                articles: doc
            };
            res.render("savedartivles", hbsArticleObject);
        }
    });
});

router.post("/scrape", function(req, res) {
    request("https://www.nbcnews.com/", function(error, response, html) {
        let $ = cheerio.load(html);
        let scrapedArticles = {};
        $("article h2").each(function(i, element) {
            let result = {};

            result.title = $(this).children("a").text();

            console.log("What is the results title?" + result.title);

            result.link = $(this).children("a").attr("href");
            
            scrapedArticles[i] = result;
        });
        console.log("Scraped Articles Object built nicely: " + scrapedArticles);

        let hbsArticleObject = {
            articles: scrapedArticles
        };

        res.render("index", hbsArticleObject);
    });
});

router.post("/save", function(req, res) {
    console.log("This is the title: " + req.body.title);

    let newArticleObject = {};

    newArticleObject.title = req.body.title;

    newArticleObject.link = req.body.link;

    let entry = new Article(newArticleObject);

    console.log("we can save the article: " + entry);

    entry.save(function(err, doc) {
        if (err) {
            console.log(err);
        }
        else {
            console.log(doc);
        }
    });

    res.redirect("/savedarticles");
});

router.get("/delete/:id", function(req, res) {
    console.log("ID is getting read for delete" + req.params.id);
    console.log("Able to activate delete function.");

    Article.findOneAndRemove({"_id": req.params.id}, function (err, offer) {
        if (err) {
            console.log("bot able to delete:" + err);
        } else {
            console.log("Able to delete, Yay");
        }
        res.redirect("/savedarticles");
    });
});

router.get("/notes/:id", function(req, res) {
    console.log("ID is getting read for delete" + req.params.id);
    console.log("Able to activate delete function.");
    
    Note.findOneAndRemove({"_id": req.params.id}, function (err, doc) {
        if (err) {
            console.log("Not able to delete:" + err);
        } else {
            console.log("Able to delete, Yay");
        }
        res.send(doc);
    });
});

router.get("/articles/:id", function(req, res) {
    console.log("ID is getting read" + req.params.id);

    Article.findOne({"_id": req.params.id})

    .populate('notes')

    .exec(function(err, doc) {
        if (err) {
            console.log("Not able to find article and get notes.");
        } 
        else {
            console.log("We are getting article and maybe notes? " + doc);
            res.json(doc);
        }
    });
});

router.post("/articles/:id", function(req, res) {
    let newNote = new Note(req.body);

    newNote.save(function(error, doc) {
        if (error) {
            console.log(error);
        }
        else {
            Article.findOneAndUpdate({ "_id": req.params.id }, {$push: {notes: doc._id}}, {new: true, upsert: true})

            .populate('notes')

            .exec(function (err, doc) {
                if (err) {
                    console.log("Connot find article.");
                } else {
                    console.log("On note save we are getting notes? " + doc.notes);
                    res.send(doc);
                }
            });
        }
    });
});

module.exports = router;






