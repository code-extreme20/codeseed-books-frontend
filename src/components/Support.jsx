import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Headset,
  LoaderCircle,
  Send,
  ShieldCheck,
} from "lucide-react";
import "./Support.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const initialForm = {
  name: "",
  email: "",
  category: "PDF Download",
  orderReference: "",
  message: "",
};

export default function Support() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/support`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to submit your request.");
      }

      setResult(data.ticket);
      setForm(initialForm);
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Server se connection nahi ho paaya. Please try again."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="support-page">
      <header className="support-topbar">
        <Link to="/" className="support-brand">
          <span className="support-brand-icon">&lt;/&gt;</span>
          CodeSeed
        </Link>
        <Link to="/" className="support-back-link">
          <ArrowLeft size={16} /> Back to library
        </Link>
      </header>

      <section className="support-content">
        <div className="support-heading">
          <span className="support-eyebrow">
            <Headset size={16} /> CODESEED CUSTOMER CARE
          </span>
          <h1>How can we <span>help you?</span></h1>
          <p>
            Tell us what happened. Our support team will have the details
            needed to review your request.
          </p>
        </div>

        <div className="support-layout">
          <aside className="support-info">
            <div className="support-info-icon">
              <Headset size={27} />
            </div>
            <h2>We're here to help.</h2>
            <p>
              Having trouble with a payment, order, or ebook download?
              Submit a support ticket with the details.
            </p>

            <div className="support-info-item">
              <CheckCircle2 size={18} />
              <span>Unique ticket number for your request</span>
            </div>
            <div className="support-info-item">
              <ShieldCheck size={18} />
              <span>Your request is stored securely on our server</span>
            </div>

            <div className="support-contact">
              <span>Support email</span>
              <a href="mailto:loccasharma@gmail.com">
                loccasharma@gmail.com
              </a>
            </div>
          </aside>

          <section className="support-form-card">
            {result ? (
              <div className="support-success">
                <CheckCircle2 size={52} />
                <h2>Ticket submitted!</h2>
                <p>Your support request has been recorded.</p>
                <div className="support-ticket-number">
                  <span>Your ticket number</span>
                  <strong>{result.ticketNumber}</strong>
                </div>
                <p className="support-status">
                  Status: <strong>{result.status}</strong>
                </p>
                <button
                  type="button"
                  className="support-submit"
                  onClick={() => setResult(null)}
                >
                  Submit another request
                </button>
              </div>
            ) : (
              <>
                <div className="support-form-heading">
                  <h2>Submit a ticket</h2>
                  <p>Fields marked * are required.</p>
                </div>

                {error && (
                  <div className="support-error" role="alert">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="support-form">
                  <div className="support-field-row">
                    <label>
                      Full name *
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        maxLength={100}
                        autoComplete="name"
                        required
                        placeholder="Your full name"
                      />
                    </label>

                    <label>
                      Email address *
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        maxLength={254}
                        autoComplete="email"
                        required
                        placeholder="you@example.com"
                      />
                    </label>
                  </div>

                  <label>
                    Issue category *
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      required
                    >
                      <option>Payment Issue</option>
                      <option>PDF Download</option>
                      <option>Order Query</option>
                      <option>Refund Request</option>
                      <option>Other</option>
                    </select>
                  </label>

                  <label>
                    Order reference <span>(optional)</span>
                    <input
                      name="orderReference"
                      value={form.orderReference}
                      onChange={handleChange}
                      maxLength={150}
                      placeholder="Your order ID, if available"
                    />
                  </label>

                  <label>
                    Describe your issue *
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      minLength={10}
                      maxLength={3000}
                      rows={6}
                      required
                      placeholder="Explain the issue so we can help you..."
                    />
                    <small>{form.message.length}/3000 characters</small>
                  </label>

                  <p className="support-privacy-note">
                    Never include passwords, card numbers, CVV, or other
                    sensitive payment information.
                  </p>

                  <button
                    type="submit"
                    className="support-submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <><LoaderCircle className="support-spinner" size={18} /> Submitting...</>
                    ) : (
                      <>Submit support ticket <Send size={17} /></>
                    )}
                  </button>
                </form>
              </>
            )}
          </section>
        </div>
      </section>

      <footer className="support-page-footer">
        © {new Date().getFullYear()} CodeSeed · Customer Support
      </footer>
    </main>
  );
}