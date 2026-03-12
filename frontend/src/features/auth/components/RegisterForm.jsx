import { useState } from "react";
import { useAuth } from "../authSlice";
import { useNavigate } from "react-router-dom";

export default function RegisterForm() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
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

      await register(form);

      navigate("/login");
    } catch (err) {
      setError("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submitHandler} className="space-y-4">
      <div>
        <label>Name</label>
        <input
          type="text"
          name="name"
          required
          onChange={handleChange}
          className="input"
        />
      </div>

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

      <div>
        <label>Role</label>
        <select name="role" onChange={handleChange} className="input">
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
          <option value="DELIVERY">DELIVERY</option>
        </select>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button disabled={loading} className="w-full btn-primary">
        {loading ? "Registering..." : "Register"}
      </button>
    </form>
  );
}
