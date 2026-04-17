const Parser = require("rss-parser");
const parser = new Parser();

exports.getPetArticles = async (req, res) => {
  try {
    const feed = await parser.parseURL("https://petcarehelperai.com/feed.xml");

    const articles = feed.items.map(item => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      contentSnippet: item.contentSnippet
    }));

    res.json(articles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch RSS feed" });
  }
};