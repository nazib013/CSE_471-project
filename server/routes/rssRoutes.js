const express = require("express");
const router = express.Router();

const { getPetArticles } = require("../controllers/rssController");

router.get("/pet-articles", getPetArticles);

module.exports = router;