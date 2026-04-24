import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const stripHtml = (html) => {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

const previewWords = (text, wordCount = 75) => {
  const words = text.trim().split(/\s+/);
  if (words.length <= wordCount) return text;
  return words.slice(0, wordCount).join(" ") + "…";
};

const TipCard = ({ item, index, onRead }) => {
  const [hovered, setHovered] = useState(false);

  const rawText = item.fullContent
    ? stripHtml(item.fullContent)
    : item.contentSnippet || "No description available";
  const preview = previewWords(rawText, 75);

  const formattedDate = item.pubDate
    ? new Date(item.pubDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "16px",
        boxShadow: hovered
          ? "0 8px 32px rgba(91,92,230,0.18)"
          : "0 2px 12px rgba(15,23,42,0.08)",
        padding: "28px 28px 22px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        transition: "box-shadow 0.2s, transform 0.2s",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        cursor: "default",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        <span style={styles.tag}>🐾 Pet Care</span>
        {formattedDate && <span style={styles.dateChip}>📅 {formattedDate}</span>}
      </div>

      <h3 style={styles.cardTitle}>{item.title}</h3>

      <p style={styles.cardPreview}>{preview}</p>

      <div style={{ marginTop: "auto", paddingTop: "8px" }}>
        <button
          onClick={() => onRead(index, item)}
          style={{
            ...styles.readBtn,
            ...(hovered ? styles.readBtnHover : {}),
          }}
        >
          Read Full Article →
        </button>
      </div>
    </div>
  );
};

const Tips = () => {
  const [tips, setTips] = useState([]);
  const [filteredTips, setFilteredTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTips = async () => {
      try {
        setLoading(true);

        const res = await fetch(`${API_URL}/api/tips`);

        if (!res.ok) {
          console.error("Failed to fetch tips:", res.status);
          setTips([]);
          setFilteredTips([]);
          return;
        }

        const data = await res.json();
        const articles = data.articles || [];

        setTips(articles);
        setFilteredTips(articles);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTips();
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);

    const filtered = tips.filter((item) => {
      const title = item?.title || "";
      const snippet = item?.contentSnippet || "";
      const fullContent = item?.fullContent || "";

      return (
        title.toLowerCase().includes(value.toLowerCase()) ||
        snippet.toLowerCase().includes(value.toLowerCase()) ||
        stripHtml(fullContent).toLowerCase().includes(value.toLowerCase())
      );
    });

    setFilteredTips(filtered);
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.hero}>
          <div style={styles.heroInner}>
            <h1 style={styles.heroTitle}>🐾 Pet Health Tips</h1>
            <p style={styles.heroSub}>Expert advice for happy, healthy pets</p>
          </div>
        </div>
        <div style={styles.content}>
          <div style={styles.grid}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} style={styles.skeletonCard}>
                <div style={styles.skeletonTag} />
                <div style={styles.skeletonTitle} />
                <div style={styles.skeletonLine} />
                <div style={{ ...styles.skeletonLine, width: "80%" }} />
                <div style={{ ...styles.skeletonLine, width: "60%" }} />
                <div style={styles.skeletonBtn} />
              </div>
            ))}
          </div>
        </div>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.45; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <div style={styles.heroInner}>
          <h1 style={styles.heroTitle}>🐾 Pet Health Tips</h1>
          <p style={styles.heroSub}>
            Expert advice to keep your pets happy, healthy, and thriving
          </p>

          <div style={styles.searchWrap}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Search tips by topic, keyword…"
              value={search}
              onChange={handleSearch}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{
                ...styles.searchInput,
                ...(searchFocused ? styles.searchInputFocus : {}),
              }}
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  setFilteredTips(tips);
                }}
                style={styles.clearBtn}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={styles.content}>
        <div style={styles.resultsRow}>
          <p style={styles.resultsCount}>
            {search
              ? `${filteredTips.length} result${filteredTips.length !== 1 ? "s" : ""} for "${search}"`
              : `${filteredTips.length} articles`}
          </p>
        </div>

        {filteredTips.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyIcon}>🔎</p>
            <h3 style={styles.emptyTitle}>No tips found</h3>
            <p style={styles.emptySub}>Try a different keyword</p>
            <button
              onClick={() => {
                setSearch("");
                setFilteredTips(tips);
              }}
              style={styles.readBtn}
            >
              Clear search
            </button>
          </div>
        ) : (
          <div style={styles.grid}>
            {filteredTips.map((item, index) => (
              <TipCard
                key={index}
                item={item}
                index={index}
                onRead={(idx, tip) => navigate(`/tips/${idx}`, { state: tip })}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }
      `}</style>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    fontFamily: "'Segoe UI', system-ui, Arial, sans-serif",
  },
  hero: {
    background: "linear-gradient(135deg, #5b5ce6 0%, #8bbcf3 100%)",
    padding: "52px 20px 44px",
    textAlign: "center",
  },
  heroInner: {
    maxWidth: "680px",
    margin: "0 auto",
  },
  heroTitle: {
    margin: "0 0 10px",
    fontSize: "2.2rem",
    fontWeight: "800",
    color: "#fff",
    letterSpacing: "-0.5px",
  },
  heroSub: {
    margin: "0 0 28px",
    fontSize: "1.05rem",
    color: "rgba(255,255,255,0.85)",
  },
  searchWrap: {
    position: "relative",
    maxWidth: "520px",
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
  },
  searchIcon: {
    position: "absolute",
    left: "16px",
    fontSize: "1rem",
    pointerEvents: "none",
    zIndex: 1,
  },
  searchInput: {
    width: "100%",
    padding: "14px 44px 14px 44px",
    borderRadius: "50px",
    border: "2px solid rgba(255,255,255,0.5)",
    background: "rgba(255,255,255,0.95)",
    fontSize: "0.97rem",
    outline: "none",
    boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
    transition: "border 0.2s, box-shadow 0.2s",
    color: "#1f2937",
  },
  searchInputFocus: {
    border: "2px solid #5b5ce6",
    boxShadow: "0 4px 24px rgba(91,92,230,0.25)",
  },
  clearBtn: {
    position: "absolute",
    right: "14px",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "0.85rem",
    color: "#888",
    padding: "4px",
  },
  content: {
    maxWidth: "1160px",
    margin: "0 auto",
    padding: "32px 20px 60px",
  },
  resultsRow: {
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  resultsCount: {
    margin: 0,
    fontSize: "0.9rem",
    color: "#333",
    fontWeight: "500",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "24px",
  },
  tag: {
    display: "inline-block",
    padding: "3px 10px",
    background: "rgba(91,92,230,0.1)",
    color: "#5b5ce6",
    borderRadius: "20px",
    fontSize: "0.78rem",
    fontWeight: "600",
  },
  dateChip: {
    fontSize: "0.78rem",
    color: "#9ca3af",
  },
  cardTitle: {
    margin: 0,
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "#1f2937",
    lineHeight: "1.4",
  },
  cardPreview: {
    margin: 0,
    fontSize: "0.9rem",
    color: "#4b5563",
    lineHeight: "1.7",
  },
  readBtn: {
    display: "inline-block",
    padding: "10px 20px",
    background: "#5b5ce6",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "0.88rem",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  readBtnHover: {
    background: "#4b4dd8",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 2px 12px rgba(15,23,42,0.08)",
  },
  emptyIcon: { fontSize: "3rem", margin: "0 0 12px" },
  emptyTitle: { margin: "0 0 8px", color: "#1f2937", fontSize: "1.2rem" },
  emptySub: { margin: "0 0 24px", color: "#9ca3af", fontSize: "0.9rem" },
  skeletonCard: {
    background: "#fff",
    borderRadius: "16px",
    padding: "28px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    boxShadow: "0 2px 12px rgba(15,23,42,0.08)",
  },
  skeletonTag: {
    height: "22px",
    width: "80px",
    background: "#ececec",
    borderRadius: "20px",
    animation: "pulse 1.4s ease infinite",
  },
  skeletonTitle: {
    height: "22px",
    width: "85%",
    background: "#ececec",
    borderRadius: "6px",
    animation: "pulse 1.4s ease infinite",
  },
  skeletonLine: {
    height: "13px",
    width: "100%",
    background: "#ececec",
    borderRadius: "4px",
    animation: "pulse 1.4s ease infinite",
  },
  skeletonBtn: {
    height: "38px",
    width: "140px",
    background: "#ececec",
    borderRadius: "8px",
    marginTop: "8px",
    animation: "pulse 1.4s ease infinite",
  },
};

export default Tips;