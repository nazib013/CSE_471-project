const express = require("express");
const router = express.Router();

const { getPetArticles } = require("../controllers/rssController");

router.get("/", getPetArticles);

module.exports = router;