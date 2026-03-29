// import { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// export default function RegisterPage() {
//   const [form, setForm]       = useState({ name: "", email: "", password: "" });
//   const [showPass, setShowPass] = useState(false);
//   const [error, setError]       = useState("");
//   const [loading, setLoading]   = useState(false);
//   const { register } = useAuth();
//   const navigate = useNavigate();

//   const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     if (form.password.length < 6) {
//       setError("Password must be at least 6 characters");
//       return;
//     }
//     setLoading(true);
//     try {
//       await register(form);
//       navigate("/dashboard");
//     } catch (err) {
//       setError(err.response?.data?.message || "Registration failed. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={styles.wrapper}>
//       <div style={styles.card}>
//         <h2 style={styles.title}>🎟 Let's get you set up</h2>
//         <p style={styles.sub}>Create your free CampusTick account</p>
//         {error && <div style={styles.error}>{error}</div>}
//         <form onSubmit={handleSubmit} style={styles.form}>
//           <label style={styles.label}>Your Name</label>
//           <input name="name" placeholder="e.g. Jay Prakash" value={form.name} onChange={handleChange} style={styles.input} required />
//           <label style={styles.label}>Email</label>
//           <input name="email" type="email" placeholder="you@college.edu" value={form.email} onChange={handleChange} style={styles.input} required />
//           <label style={styles.label}>Password</label>
//           <div style={styles.passWrap}>
//             <input name="password" type={showPass ? "text" : "password"} placeholder="Min. 6 characters" value={form.password} onChange={handleChange} style={{ ...styles.input, margin: 0, flex: 1, border: "none" }} required />
//             <button type="button" onClick={() => setShowPass(!showPass)} style={styles.eyeBtn}>
//               {showPass ? "🙈" : "👁️"}
//             </button>
//           </div>
//           <button type="submit" style={styles.btn} disabled={loading}>
//             {loading ? "Setting up your account…" : "Create Account"}
//           </button>
//         </form>
//         <p style={styles.footer}>Already on CampusTick? <Link to="/login">Sign in</Link></p>
//       </div>
//     </div>
//   );
// }

// const styles = {
//   wrapper: { minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" },
//   card: { width: "100%", maxWidth: "400px", padding: "2rem", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
//   title: { margin: "0 0 0.25rem", fontSize: "1.5rem" },
//   sub: { margin: "0 0 1.5rem", color: "#666", fontSize: "0.9rem" },
//   form: { display: "flex", flexDirection: "column", gap: "0.6rem" },
//   label: { fontSize: "0.85rem", fontWeight: "600", color: "#333" },
//   input:    { padding: "0.65rem 0.75rem", borderRadius: "6px", border: "1px solid #ccc", fontSize: "1rem" },
//   passWrap: { display: "flex", alignItems: "center", border: "1px solid #ccc", borderRadius: "6px", overflow: "hidden" },
//   eyeBtn:   { padding: "0 0.75rem", background: "#f8fafc", border: "none", borderLeft: "1px solid #ccc", cursor: "pointer", fontSize: "1rem" },
//   btn: { marginTop: "0.5rem", padding: "0.75rem", background: "#e94560", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "1rem", fontWeight: "600" },
//   error: { background: "#fff0f0", color: "#c0392b", padding: "0.6rem 0.8rem", borderRadius: "6px", fontSize: "0.9rem", marginBottom: "0.5rem" },
//   footer: { marginTop: "1.25rem", textAlign: "center", fontSize: "0.9rem" },
// };


import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // 🔥 CRITICAL

    try {
      await register(form);
      alert("Registered successfully");
    } catch (err) {
      console.error(err);
      alert("Registration failed");
    }
  };

  return (
    <form onSubmit={handleSubmit}> {/* 🔥 MUST be here */}
      <input name="name" onChange={handleChange} required />
      <input name="email" type="email" onChange={handleChange} required />
      <input name="password" type="password" onChange={handleChange} required />

      <button type="submit">Create Account</button>
    </form>
  );
}