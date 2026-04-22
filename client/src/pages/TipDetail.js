import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const sanitizeHtml = (rawHtml) => {
  const root = document.createElement("div");
  root.innerHTML = rawHtml;

  ["script", "style", "iframe", "form", "input", "button", "noscript", "object", "embed"].forEach(
    (tag) => root.querySelectorAll(tag).forEach((el) => el.remove())
  );

  root.querySelectorAll("a").forEach((a) => {
    const span = document.createElement("span");
    span.innerHTML = a.innerHTML;
    span.style.color = "inherit";
    a.replaceWith(span);
  });

  root.querySelectorAll("*").forEach((el) => {
    [...el.attributes].forEach((attr) => {
      if (attr.name.startsWith("on") || attr.name === "href") {
        el.removeAttribute(attr.name);
      }
    });
  });

  return root.innerHTML;
};

const TipDetail = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [tip, setTip] = useState(state || null);
  const [fullArticleHtml, setFullArticleHtml] = useState(null);
  const [articleLoading, setArticleLoading] = useState(true);
  const [articleError, setArticleError] = useState(null);
  const [tipLoading, setTipLoading] = useState(!state);

  // Step 1: if we don't have tip metadata (e.g. direct URL / refresh), fetch it
  useEffect(() => {
    if (!tip) {
      setTipLoading(true);
      fetch("http://localhost:5000/api/tips")
        .then((res) => res.json())
        .then((data) => {
          const found = data.articles?.[id];
          setTip(found || null);
        })
        .catch((err) => console.error("Failed to load tip:", err))
        .finally(() => setTipLoading(false));
    }
  }, [id, tip]);

  // Step 2: once we have the tip's URL, fetch the FULL article content via proxy
  useEffect(() => {
    if (!tip?.link) return;

    setArticleLoading(true);
    setArticleError(null);

    fetch(
      `http://localhost:5000/api/tips/article?url=${encodeURIComponent(tip.link)}`
    )
      .then((res) => {
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.html && data.html.trim().length > 100) {
          setFullArticleHtml(sanitizeHtml(data.html));
        } else {
          throw new Error("Scraped content too short or empty");
        }
      })
      .catch((err) => {
        console.error("Failed to load full article:", err);
        setArticleError(err.message);
        // Graceful fallback: use RSS feed content
        const fallback = tip.fullContent || tip.contentSnippet || "";
        if (fallback) setFullArticleHtml(sanitizeHtml(fallback));
      })
      .finally(() => setArticleLoading(false));
  }, [tip?.link]);

  // ── Loading state (tip metadata not yet available) ──
  if (tipLoading) {
    return (
      <div style={styles.page}>
        <div style={styles.topBar}>
          <div style={styles.topBarInner}>
            <div style={styles.skeletonBack} />
          </div>
        </div>
        <div style={styles.bodyWrap}>
          <aside style={styles.sidebar}>
            <div style={{ ...styles.skeletonLine, width: "60%", height: "18px" }} />
            {[90, 75, 85, 70, 80].map((w, i) => (
              <div key={i} style={{ ...styles.skeletonLine, width: `${w}%`, marginTop: "10px" }} />
            ))}
          </aside>
          <main style={styles.main}>
            <div style={styles.articleCard}>
              <div style={{ ...styles.skeletonLine, width: "70%", height: "36px", marginBottom: "12px" }} />
              <div style={{ ...styles.skeletonLine, width: "30%", height: "14px", marginBottom: "24px" }} />
              <hr style={styles.divider} />
              {[100, 92, 97, 85, 90, 78, 95, 82].map((w, i) => (
                <div key={i} style={{ ...styles.skeletonLine, width: `${w}%`, marginBottom: "11px" }} />
              ))}
            </div>
          </main>
        </div>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.45} }`}</style>
      </div>
    );
  }

  if (!tip) {
    return (
      <div style={styles.page}>
        <div style={styles.topBar}>
          <div style={styles.topBarInner}>
            <button onClick={() => navigate("/tips")} style={styles.backBtn}>
              ← Back to Tips
            </button>
          </div>
        </div>
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#888" }}>
          <p style={{ fontSize: "3rem" }}>😕</p>
          <h2>Article not found</h2>
        </div>
      </div>
    );
  }

  const formattedDate = tip.pubDate
    ? new Date(tip.pubDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div style={styles.page}>
      {/* ── Top bar ── */}
      <div style={styles.topBar}>
        <div style={styles.topBarInner}>
          <button onClick={() => navigate("/tips")} style={styles.backBtn}>
            ← Back to Tips
          </button>
          <nav style={styles.breadcrumb}>
            <span onClick={() => navigate("/tips")} style={styles.breadcrumbLink}>
              Pet Tips
            </span>
            <span style={styles.sep}>›</span>
            <span style={styles.breadcrumbCurrent}>
              {tip.title.length > 55 ? tip.title.slice(0, 55) + "…" : tip.title}
            </span>
          </nav>
        </div>
      </div>

      {/* ── Body: sidebar + article ── */}
      <div style={styles.bodyWrap}>
        {/* Sidebar */}
        <aside style={styles.sidebar}>
          <h4 style={styles.sidebarHeading}>In this article</h4>
          <p style={styles.sidebarTitle}>{tip.title}</p>
          {formattedDate && (
            <p style={styles.sidebarMeta}>📅 {formattedDate}</p>
          )}
          <hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "16px 0" }} />
          <p style={styles.sidebarNote}>
            This article is provided by our healthcare RSS feed and rendered fully inside our platform.
          </p>
          <button onClick={() => navigate("/tips")} style={styles.sidebarBackBtn}>
            ← Browse all tips
          </button>
        </aside>

        {/* Main article */}
        <main style={styles.main}>
          <div style={styles.articleCard}>
            {/* Article header */}
            <div style={styles.articleHeader}>
              <span style={styles.tag}>🐾 Pet Care</span>
              <h1 style={styles.articleTitle}>{tip.title}</h1>
              {formattedDate && (
                <p style={styles.articleMeta}>Published on {formattedDate}</p>
              )}
            </div>

            <hr style={styles.divider} />

            {/* Full article body */}
            {articleLoading ? (
              <div>
                {[100, 92, 97, 85, 90, 78, 95, 88, 100, 75, 93, 80].map((w, i) => (
                  <div
                    key={i}
                    style={{ ...styles.skeletonLine, width: `${w}%`, marginBottom: "12px" }}
                  />
                ))}
              </div>
            ) : fullArticleHtml ? (
              <>
                {articleError && (
                  <p style={styles.errorBanner}>
                    ⚠️ Could not load full article from source — showing RSS excerpt instead.
                  </p>
                )}
                <div
                  className="tip-article-body"
                  dangerouslySetInnerHTML={{ __html: fullArticleHtml }}
                />
              </>
            ) : (
              <div style={styles.emptyContent}>
                <p>No content is available for this article.</p>
                {tip.link && (
                  <a
                    href={tip.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.externalLink}
                  >
                    Read on original site ↗
                  </a>
                )}
              </div>
            )}

            <hr style={{ ...styles.divider, marginTop: "40px" }} />

            {/* Footer nav */}
            <div style={styles.articleFooter}>
              <button onClick={() => navigate("/tips")} style={styles.footerBackBtn}>
                ← Back to all tips
              </button>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                style={styles.scrollTopBtn}
              >
                ↑ Back to top
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* ── Scoped article body styles ── */}
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.45} }

        .tip-article-body {
          font-size: 1rem;
          line-height: 1.9;
          color: #374151;
        }
        .tip-article-body > * + * { margin-top: 1em; }
        .tip-article-body h2 {
          font-size: 1.35rem;
          font-weight: 700;
          color: #111827;
          padding-bottom: 8px;
          border-bottom: 2px solid #ede9fe;
          margin-top: 2em;
          margin-bottom: 0.6em;
        }
        .tip-article-body h3 {
          font-size: 1.1rem;
          font-weight: 700;
          color: #1f2937;
          margin-top: 1.8em;
          margin-bottom: 0.4em;
        }
        .tip-article-body h4 {
          font-size: 1rem;
          font-weight: 600;
          color: #374151;
          margin-top: 1.4em;
        }
        .tip-article-body p { margin: 0 0 1em; }
        .tip-article-body ul,
        .tip-article-body ol {
          padding-left: 1.6em;
          margin: 0 0 1em;
        }
        .tip-article-body li { margin-bottom: 0.5em; }
        .tip-article-body img {
          max-width: 100%;
          border-radius: 10px;
          margin: 16px 0;
          display: block;
          box-shadow: 0 2px 12px rgba(0,0,0,0.1);
        }
        .tip-article-body blockquote {
          border-left: 4px solid #5b5ce6;
          margin: 1.4em 0;
          padding: 12px 20px;
          background: #f5f3ff;
          color: #4b5563;
          border-radius: 0 8px 8px 0;
          font-style: italic;
        }
        .tip-article-body strong { color: #111827; }
        .tip-article-body span {
          color: inherit !important;
          text-decoration: none !important;
          cursor: default !important;
        }
        .tip-article-body table {
          border-collapse: collapse;
          width: 100%;
          margin-bottom: 1.4em;
          font-size: 0.93rem;
        }
        .tip-article-body th,
        .tip-article-body td {
          border: 1px solid #e5e7eb;
          padding: 10px 14px;
          text-align: left;
        }
        .tip-article-body th {
          background: #f5f3ff;
          color: #4b4dd8;
          font-weight: 600;
        }
        .tip-article-body tr:nth-child(even) td { background: #fafafa; }
        .tip-article-body figure { margin: 1.2em 0; }
        .tip-article-body figcaption {
          font-size: 0.8rem;
          color: #9ca3af;
          text-align: center;
          margin-top: 6px;
        }
        .tip-article-body code {
          background: #f3f4f6;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.88em;
          color: #5b5ce6;
        }
        .tip-article-body pre {
          background: #1f2937;
          color: #f9fafb;
          padding: 16px 20px;
          border-radius: 8px;
          overflow-x: auto;
          font-size: 0.88rem;
        }
      `}</style>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f4f6fb",
    fontFamily: "'Segoe UI', system-ui, Arial, sans-serif",
  },
  topBar: {
    background: "linear-gradient(135deg, #5b5ce6 0%, #8bbcf3 100%)",
    padding: "14px 24px",
    boxShadow: "0 2px 8px rgba(91,92,230,0.2)",
  },
  topBarInner: {
    maxWidth: "1160px",
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
  },
  backBtn: {
    background: "rgba(255,255,255,0.2)",
    border: "1px solid rgba(255,255,255,0.4)",
    color: "#fff",
    borderRadius: "8px",
    padding: "7px 16px",
    cursor: "pointer",
    fontSize: "0.88rem",
    fontWeight: "600",
    backdropFilter: "blur(4px)",
    transition: "background 0.2s",
    whiteSpace: "nowrap",
  },
  breadcrumb: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "0.85rem",
    color: "rgba(255,255,255,0.7)",
    flexWrap: "wrap",
  },
  breadcrumbLink: {
    color: "rgba(255,255,255,0.9)",
    cursor: "pointer",
    fontWeight: "600",
    textDecoration: "underline",
  },
  sep: { color: "rgba(255,255,255,0.5)" },
  breadcrumbCurrent: { color: "rgba(255,255,255,0.75)" },
  bodyWrap: {
    maxWidth: "1160px",
    margin: "32px auto",
    padding: "0 20px 60px",
    display: "grid",
    gridTemplateColumns: "240px 1fr",
    gap: "28px",
    alignItems: "start",
  },
  sidebar: {
    background: "#fff",
    borderRadius: "14px",
    padding: "24px 20px",
    boxShadow: "0 2px 12px rgba(15,23,42,0.07)",
    position: "sticky",
    top: "20px",
  },
  sidebarHeading: {
    margin: "0 0 10px",
    fontSize: "0.75rem",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#5b5ce6",
  },
  sidebarTitle: {
    margin: "0 0 6px",
    fontSize: "0.88rem",
    fontWeight: "600",
    color: "#1f2937",
    lineHeight: "1.45",
  },
  sidebarMeta: { margin: 0, fontSize: "0.78rem", color: "#9ca3af" },
  sidebarNote: {
    margin: "0 0 16px",
    fontSize: "0.78rem",
    color: "#6b7280",
    lineHeight: "1.55",
  },
  sidebarBackBtn: {
    width: "100%",
    padding: "9px 0",
    background: "#f5f3ff",
    border: "1px solid #ede9fe",
    borderRadius: "8px",
    color: "#5b5ce6",
    fontWeight: "600",
    fontSize: "0.85rem",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  main: { minWidth: 0 },
  articleCard: {
    background: "#fff",
    borderRadius: "16px",
    padding: "40px 48px",
    boxShadow: "0 2px 16px rgba(15,23,42,0.08)",
  },
  articleHeader: { marginBottom: "20px" },
  tag: {
    display: "inline-block",
    padding: "4px 12px",
    background: "rgba(91,92,230,0.1)",
    color: "#5b5ce6",
    borderRadius: "20px",
    fontSize: "0.78rem",
    fontWeight: "600",
    marginBottom: "14px",
  },
  articleTitle: {
    margin: "0 0 10px",
    fontSize: "2rem",
    fontWeight: "800",
    color: "#111827",
    lineHeight: "1.25",
  },
  articleMeta: { margin: 0, fontSize: "0.87rem", color: "#9ca3af" },
  divider: { border: "none", borderTop: "1px solid #f3f4f6", margin: "24px 0" },
  emptyContent: { textAlign: "center", padding: "40px 0", color: "#9ca3af" },
  externalLink: {
    display: "inline-block",
    marginTop: "12px",
    padding: "10px 20px",
    background: "#5b5ce6",
    color: "#fff",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "0.9rem",
    textDecoration: "none",
  },
  errorBanner: {
    margin: "0 0 20px",
    padding: "10px 16px",
    background: "#fff7ed",
    border: "1px solid #fed7aa",
    borderRadius: "8px",
    color: "#92400e",
    fontSize: "0.85rem",
  },
  articleFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
    marginTop: "8px",
  },
  footerBackBtn: {
    padding: "10px 22px",
    background: "#5b5ce6",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "0.9rem",
    cursor: "pointer",
  },
  scrollTopBtn: {
    padding: "10px 20px",
    background: "#f9fafb",
    color: "#6b7280",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontWeight: "500",
    fontSize: "0.88rem",
    cursor: "pointer",
  },
  skeletonBack: {
    height: "34px",
    width: "130px",
    background: "rgba(255,255,255,0.3)",
    borderRadius: "8px",
    animation: "pulse 1.4s ease infinite",
  },
  skeletonLine: {
    height: "13px",
    background: "#ececec",
    borderRadius: "4px",
    animation: "pulse 1.4s ease infinite",
  },
};

export default TipDetail;