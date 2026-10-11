
import { useState } from "react";
import axios from "axios";
import "./RazorpayButton.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const scriptUrl =
      "https://checkout.razorpay.com/v1/checkout.js";

    const existingScript = document.querySelector(
      `script[src="${scriptUrl}"]`
    );

    if (existingScript) {
      existingScript.addEventListener(
        "load",
        () => resolve(Boolean(window.Razorpay)),
        { once: true }
      );

      existingScript.addEventListener(
        "error",
        () => resolve(false),
        { once: true }
      );

      return;
    }

    const script = document.createElement("script");
    script.src = scriptUrl;
    script.async = true;

    script.onload = () =>
      resolve(Boolean(window.Razorpay));

    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
}

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

export default function RazorpayButton({
  bookId,
  bookTitle,
}) {
  const storageKey = `codeseed_download_${bookId}`;

  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [retryingVerification, setRetryingVerification] =
    useState(false);
  const [message, setMessage] = useState("");
  const [verificationDetails, setVerificationDetails] =
    useState(null);

  const [hasDownloadToken, setHasDownloadToken] = useState(
    () => {
      if (!bookId || typeof window === "undefined") {
        return false;
      }

      return Boolean(sessionStorage.getItem(storageKey));
    }
  );

  async function verifyExistingPayment(details) {
    const { data } = await axios.post(
      `${API_URL}/payments/verify`,
      details
    );

    const token = data?.purchase?.downloadToken;

    if (!data?.success || !token) {
      throw new Error(
        "Payment verification did not return a download token."
      );
    }

    sessionStorage.setItem(storageKey, token);
    setHasDownloadToken(true);

    setMessage(
      "Payment verified. Your ebook is ready to download."
    );
  }

  async function handlePayment() {
    if (!bookId || loading) {
      setMessage(
        "Book information is missing. Please refresh the page."
      );
      return;
    }

    setLoading(true);
    setMessage("");
    setVerificationDetails(null);

    try {
      const loaded = await loadRazorpayScript();

      if (!loaded) {
        throw new Error(
          "Razorpay Checkout could not be loaded. Check your connection."
        );
      }

      const { data } = await axios.post(
        `${API_URL}/payments/create-order`,
        { bookId }
      );

      if (
        !data?.success ||
        !data?.order?.id ||
        !data?.keyId
      ) {
        throw new Error(
          data?.message ||
            "Could not create the payment order."
        );
      }

      const checkout = new window.Razorpay({
        key: data.keyId,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "CodeSeed",
        description: bookTitle || "CodeSeed Ebook",
        order_id: data.order.id,

        handler: async (response) => {
          const details = {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          };

          setVerificationDetails(details);
          setLoading(true);
          setMessage("Verifying your payment...");

          try {
            await verifyExistingPayment(details);
          } catch (error) {
            setMessage(
              getErrorMessage(
                error,
                "Verification is pending. Retry verification."
              )
            );
          } finally {
            setLoading(false);
          }
        },

        modal: {
          ondismiss: () => {
            setMessage(
              "Checkout closed. If you completed payment, verify its status before trying again."
            );
          },
        },

        theme: {
          color: "#6d5dfc",
        },
      });

      checkout.on("payment.failed", (response) => {
        setMessage(
          response?.error?.description ||
            "Payment failed. Please check the payment status."
        );
      });

      checkout.open();
    } catch (error) {
      setMessage(
        getErrorMessage(
          error,
          "Unable to start checkout."
        )
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleRetryVerification() {
    if (!verificationDetails || retryingVerification) {
      return;
    }

    setRetryingVerification(true);
    setMessage("Verifying your existing payment...");

    try {
      await verifyExistingPayment(verificationDetails);
    } catch (error) {
      setMessage(
        getErrorMessage(
          error,
          "Verification failed. Please try again."
        )
      );
    } finally {
      setRetryingVerification(false);
    }
  }

  async function handleDownload() {
    const token = sessionStorage.getItem(storageKey);

    if (!bookId || !token) {
      setHasDownloadToken(false);
      setMessage(
        "No download token found. Please verify your purchase."
      );
      return;
    }

    setDownloading(true);
    setMessage("");

    try {
      const response = await axios.get(
        `${API_URL}/pdfs/download/${bookId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        }
      );

      const fileUrl = URL.createObjectURL(response.data);
      const link = document.createElement("a");

      const safeTitle = (bookTitle || "codeseed-ebook")
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, "-")
        .trim();

      link.href = fileUrl;
      link.download = `${safeTitle || "codeseed-ebook"}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => {
        URL.revokeObjectURL(fileUrl);
      }, 1000);

      setMessage("Your ebook download has started.");
    } catch (error) {
      let errorMessage =
        "Download failed. Please try again.";

      if (error.response?.data instanceof Blob) {
        try {
          const body = await error.response.data.text();
          const parsed = JSON.parse(body);
          errorMessage = parsed.message || errorMessage;
        } catch {
          // Keep the fallback message.
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        sessionStorage.removeItem(storageKey);
        setHasDownloadToken(false);
      }

      setMessage(errorMessage);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="razorpay-purchase">
      {hasDownloadToken ? (
        <button
          type="button"
          className="purchase-btn download-btn"
          onClick={handleDownload}
          disabled={downloading}
        >
          {downloading ? (
            <>
              <span className="purchase-spinner" />
              Preparing PDF...
            </>
          ) : (
            <>
              <span aria-hidden="true">↓</span>
              Download Ebook
            </>
          )}
        </button>
      ) : (
        <button
          type="button"
          className="purchase-btn buy-ebook-btn"
          onClick={handlePayment}
          disabled={loading || !bookId}
        >
          {loading ? (
            <>
              <span className="purchase-spinner" />
              Please wait...
            </>
          ) : (
            <>
              <span aria-hidden="true">🛒</span>
              Buy Ebook
              <span
                className="purchase-arrow"
                aria-hidden="true"
              >
                →
              </span>
            </>
          )}
        </button>
      )}

      {verificationDetails && (
        <button
          type="button"
          className="purchase-btn retry-verification-btn"
          onClick={handleRetryVerification}
          disabled={retryingVerification || loading}
        >
          {retryingVerification ? (
            <>
              <span className="purchase-spinner retry-spinner" />
              Verifying...
            </>
          ) : (
            "Retry Payment Verification"
          )}
        </button>
      )}

      {message && (
        <p
          className="purchase-message"
          role="status"
          aria-live="polite"
        >
          {message}
        </p>
      )}
    </div>
  );
}
