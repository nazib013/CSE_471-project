import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Tips = () => {
  const [tips, setTips] = useState([]);
  const [filteredTips, setFilteredTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Fetching tips...");

    const fetchTips = async () => {
      try {
        setLoading(true);

        // ✅ NO TOKEN (public API)
        const res = await fetch("http://localhost:5000/api/tips");

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

  // 🔍 SEARCH FUNCTION
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);

    const filtered = tips.filter((item) => {
      const title = item?.title || "";
      const snippet = item?.contentSnippet || "";

      return (
        title.toLowerCase().includes(value.toLowerCase()) ||
        snippet.toLowerCase().includes(value.toLowerCase())
      );
    });

    setFilteredTips(filtered);
  };

  if (loading) return <h2>Loading Tips...</h2>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>🐾 Pet Tips</h1>

      {/* SEARCH BAR */}
      <input
        type="text"
        placeholder="Search pet tips..."
        value={search}
        onChange={handleSearch}
        style={{
          padding: "10px",
          width: "300px",
          marginBottom: "20px",
          borderRadius: "8px",
          border: "1px solid #ccc",
        }}
      />

      {/* RESULTS */}
      {filteredTips.length === 0 ? (
        <p>No tips found</p>
      ) : (
        filteredTips.map((item, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #ddd",
              marginBottom: "15px",
              padding: "10px",
              borderRadius: "8px",
            }}
          >
            <h3>{item.title}</h3>
            <p>{item.contentSnippet || "No description available"}</p>

            {/* ✅ INTERNAL NAVIGATION */}
            <button
              onClick={() => navigate(`/tips/${index}`, { state: item })}
              style={{
                marginTop: "10px",
                padding: "6px 12px",
                cursor: "pointer",
              }}
            >
              Read more →
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default Tips;