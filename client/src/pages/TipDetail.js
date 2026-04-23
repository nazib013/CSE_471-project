import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const TipDetail = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) return <h2>No tip selected</h2>;

  return (
    <div style={{ padding: "20px" }}>
      <button onClick={() => navigate(-1)}>⬅ Back</button>

      <h1>{state.title}</h1>
      <p>{state.contentSnippet}</p>

      <a href={state.link} target="_blank" rel="noreferrer">
        Read full article →
      </a>
    </div>
  );
};

export default TipDetail;
