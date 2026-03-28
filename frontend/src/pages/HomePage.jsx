import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const FEATURES = [
  {
    icon: "🎟",
    title: "Easy Ticket Booking",
    desc:  "Browse upcoming campus events and book your spot in seconds. Free or paid — it just works.",
  },
  {
    icon: "📷",
    title: "QR Code Entry",
    desc:  "Every ticket gets a unique QR code. Organizers scan at the gate for instant, fraud-proof verification.",
  },
  {
    icon: "📊",
    title: "Organizer Dashboard",
    desc:  "Create events, track bookings, manage capacity, and scan tickets — all from one place.",
  },
];

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="lp">

      {/* ── HERO ── */}
      <section className="lp__hero">
        <div className="lp__hero-glow" aria-hidden="true" />
        <div className="lp__hero-inner">
          <span className="lp__eyebrow">🎓 Built for campus life</span>
          <div className="hero-text-group">
            <h1 className="lp__heading">CampusTick —</h1>
            <span className="lp__middle-text">Smart Event Ticketing</span>
            <p className="lp__heading lp__heading--sub">for Campuses</p>
          </div>
          <p className="lp__sub">
            Create, manage and book events with QR-based entry<br className="lp__br" />
            and a seamless experience for students and organizers.
          </p>
          <div className="lp__hero-btns">
            <Link to="/events" className="lp__btn lp__btn--primary">
              Explore Events
            </Link>
            <Link
              to={user ? "/dashboard" : "/register"}
              className="lp__btn lp__btn--ghost"
            >
              {user ? "Go to Dashboard" : "Get Started"}
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="lp__features fade-in">
        <p className="lp__section-label">Why CampusTick?</p>
        <h2 className="lp__section-heading">Everything you need, nothing you don't</h2>
        <div className="lp__feature-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="lp__feature-card card">
              <span className="lp__feature-icon">{f.icon}</span>
              <h3 className="lp__feature-title">{f.title}</h3>
              <p className="lp__feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="lp__cta fade-in fade-in--delay-1">
        <div className="lp__cta-inner card">
          <h2 className="lp__cta-heading">Ready to experience CampusTick?</h2>
          <p className="lp__cta-sub">
            Join hundreds of students and organizers already on the platform.
          </p>
          <Link to="/events" className="lp__btn lp__btn--primary lp__btn--lg">
            Browse Events →
          </Link>
        </div>
      </section>

    </div>
  );
}
