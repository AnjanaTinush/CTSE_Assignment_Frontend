import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="sidebar">
      <h3 className="sidebar-title">Dashboard</h3>

      <nav className="sidebar-nav">
        <Link to="/">Home</Link>

        <Link to="/products">Products</Link>

        <Link to="/orders">Orders</Link>
      </nav>
    </div>
  );
}
