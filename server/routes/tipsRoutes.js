const express = require("express");
const router = express.Router();

const { getPetArticles } = require("../controllers/rssController");
const authMiddleware = require("../middleware/authMiddleware");

//router.get("/", authMiddleware, getPetArticles);
router.get("/", getPetArticles);
module.exports = router;