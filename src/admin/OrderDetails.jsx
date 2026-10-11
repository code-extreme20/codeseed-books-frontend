
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CreditCard,
  Hash,
  Package,
  RefreshCw,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

function formatDate(date) {
  if (!date) return "Not available";

  return new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatAmount(amount, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format((Number(amount) || 0) / 100);
}

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchOrder() {
    setLoading(true);
    setError("");

    try {
      const token = sessionStorage.getItem("codeseed_admin_token");

      const response = await axios.get(
        `${API_URL}/orders/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrder(response.data.order);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load order details."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <main className="order-details-page">
        <p>Loading order details...</p>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="order-details-page">
        <button
          className="order-back-button"
          onClick={() => navigate("/admin/dashboard/orders")}
        >
          <ArrowLeft size={17} /> Back to Orders
        </button>

        <p className="order-details-error">
          {error || "Order not found."}
        </p>

        <button
          className="order-back-button"
          onClick={fetchOrder}
        >
          <RefreshCw size={16} /> Try again
        </button>
      </main>
    );
  }

  const status = String(order.status || "created").toLowerCase();

  return (
    <main className="order-details-page">
      <div className="order-details-heading">
        <div>
          <button
            className="order-back-button"
            onClick={() => navigate("/admin/dashboard/orders")}
          >
            <ArrowLeft size={17} /> Back to Orders
          </button>

          <h1>Order Details</h1>
          <p>View payment and purchase information.</p>
        </div>

        <span className={`order-detail-status ${status}`}>
          {status.toUpperCase()}
        </span>
      </div>

      <section className="order-details-grid">
        <article className="order-detail-card">
          <div className="order-detail-icon">
            <Package size={21} />
          </div>
          <p>Order Amount</p>
          <h2>{formatAmount(order.amount, order.currency)}</h2>
          <span>Payment currency: {order.currency || "INR"}</span>
        </article>

        <article className="order-detail-card">
          <div className="order-detail-icon">
            <BookOpen size={21} />
          </div>
          <p>Book / Product</p>
          <h2>{order.productTitle || "Unknown product"}</h2>
          <span>Product purchased</span>
        </article>

        <article className="order-detail-card">
          <div className="order-detail-icon">
            <Calendar size={21} />
          </div>
          <p>Order Created</p>
          <h2>{formatDate(order.createdAt)}</h2>
          <span>Last updated: {formatDate(order.updatedAt)}</span>
        </article>
      </section>

      <section className="order-information-card">
        <div className="order-information-heading">
          <CreditCard size={21} />
          <h2>Payment Information</h2>
        </div>

        <div className="order-information-row">
          <span>Database Order ID</span>
          <strong>{order.id || id}</strong>
        </div>

        <div className="order-information-row">
          <span>Razorpay Order ID</span>
          <strong>{order.razorpayOrderId || "Not available"}</strong>
        </div>

        <div className="order-information-row">
          <span>Razorpay Payment ID</span>
          <strong>{order.razorpayPaymentId || "Not paid yet"}</strong>
        </div>

        <div className="order-information-row">
          <span>Book ID</span>
          <strong>{order.bookId || "Not available"}</strong>
        </div>

        <div className="order-information-row">
          <span>Payment Status</span>
          <strong className={`order-detail-status ${status}`}>
            {status.toUpperCase()}
          </strong>
        </div>

        <div className="order-information-row">
          <span>Last Updated</span>
          <strong>{formatDate(order.updatedAt)}</strong>
        </div>
      </section>
    </main>
  );
}