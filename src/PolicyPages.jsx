
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Mail, ShieldCheck, ReceiptText } from "lucide-react";

const pageStyle = {
  maxWidth: "850px",
  margin: "0 auto",
  padding: "48px 24px 72px",
  color: "var(--text-primary, #172033)",
  lineHeight: 1.8,
};

function PageHeader({ icon: Icon, title, subtitle }) {
  return (
    <>
      <Link
        to="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "32px",
          color: "inherit",
          textDecoration: "none",
        }}
      >
        <ArrowLeft size={17} /> Back to CodeSeed
      </Link>

      <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
        <Icon size={32} />
        <div>
          <h1 style={{ margin: 0, lineHeight: 1.3 }}>{title}</h1>
          <p style={{ margin: "6px 0 0", opacity: 0.7 }}>{subtitle}</p>
        </div>
      </div>
    </>
  );
}

export function ContactPage() {
  return (
    <main style={pageStyle}>
      <PageHeader
        icon={Mail}
        title="Contact Us"
        subtitle="We're here to help with your CodeSeed purchases."
      />

      <section style={{ marginTop: "32px" }}>
        <h2>Customer Support</h2>
        <p>
          Need help with a payment, ebook purchase, or download?
          Contact our customer support team using the support form.
        </p>
        <Link
          to="/support"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 20px",
            borderRadius: "10px",
            background: "#2563eb",
            color: "#fff",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          <Mail size={18} /> Contact Customer Support
        </Link>
        <p>
          Please include your order reference and a description of the
          issue. Never send passwords, OTPs, or payment card details.
        </p>
      </section>
    </main>
  );
}

export function PrivacyPolicy() {
  return (
    <main style={pageStyle}>
      <PageHeader
        icon={ShieldCheck}
        title="Privacy Policy"
        subtitle="How CodeSeed handles customer information."
      />

      <section style={{ marginTop: "32px" }}>
        <h2>Information We Use</h2>
        <p>
          When you purchase an ebook or contact support, we may process
          information such as your email address, order reference,
          payment status, and support messages.
        </p>

        <h2>How We Use Information</h2>
        <p>
          We use relevant information to process purchases, verify
          payments, provide ebook downloads, send purchase-related
          communications, and respond to customer support requests.
        </p>

        <h2>Payment Processing</h2>
        <p>
          Payments are processed through our payment provider. Payment
          processing is subject to that provider's terms and privacy
          practices. CodeSeed does not need your payment PIN or OTP.
        </p>

        <h2>Security and Retention</h2>
        <p>
          We take reasonable steps to protect customer information and
          retain it only as needed for legitimate business purposes,
          support, security, and applicable legal requirements.
        </p>

        <h2>Your Questions</h2>
        <p>
          For privacy-related questions or requests, contact us through
          our <Link to="/support">Customer Support</Link> page.
        </p>

        <p>
          This policy should be updated if our data collection,
          providers, or practices change.
        </p>
      </section>
    </main>
  );
}

export function RefundPolicy() {
  return (
    <main style={pageStyle}>
      <PageHeader
        icon={ReceiptText}
        title="Refund & Cancellation Policy"
        subtitle="Information about digital ebook purchases."
      />

      <section style={{ marginTop: "32px" }}>
        <h2>Digital Products</h2>
        <p>
          CodeSeed sells digital ebooks delivered electronically.
          Please review the book description and price before placing
          an order.
        </p>

        <h2>Payment or Download Problems</h2>
        <p>
          If your payment was deducted but the order was not completed,
          your download is unavailable, you were charged more than once,
          or the delivered file is incorrect or corrupted, contact
          Customer Support so we can investigate.
        </p>

        <h2>Refund Requests</h2>
        <p>
          Please submit your request with the order reference, purchase
          email, and a description of the problem. We will review the
          transaction and explain the available resolution. Approved
          refunds, where applicable, will be processed through the
          appropriate payment channel.
        </p>

        <h2>Cancellation</h2>
        <p>
          If you need help with an order, contact support as soon as
          possible. A completed digital delivery may not be reversible.
          Requests will be handled in accordance with applicable law
          and payment-provider requirements.
        </p>

        <h2>Contact Support</h2>
        <p>
          <Link to="/support">Open Customer Support</Link> to report
          a payment, order, or download issue.
        </p>
      </section>
    </main>
  );
}
