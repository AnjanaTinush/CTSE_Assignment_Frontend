import { useEffect, useState } from "react";
import Navbar from "../../../components/layout/Navbar";
import Sidebar from "../../../components/layout/Sidebar";
import Footer from "../../../components/layout/Footer";
import { ProductService } from "../../../services/product.service";
import { OrderService } from "../../../services/order.service";

export default function Dashboard() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const products = await ProductService.getAllProducts();
        const orders = await OrderService.getAllOrders();

        setStats({
          products: products.length || products.products?.length || 0,
          orders: orders.length || orders.orders?.length || 0,
        });
      } catch (err) {
        console.log(err);
      }
    };

    loadStats();
  }, []);

  return (
    <div className="layout">
      <Sidebar />

      <div className="main">
        <Navbar />

        <div className="dashboard">
          <h1>System Dashboard</h1>

          <div className="dashboard-cards">
            <div className="card">
              <h3>Total Products</h3>
              <p>{stats.products}</p>
            </div>

            <div className="card">
              <h3>Total Orders</h3>
              <p>{stats.orders}</p>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
