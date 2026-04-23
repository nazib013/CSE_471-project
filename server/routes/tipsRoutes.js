const express = require("express");
const router = express.Router();

const { getPetArticles, getArticleContent } = require("../controllers/rssController");

router.get("/", getPetArticles);
router.get("/article", getArticleContent);

module.exports = router;