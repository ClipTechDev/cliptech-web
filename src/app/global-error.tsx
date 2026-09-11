"use client";

/**
 * Replaces the root layout when it is the layout itself that failed, so it
 * cannot rely on globals.css having loaded. Everything here is inline, and the
 * colours are CSS system keywords so it stays readable in either theme.
 */
export default function GlobalError() {
  return (
    <html lang="en">
      <body
        style={{
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          margin: 0,
          padding: "1.5rem",
          textAlign: "center",
          background: "Canvas",
          color: "CanvasText",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <h1 style={{ fontSize: "1.25rem", margin: 0 }}>Something went wrong</h1>
        <p style={{ margin: 0, opacity: 0.7 }}>
          ClipTech hit an unexpected error. Reloading usually fixes it.
        </p>
        <a href="/dashboard" style={{ color: "LinkText" }}>
          Reload ClipTech
        </a>
      </body>
    </html>
  );
}
