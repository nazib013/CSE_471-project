const Parser = require("rss-parser");
const axios = require("axios");

const parser = new Parser({
  customFields: {
    item: [
      ["content:encoded", "contentEncoded"],
      ["content", "content"],
    ],
  },
});

// ── helpers ──────────────────────────────────────────────────────────────────

/**
 * Very small HTML cleaner – no external deps needed.
 */
function cleanArticleHtml(raw) {
  return raw
    // Remove script/style/nav/header/footer/aside/form blocks
    .replace(/<(script|style|nav|header|footer|aside|form|iframe|noscript)[^>]*>[\s\S]*?<\/\1>/gi, "")
    // Remove comments
    .replace(/<!--[\s\S]*?-->/g, "")
    // Keep href on <a> tags
    .replace(/<(a)\s[^>]*href="([^"]*)"[^>]*>/gi, '<a href="$2">')
    // Keep src/alt on <img> tags
    .replace(/<(img)\s[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*/gi, '<img src="$2" alt="$3">')
    .replace(/<(img)\s[^>]*src="([^"]*)"[^>]*/gi, '<img src="$2">')
    // Strip all remaining tag attributes
    .replace(/<([a-z][a-z0-9]*)\s[^>]*>/gi, "<$1>")
    // Collapse excess whitespace
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Extract the main article body from a raw HTML page string.
 *
 * The key fix: use a *greedy* innermost-match approach instead of
 * non-greedy `[\s\S]*?` which stops at the first closing tag.
 * We grab everything between the opening and the LAST matching closing tag.
 */
function extractArticleBody(html) {
  // Try each selector in order of specificity
  const selectors = [
    // WordPress / common CMS containers — match up to the LAST closing tag
    { open: /<article[^>]*>/i,  close: /<\/article>/gi,  tag: "article"  },
    { open: /<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>/i, close: /<\/div>/gi, tag: "div" },
    { open: /<div[^>]*class="[^"]*post-content[^"]*"[^>]*>/i,  close: /<\/div>/gi, tag: "div" },
    { open: /<div[^>]*class="[^"]*article-content[^"]*"[^>]*>/i, close: /<\/div>/gi, tag: "div" },
    { open: /<div[^>]*class="[^"]*content[^"]*"[^>]*>/i, close: /<\/div>/gi, tag: "div" },
    { open: /<main[^>]*>/i,    close: /<\/main>/gi,     tag: "main"     },
    { open: /<body[^>]*>/i,    close: /<\/body>/gi,     tag: "body"     },
  ];

  for (const sel of selectors) {
    const openMatch = html.match(sel.open);
    if (!openMatch) continue;

    const startIdx = html.indexOf(openMatch[0]);
    if (startIdx === -1) continue;

    const contentStart = startIdx + openMatch[0].length;

    // Find the LAST occurrence of the closing tag so we capture everything
    const closingTag = `</${sel.tag}>`;
    const lastClose = html.lastIndexOf(closingTag);
    if (lastClose === -1 || lastClose <= contentStart) continue;

    const extracted = html.slice(contentStart, lastClose);
    if (extracted.trim().length > 200) {
      return extracted;
    }
  }

  return html;
}

// ── routes ────────────────────────────────────────────────────────────────────

/** GET /api/tips  — list all articles with snippet */
exports.getPetArticles = async (req, res) => {
  try {
    const feed = await parser.parseURL("https://petcarehelperai.com/feed.xml");

    const articles = feed.items.map((item) => {
      const fullContent =
        item.contentEncoded || item.content || item.contentSnippet || "";

      return {
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        contentSnippet: item.contentSnippet || "",
        fullContent: fullContent,
      };
    });

    res.json({ articles });
  } catch (err) {
    res.status(500).json({ error: "RSS failed", details: err.message });
  }
};

/** GET /api/tips/article?url=<encoded-url>  — fetch & return cleaned article HTML */
exports.getArticleContent = async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "url query param required" });
  }

  // Validate URL
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return res.status(400).json({ error: "Invalid URL" });
  }

  // Only allow http/https
  if (!["http:", "https:"].includes(parsed.protocol)) {
    return res.status(400).json({ error: "Only http/https URLs are allowed" });
  }

  try {
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        Connection: "keep-alive",
        "Cache-Control": "no-cache",
      },
      maxContentLength: 5 * 1024 * 1024, // 5MB cap
    });

    const rawHtml = response.data;
    const body = extractArticleBody(rawHtml);
    const cleaned = cleanArticleHtml(body);

    if (!cleaned || cleaned.trim().length < 100) {
      return res.status(422).json({
        error: "Could not extract article content from this page",
      });
    }

    res.json({ html: cleaned, originalUrl: url });
  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch article",
      details: err.message,
    });
  }
};