import React, { useState, useEffect } from "react";

export default function LiveClock({ style = {}, className = "" }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className={`mono ${className}`} style={{ fontFamily: "'JetBrains Mono',monospace", ...style }}>
      {time.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}
    </span>
  );
}