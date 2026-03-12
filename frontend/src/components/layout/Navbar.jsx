import { useAuth } from "../../features/auth/authSlice";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="navbar">
      <div className="navbar-left">
        <h2>CTSE System</h2>
      </div>

      <div className="navbar-right">
        {user && <span className="user-name">{user.name || user.email}</span>}

        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </div>
    </div>
  );
}
