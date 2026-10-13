
import { useCallback, useEffect, useState } from "react";
import {
  Headset,
  RefreshCw,
  Search,
  Clock3,
  CheckCircle2,
  AlertCircle,
  Send,
  ArrowLeft,
  LoaderCircle,
} from "lucide-react";
import "./admin.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const STATUSES = ["open", "in_progress", "resolved", "closed"];
const PRIORITIES = ["low", "normal", "high"];

function formatDate(date) {
  if (!date) return "—";
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime())
    ? "—"
    : parsed.toLocaleString();
}

function labelStatus(status) {
  return (status || "open")
    .replace("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function SupportTickets() {
  const [tickets, setTickets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [search, setSearch] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const token = sessionStorage.getItem("codeseed_admin_token");

  const request = useCallback(
    async (path, options = {}) => {
      const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
          ...(options.body
            ? { "Content-Type": "application/json" }
            : {}),
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message || `Request failed (${response.status})`
        );
      }

      return data;
    },
    [token]
  );

  const loadTickets = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (categoryFilter) params.set("category", categoryFilter);

      const query = params.toString();
      const data = await request(
        `/support${query ? `?${query}` : ""}`
      );

      const list = Array.isArray(data.tickets)
        ? data.tickets
        : Array.isArray(data.data)
          ? data.data
          : [];

      setTickets(list);
    } catch (err) {
      setError(err.message || "Unable to load support tickets.");
    } finally {
      setLoading(false);
    }
  }, [request, statusFilter, categoryFilter]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  async function openTicket(id) {
    setDetailLoading(true);
    setError("");
    setNotice("");

    try {
      const data = await request(`/support/${id}`);
      const ticket = data.ticket || data.data;

      if (!ticket) {
        throw new Error("Ticket details were not returned by the API.");
      }

      setSelected(ticket);
      setReply("");
    } catch (err) {
      setError(err.message || "Unable to load ticket details.");
    } finally {
      setDetailLoading(false);
    }
  }

  async function updateTicket(field, value) {
    if (!selected) return;

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const data = await request(`/support/${selected._id}`, {
        method: "PATCH",
        body: JSON.stringify({ [field]: value }),
      });

      const updated = data.ticket || data.data;

      setSelected((current) => ({
        ...current,
        ...(updated || { [field]: value }),
      }));

      setNotice("Ticket updated successfully.");
      await loadTickets();
    } catch (err) {
      setError(err.message || "Unable to update ticket.");
    } finally {
      setSaving(false);
    }
  }

  async function sendReply(event) {
    event.preventDefault();

    if (!selected || reply.trim().length === 0) return;

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const data = await request(
        `/support/${selected._id}/replies`,
        {
          method: "POST",
          body: JSON.stringify({ message: reply.trim() }),
        }
      );

      const updated = data.ticket || data.data;

      if (updated) {
        setSelected(updated);
      } else {
        await openTicket(selected._id);
      }

      setReply("");
      setNotice("Reply submitted successfully.");
      await loadTickets();
    } catch (err) {
      setError(err.message || "Unable to send reply.");
    } finally {
      setSaving(false);
    }
  }

  const filteredTickets = tickets.filter((ticket) => {
    const query = search.toLowerCase().trim();

    return (
      !query ||
      [
        ticket.ticketNumber,
        ticket.name,
        ticket.email,
        ticket.orderReference,
        ticket.message,
      ].some((value) =>
        String(value || "").toLowerCase().includes(query)
      )
    );
  });

  const counts = {
    open: tickets.filter((ticket) => ticket.status === "open").length,
    inProgress: tickets.filter(
      (ticket) => ticket.status === "in_progress"
    ).length,
    resolved: tickets.filter(
      (ticket) => ticket.status === "resolved"
    ).length,
  };

  return (
    <div className="st-page">
      <div className="st-header">
        <div>
          <div className="st-eyebrow">
            <Headset size={16} /> CUSTOMER CARE
          </div>
          <h1>Support Tickets</h1>
          <p>Review customer issues and manage support requests.</p>
        </div>

        <button
          type="button"
          className="st-refresh"
          onClick={loadTickets}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="st-alert st-alert-error" role="alert">
          <AlertCircle size={17} />
          <span>{error}</span>
        </div>
      )}

      {notice && (
        <div className="st-alert st-alert-success" role="status">
          <CheckCircle2 size={17} />
          <span>{notice}</span>
        </div>
      )}

      <div className="st-stats">
        <div className="st-stat">
          <span>Open</span>
          <strong>{counts.open}</strong>
          <Clock3 size={20} />
        </div>
        <div className="st-stat">
          <span>In progress</span>
          <strong>{counts.inProgress}</strong>
          <Headset size={20} />
        </div>
        <div className="st-stat">
          <span>Resolved</span>
          <strong>{counts.resolved}</strong>
          <CheckCircle2 size={20} />
        </div>
      </div>

      <div className="st-workspace">
        <section className="st-list-panel">
          <div className="st-list-heading">
            <h2>All tickets</h2>
            <span>{filteredTickets.length}</span>
          </div>

          <div className="st-search">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tickets..."
              aria-label="Search tickets"
            />
          </div>

          <div className="st-filters">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by status"
            >
              <option value="">All statuses</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {labelStatus(status)}
                </option>
              ))}
            </select>

            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(event.target.value)
              }
              aria-label="Filter by category"
            >
              <option value="">All categories</option>
              {[
                "Payment Issue",
                "PDF Download",
                "Order Query",
                "Refund Request",
                "Other",
              ].map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="st-empty">
              <LoaderCircle className="st-spin" size={25} />
              <p>Loading tickets...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="st-empty">
              <Headset size={28} />
              <p>No support tickets found.</p>
              <span>Try changing the filters or refresh the list.</span>
            </div>
          ) : (
            <div className="st-ticket-list">
              {filteredTickets.map((ticket) => (
                <button
                  type="button"
                  key={ticket._id}
                  className={`st-ticket-item ${
                    selected?._id === ticket._id ? "active" : ""
                  }`}
                  onClick={() => openTicket(ticket._id)}
                >
                  <div className="st-ticket-item-top">
                    <strong>
                      {ticket.ticketNumber || "Support ticket"}
                    </strong>
                    <span className={`st-status st-status-${ticket.status}`}>
                      {labelStatus(ticket.status)}
                    </span>
                  </div>

                  <span className="st-customer-name">
                    {ticket.name}
                  </span>
                  <span className="st-ticket-category">
                    {ticket.category}
                  </span>
                  <span className="st-ticket-preview">
                    {ticket.message}
                  </span>
                  <span className="st-ticket-date">
                    {formatDate(ticket.createdAt)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="st-detail-panel">
          {detailLoading ? (
            <div className="st-empty">
              <LoaderCircle className="st-spin" size={25} />
              <p>Loading ticket details...</p>
            </div>
          ) : !selected ? (
            <div className="st-empty st-detail-placeholder">
              <Headset size={38} />
              <h2>Select a ticket</h2>
              <p>Choose a ticket from the list to view its details.</p>
            </div>
          ) : (
            <>
              <div className="st-detail-heading">
                <button
                  type="button"
                  className="st-back-button"
                  onClick={() => setSelected(null)}
                >
                  <ArrowLeft size={16} /> Back to list
                </button>

                <span className="st-ticket-id">
                  {selected.ticketNumber}
                </span>
                <h2>{selected.category}</h2>
                <p>Created {formatDate(selected.createdAt)}</p>
              </div>

              <div className="st-detail-controls">
                <label>
                  Status
                  <select
                    value={selected.status || "open"}
                    disabled={saving}
                    onChange={(event) =>
                      updateTicket("status", event.target.value)
                    }
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {labelStatus(status)}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Priority
                  <select
                    value={selected.priority || "normal"}
                    disabled={saving}
                    onChange={(event) =>
                      updateTicket("priority", event.target.value)
                    }
                  >
                    {PRIORITIES.map((priority) => (
                      <option key={priority} value={priority}>
                        {labelStatus(priority)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="st-customer-card">
                <h3>Customer details</h3>
                <p><strong>Name:</strong> {selected.name}</p>
                <p><strong>Email:</strong> {selected.email}</p>
                <p>
                  <strong>Order reference:</strong>{" "}
                  {selected.orderReference || "Not provided"}
                </p>
              </div>

              <div className="st-message-card">
                <h3>Customer message</h3>
                <p>{selected.message}</p>
              </div>

              <div className="st-replies">
                <h3>Conversation</h3>

                {(!selected.replies || selected.replies.length === 0) && (
                  <p className="st-no-replies">
                    No replies yet. You can send the first reply below.
                  </p>
                )}

                {(selected.replies || []).map((item, index) => (
                  <article
                    className={`st-reply ${
                      item.sender === "admin" ? "st-reply-admin" : ""
                    }`}
                    key={item._id || `${item.sender}-${index}`}
                  >
                    <div className="st-reply-meta">
                      <strong>
                        {item.sender === "admin"
                          ? item.adminName || "Admin"
                          : "Customer"}
                      </strong>
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                    <p>{item.message}</p>
                  </article>
                ))}
              </div>

              <form className="st-reply-form" onSubmit={sendReply}>
                <label htmlFor="st-reply-message">Reply to customer</label>
                <textarea
                  id="st-reply-message"
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  placeholder="Write a helpful response..."
                  maxLength={3000}
                  minLength={1}
                  rows={4}
                  required
                />
                <div className="st-reply-footer">
                  <span>{reply.length}/3000</span>
                  <button
                    type="submit"
                    className="st-send-button"
                    disabled={saving || !reply.trim()}
                  >
                    {saving ? (
                      <LoaderCircle className="st-spin" size={16} />
                    ) : (
                      <Send size={16} />
                    )}
                    Send reply
                  </button>
                </div>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
