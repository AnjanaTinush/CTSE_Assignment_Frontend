import { useState } from "react";
import { useAuth } from "../authSlice";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      await login(form);

      navigate("/");
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submitHandler} className="space-y-4">
      <div>
        <label>Email</label>
        <input
          type="email"
          name="email"
          required
          onChange={handleChange}
          className="input"
        />
      </div>

      <div>
        <label>Password</label>
        <input
          type="password"
          name="password"
          required
          onChange={handleChange}
          className="input"
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button disabled={loading} className="w-full btn-primary">
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
