import { BrowserRouter, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes/AppRoutes";
import Navbar from "./components/Navbar";
import { useEffect, useRef, useState } from "react";

function MouseGlow() {
  useEffect(() => {
    let rafId = null;

    const onMove = (e) => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        document.body.style.setProperty("--mx", `${e.clientX}px`);
        document.body.style.setProperty("--my", `${e.clientY}px`);
        rafId = null;
      });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return null;
}

function ClickSound() {
  const [on, setOn] = useState(() => localStorage.getItem("clickSound") !== "off");
  const ctxRef = useRef(null);

  // Lazily create AudioContext on first user gesture (browser requirement)
  const getCtx = () => {
    if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return ctxRef.current;
  };

  const playClick = () => {
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);        // low volume
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.06);
    } catch {
      // AudioContext blocked or unavailable — fail silently
    }
  };

  useEffect(() => {
    const handler = (e) => {
      if (!on) return;
      const tag = e.target?.closest("button, a");
      if (tag) playClick();
    };
    document.addEventListener("click", handler, { capture: true });
    return () => document.removeEventListener("click", handler, { capture: true });
  }, [on]);

  const toggle = () => {
    const next = !on;
    setOn(next);
    localStorage.setItem("clickSound", next ? "on" : "off");
    if (next) playClick(); // preview the sound when turning on
  };

  return (
    <button
      onClick={toggle}
      title={on ? "Click sound: on" : "Click sound: off"}
      style={{
        position: "fixed",
        bottom: "1.25rem",
        right: "1.25rem",
        zIndex: 200,
        width: "36px",
        height: "36px",
        borderRadius: "50%",
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(15,23,42,0.85)",
        backdropFilter: "blur(8px)",
        cursor: "pointer",
        fontSize: "1rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: on ? 1 : 0.4,
        transition: "opacity 0.2s",
        boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
      }}
    >
      {on ? "🔊" : "🔇"}
    </button>
  );
}

function PageTransition({ children }) {
  const { pathname } = useLocation();
  return (
    <div key={pathname} className="fade-page">
      {children}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MouseGlow />
        <ClickSound />
        <Navbar />
        <main className="main-content">
          <PageTransition>
            <AppRoutes />
          </PageTransition>
        </main>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
