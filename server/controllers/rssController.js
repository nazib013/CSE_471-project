const Parser = require("rss-parser");
const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "Mozilla/5.0"
  }
});

exports.getPetArticles = async (req, res) => {
  try {
    const feed = await parser.parseURL("https://petcarehelperai.com/feed.xml");

    if (!feed || !feed.items) {
      return res.status(500).json({ error: "Invalid RSS feed" });
    }

    const search = req.query.search || "";

    let articles = feed.items.map(item => ({
      title: item.title || "",
      link: item.link || "",
      pubDate: item.pubDate || "",
      contentSnippet: item.contentSnippet || ""
    }));

    if (search) {
      const s = search.toLowerCase().trim();

      articles = articles.filter(item => {
        const title = (item.title || "").toLowerCase();
        const snippet = (item.contentSnippet || "").toLowerCase();

        return title.includes(s) || snippet.includes(s);
      });
    }

    res.json({
      count: articles.length,
      articles
    });

  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch RSS feed",
      details: error.message
    });
  }
};