// import { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// export default function LoginPage() {
//   const [form, setForm]         = useState({ email: "", password: "" });
//   const [showPass, setShowPass] = useState(false);
//   const [error, setError]       = useState("");
//   const [loading, setLoading]   = useState(false);
//   const { login } = useAuth();
//   const navigate  = useNavigate();

//   const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);
//     try {
//       await login(form);
//       navigate("/dashboard");
//     } catch (err) {
//       setError(err.response?.data?.message || "Login failed. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="auth-page">
//       <div className="card auth-card">
//         <div className="auth-logo">🎟</div>
//         <h2 className="auth-title">Hey, welcome back! 👋</h2>
//         <p className="auth-sub">Good to see you. Let's get you in.</p>

//         {error && <div className="alert alert--error">{error}</div>}

//         <form onSubmit={handleSubmit} className="auth-form">
//           <div className="form-group">
//             <label className="form-label">Email</label>
//             <input name="email" type="email" placeholder="you@college.edu"
//               value={form.email} onChange={handleChange} className="form-input" required />
//           </div>

//           <div className="form-group">
//             <label className="form-label">Password</label>
//             <div className="pass-wrap">
//               <input name="password" type={showPass ? "text" : "password"}
//                 placeholder="••••••••" value={form.password} onChange={handleChange}
//                 className="form-input--pass" required />
//               <button type="button" className="pass-eye" onClick={() => setShowPass(!showPass)}>
//                 {showPass ? "🙈" : "👁️"}
//               </button>
//             </div>
//           </div>

//           <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
//             {loading ? "Signing in…" : "Sign In"}
//           </button>
//         </form>

//         <p className="auth-footer">
//           New here? <Link to="/register" className="auth-link">Create an account</Link>
//         </p>
//       </div>
//     </div>
//   );
// }


import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // 🔥 CRITICAL

    try {
      await login(form);
      alert("Login successful");
    } catch (err) {
      console.error(err);
      alert("Login failed");
    }
  };

  return (
    <form onSubmit={handleSubmit}> {/* 🔥 MUST */}
      <input name="email" type="email" onChange={handleChange} required />
      <input name="password" type="password" onChange={handleChange} required />

      <button type="submit">Login</button>
    </form>
  );
}