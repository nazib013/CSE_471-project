import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const TipDetail = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [tip, setTip] = useState(state || null);

  useEffect(() => {
    if (!tip) {
      fetch("http://localhost:5000/api/tips")
        .then(res => res.json())
        .then(data => {
          const found = data.articles?.[id];
          setTip(found);
        });
    }
  }, [id, tip]);

  if (!tip) return <h2>Loading tip...</h2>;

  return (
    <div style={{ padding: "20px" }}>
      <button onClick={() => navigate(-1)}>⬅ Back</button>

      <h1>{tip.title}</h1>
      <p>{tip.contentSnippet}</p>

      <a href={tip.link} target="_blank" rel="noreferrer">
        Read full article →
      </a>
    </div>
  );
};

export default TipDetail;