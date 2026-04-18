const express = require("express");
const router = express.Router();

const { getPetArticles } = require("../controllers/tipsController");

router.get("/", getPetArticles);

module.exports = router;