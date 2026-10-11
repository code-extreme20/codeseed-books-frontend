
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Search,
  RefreshCw,
  ShoppingBag,
  IndianRupee,
  CheckCircle2,
  Clock3,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Eye,
  Download,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

function getAuthConfig() {
  const token = sessionStorage.getItem("codeseed_admin_token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

function formatMoney(amount, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format((Number(amount) || 0) / 100);
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function StatusBadge({ status }) {
  const config = {
    paid: { label: "Paid", icon: CheckCircle2 },
    created: { label: "Pending", icon: Clock3 },
    failed: { label: "Failed", icon: XCircle },
  };

  const item = config[status] || {
    label: status || "Unknown",
    icon: Clock3,
  };

  const Icon = item.icon;

  return (
    <span className={`orders-status orders-status-${status || "unknown"}`}>
      <Icon size={14} />
      {item.label}
    </span>
  );
}

function escapeCSV(value) {
  let text = value == null ? "" : String(value);

  // Prevent text values from being interpreted as spreadsheet formulas.
  if (/^[\s]*[=+\-@]/.test(text)) {
    text = `'${text}`;
  }

  return `"${text.replace(/"/g, '""')}"`;
}

export default function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [exportMessage, setExportMessage] = useState("");

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(`${API_URL}/orders`, {
        ...getAuthConfig(),
        params: {
          search,
          status,
          page: pagination.page,
          limit: pagination.limit,
        },
      });

      if (!response.data?.success) {
        throw new Error("Could not load orders.");
      }

      setOrders(response.data.orders || []);

      setPagination((previous) => ({
        ...previous,
        ...(response.data.pagination || {}),
      }));
    } catch (err) {
      console.error("Orders loading error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load orders. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [search, status, pagination.page, pagination.limit]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  function handleSearch(event) {
    event.preventDefault();

    setPagination((previous) => ({
      ...previous,
      page: 1,
    }));

    setSearch(searchInput.trim());
  }

  function handleStatusChange(event) {
    setStatus(event.target.value);

    setPagination((previous) => ({
      ...previous,
      page: 1,
    }));
  }

  function openOrderDetails(order) {
    if (!order.id) {
      setError("This order does not have a valid database ID.");
      return;
    }

    navigate(
      `/admin/dashboard/orders/${encodeURIComponent(order.id)}`
    );
  }

  async function handleExportCSV() {
    setExporting(true);
    setError("");
    setExportMessage("");

    try {
      const response = await axios.get(`${API_URL}/orders/export`, {
        ...getAuthConfig(),
        params: {
          search,
          status,
        },
      });

      if (!response.data?.success) {
        throw new Error("Unable to export orders.");
      }

      const exportedOrders = response.data.orders || [];

      if (exportedOrders.length === 0) {
        setExportMessage("No matching orders available to export.");
        return;
      }

      const columns = [
        ["Database Order ID", "orderId"],
        ["Razorpay Order ID", "razorpayOrderId"],
        ["Razorpay Payment ID", "razorpayPaymentId"],
        ["Product", "productTitle"],
        ["Amount in Paise", "amount"],
        ["Currency", "currency"],
        ["Payment Status", "status"],
        ["Created At", "createdAt"],
        ["Updated At", "updatedAt"],
      ];

      const csvRows = [
        columns
          .map(([label]) => escapeCSV(label))
          .join(","),

        ...exportedOrders.map((order) =>
          columns
            .map(([, key]) => escapeCSV(order[key]))
            .join(",")
        ),
      ];

      // UTF-8 BOM improves compatibility with Microsoft Excel.
      const csvContent = "\uFEFF" + csvRows.join("\r\n");

      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `codeseed-orders-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => URL.revokeObjectURL(url), 1000);

      setExportMessage(
        `${exportedOrders.length} orders exported successfully.`
      );
    } catch (err) {
      console.error("CSV export error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to export orders."
      );
    } finally {
      setExporting(false);
    }
  }

  const paidOnPage = orders.filter(
    (order) => order.status === "paid"
  ).length;

  const revenueOnPage = orders
    .filter((order) => order.status === "paid")
    .reduce(
      (total, order) => total + (Number(order.amount) || 0),
      0
    );

  return (
    <main className="admin-dashboard orders-page">
      <div className="admin-page-heading">
        <div>
          <span className="admin-eyebrow">STORE MANAGEMENT</span>
          <h1>Orders</h1>
          <p className="admin-muted">
            Track ebook purchases and payment statuses.
          </p>
        </div>

        <div className="orders-header-actions">
          <button
            type="button"
            className="orders-export-button"
            onClick={handleExportCSV}
            disabled={exporting}
          >
            <Download size={16} />
            {exporting ? "Exporting..." : "Export CSV"}
          </button>

          <button
            type="button"
            className="admin-refresh"
            onClick={loadOrders}
            disabled={loading}
          >
            <RefreshCw
              size={16}
              className={loading ? "orders-refreshing" : ""}
            />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="admin-error" role="alert">
          {error}
        </div>
      )}

      {exportMessage && (
        <div className="orders-export-message" role="status">
          {exportMessage}
        </div>
      )}

      <section className="admin-stat-grid orders-summary">
        <article className="admin-stat-card">
          <span className="admin-stat-icon">
            <ShoppingBag size={21} />
          </span>
          <p>Matching orders</p>
          <h2>{loading ? "..." : pagination.total}</h2>
          <small>Orders matching current filters</small>
        </article>

        <article className="admin-stat-card">
          <span className="admin-stat-icon">
            <CheckCircle2 size={21} />
          </span>
          <p>Paid on this page</p>
          <h2>{loading ? "..." : paidOnPage}</h2>
          <small>Verified paid orders on this page</small>
        </article>

        <article className="admin-stat-card">
          <span className="admin-stat-icon">
            <IndianRupee size={21} />
          </span>
          <p>Revenue on this page</p>
          <h2>
            {loading ? "..." : formatMoney(revenueOnPage)}
          </h2>
          <small>Paid orders on the current page only</small>
        </article>
      </section>

      <section className="admin-content-card orders-toolbar">
        <form className="orders-search" onSubmit={handleSearch}>
          <Search size={18} />

          <input
            type="search"
            value={searchInput}
            onChange={(event) =>
              setSearchInput(event.target.value)
            }
            placeholder="Search order ID, payment ID or book..."
            aria-label="Search orders"
          />

          <button type="submit" className="admin-add-button">
            Search
          </button>
        </form>

        <label className="orders-filter">
          <span>Payment status</span>

          <select
            value={status}
            onChange={handleStatusChange}
          >
            <option value="all">All orders</option>
            <option value="paid">Paid</option>
            <option value="created">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </label>
      </section>

      <section className="admin-content-card orders-table-card">
        <div className="orders-table-heading">
          <div>
            <h2>All orders</h2>
            <p className="admin-muted">
              {pagination.total} matching records
            </p>
          </div>

          <Receipt size={23} />
        </div>

        {loading ? (
          <div className="admin-empty-state">
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="admin-empty-state">
            <ShoppingBag size={35} />
            <h3>No orders found</h3>
            <p>
              Try changing the search text or payment-status filter.
            </p>
          </div>
        ) : (
          <div className="orders-table-wrap">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Book / Order</th>
                  <th>Payment ID</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Order date</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <strong className="orders-book-title">
                        {order.productTitle || "Untitled ebook"}
                      </strong>

                      <small className="orders-id">
                        {order.razorpayOrderId ||
                          "Order ID unavailable"}
                      </small>
                    </td>

                    <td>
                      <span className="orders-payment-id">
                        {order.razorpayPaymentId || "Not paid yet"}
                      </span>
                    </td>

                    <td>
                      <strong>
                        {formatMoney(
                          order.amount,
                          order.currency
                        )}
                      </strong>
                    </td>

                    <td>
                      <StatusBadge status={order.status} />
                    </td>

                    <td>{formatDate(order.createdAt)}</td>

                    <td>
                      <button
                        type="button"
                        className="order-view-button"
                        onClick={() => openOrderDetails(order)}
                        disabled={!order.id}
                        aria-label={`View details for ${
                          order.productTitle || "order"
                        }`}
                      >
                        <Eye size={16} />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="orders-pagination">
          <span>
            Page {pagination.page} of{" "}
            {Math.max(1, pagination.totalPages)}
          </span>

          <div>
            <button
              type="button"
              className="admin-cancel-button"
              disabled={loading || pagination.page <= 1}
              onClick={() =>
                setPagination((previous) => ({
                  ...previous,
                  page: previous.page - 1,
                }))
              }
            >
              <ChevronLeft size={17} />
              Previous
            </button>

            <button
              type="button"
              className="admin-cancel-button"
              disabled={
                loading ||
                pagination.page >= pagination.totalPages ||
                pagination.totalPages === 0
              }
              onClick={() =>
                setPagination((previous) => ({
                  ...previous,
                  page: previous.page + 1,
                }))
              }
            >
              Next
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
