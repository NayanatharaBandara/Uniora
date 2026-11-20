
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { LogIn, UserPlus } from "lucide-react";
import "../styles/login.css";

function Login() {
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      if (isRegister) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name
            }
          }
        });

        if (error) throw error;

        if (data.session) {
          navigate("/account");
        } else {
          setMessage(
            "Registration successful! Please check your email to confirm your account before logging in."
          );
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        navigate("/account");
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-icon">
          {isRegister ? <UserPlus size={30} /> : <LogIn size={30} />}
        </div>

        <h1>{isRegister ? "Create Your Account" : "Welcome Back!"}</h1>

        <p>
          {isRegister
            ? "Join the UNIORA student community."
            : "Sign in to continue your university journey."}
        </p>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </>
          )}

          <label>Email Address</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />

          {error && <div className="login-error">{error}</div>}
          {message && <div className="login-success">{message}</div>}

          <button type="submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : isRegister
                ? "Create Account"
                : "Sign In"}
          </button>
        </form>

        <div className="login-switch">
          {isRegister
            ? "Already have an account?"
            : "Don't have an account?"}

          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
              setMessage("");
            }}
          >
            {isRegister ? "Sign In" : "Register"}
          </button>
        </div>

        <Link to="/" className="login-home">
          Back to Home
        </Link>

      </div>
    </div>
  );
}

export default Login;
