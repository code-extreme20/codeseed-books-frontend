
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Search,
  Code2,
  RefreshCw,
} from "lucide-react";
import axios from "axios";
import RazorpayButton from "./RazorpayButton";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

function isTrue(value) {
  return value === true || value === "true";
}

function getCoverUrl(url) {
  if (!url || typeof url !== "string") return "";

  const value = url.trim();

  const driveFileId =
    value.match(/drive\.google\.com\/file\/d\/([^/?]+)/)?.[1] ||
    value.match(/[?&]id=([^&]+)/)?.[1];

  if (value.includes("drive.google.com") && driveFileId) {
    return `https://drive.google.com/thumbnail?id=${driveFileId}&sz=w1000`;
  }

  return value;
}

// API uses launchPrice and regularPrice, not only "price".
function getBookPrice(book) {
  const launchPrice = book.launchPrice;
  const regularPrice = book.regularPrice;
  const oldPrice = book.price;

  if (
    launchPrice !== null &&
    launchPrice !== undefined &&
    launchPrice !== "" &&
    Number.isFinite(Number(launchPrice)) &&
    Number(launchPrice) >= 0
  ) {
    return Number(launchPrice);
  }

  if (
    regularPrice !== null &&
    regularPrice !== undefined &&
    regularPrice !== "" &&
    Number.isFinite(Number(regularPrice)) &&
    Number(regularPrice) >= 0
  ) {
    return Number(regularPrice);
  }

  if (
    oldPrice !== null &&
    oldPrice !== undefined &&
    oldPrice !== "" &&
    Number.isFinite(Number(oldPrice)) &&
    Number(oldPrice) >= 0
  ) {
    return Number(oldPrice);
  }

  return null;
}

function CoverFallback({ title }) {
  return (
    <div className="book-cover-fallback">
      <div className="book-cover-fallback-icon">
        <BookOpen size={34} />
      </div>

      <span>CODESEED BOOKS</span>

      <h3>{title || "Programming Guide"}</h3>

      <div className="book-cover-fallback-line" />

      <p>Learn. Build. Grow.</p>
    </div>
  );
}

export default function BookLibrary() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [failedImages, setFailedImages] = useState({});
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function fetchBooks() {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(`${API_URL}/books`);

        if (!active) return;

        const data = response.data;

        const bookList = Array.isArray(data)
          ? data
          : Array.isArray(data?.books)
            ? data.books
            : [];

        setBooks(bookList);
        setFailedImages({});
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Unable to load ebooks. Please try again."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchBooks();

    return () => {
      active = false;
    };
  }, [retryKey]);

  // Display published books and books marked Coming Soon.
  const visibleBooks = books.filter(
    (book) =>
      isTrue(book.isPublished) ||
      isTrue(book.comingSoon)
  );

  const filteredBooks = visibleBooks.filter((book) => {
    const searchableText = [
      book.title,
      book.subtitle,
      book.category,
      book.description,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(
      search.trim().toLowerCase()
    );
  });

  function markImageFailed(imageKey) {
    setFailedImages((previous) => ({
      ...previous,
      [imageKey]: true,
    }));
  }

  return (
    <section className="library" id="books">
      <div className="section-wrap">
        <div className="section-heading">
          <span>OUR LIBRARY</span>

          <h2>
            Find your next <em>learning resource.</em>
          </h2>

          <p>
            Practical programming ebooks to help you learn
            new skills and build real-world projects.
          </p>
        </div>

        <label className="book-search">
          <Search size={19} />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search books, categories..."
            aria-label="Search books"
          />
        </label>

        {!loading && !error && (
          <p className="result-count">
            {filteredBooks.length}{" "}
            {filteredBooks.length === 1 ? "book" : "books"} found
          </p>
        )}

        {loading && (
          <div className="empty-state">
            <RefreshCw
              size={25}
              className="loading-spinner"
            />
            <p>Loading books...</p>
          </div>
        )}

        {!loading && error && (
          <div className="empty-state">
            <h3>Unable to load books</h3>
            <p>{error}</p>

            <button
              type="button"
              className="text-button"
              onClick={() =>
                setRetryKey((key) => key + 1)
              }
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && filteredBooks.length === 0 && (
          <div className="empty-state">
            <BookOpen size={32} />
            <h3>No books found</h3>

            <p>
              {search
                ? "Try another search term."
                : "Books will appear here when available."}
            </p>
          </div>
        )}

        {!loading && !error && filteredBooks.length > 0 && (
          <div className="book-grid">
            {filteredBooks.map((book, index) => {
              const comingSoon = isTrue(book.comingSoon);
              const published = isTrue(book.isPublished);

              const canPurchase =
                published &&
                !comingSoon &&
                Boolean(book._id);

              const currentPrice = getBookPrice(book);

              const imageUrl = getCoverUrl(
                book.coverImage || book.coverImageUrl
              );

              const imageKey =
                book._id || book.title || String(index);

              const showImage =
                Boolean(imageUrl) &&
                !failedImages[imageKey];

              const regularPrice =
                book.regularPrice !== null &&
                book.regularPrice !== undefined &&
                book.regularPrice !== ""
                  ? Number(book.regularPrice)
                  : null;

              const showDiscount =
                currentPrice !== null &&
                regularPrice !== null &&
                Number.isFinite(regularPrice) &&
                regularPrice > currentPrice;

              return (
                <motion.article
                  className="book-card"
                  key={imageKey}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{
                    once: true,
                    amount: 0.1,
                  }}
                  transition={{
                    duration: 0.35,
                    delay: Math.min(index * 0.06, 0.3),
                  }}
                >
                  <div className="ebook-cover">
                    {showImage ? (
                      <img
                        src={imageUrl}
                        alt={`${book.title || "Ebook"} cover`}
                        className="ebook-cover-image"
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        onError={() =>
                          markImageFailed(imageKey)
                        }
                      />
                    ) : (
                      <CoverFallback title={book.title} />
                    )}

                    {comingSoon && (
                      <span className="coming-soon-badge">
                        Coming Soon
                      </span>
                    )}
                  </div>

                  <div className="book-info">
                    <div className="book-meta">
                      <span>
                        {book.category || "PROGRAMMING"}
                      </span>

                      {comingSoon && (
                        <span>COMING SOON</span>
                      )}
                    </div>

                    <h3>
                      {book.title || "Untitled Book"}
                    </h3>

                    <p className="book-description">
                      {book.description ||
                        "Explore practical concepts and improve your programming skills with this ebook."}
                    </p>

                    <div className="price-row">
                      <strong>
                        {currentPrice === null
                          ? "Price not set"
                          : currentPrice === 0
                            ? "Free"
                            : `₹${currentPrice}`}
                      </strong>

                      {showDiscount && (
                        <del>₹{regularPrice}</del>
                      )}

                      {showDiscount && (
                        <span className="discount-badge">
                          {Math.round(
                            ((regularPrice - currentPrice) /
                              regularPrice) *
                              100
                          )}
                          % OFF
                        </span>
                      )}
                    </div>

                    {comingSoon ? (
                      <button
                        type="button"
                        className="buy-button"
                        disabled
                      >
                        <BookOpen size={17} />
                        Coming Soon
                      </button>
                    ) : canPurchase ? (
                      <RazorpayButton
                        bookId={book._id}
                        bookTitle={book.title}
                      />
                    ) : (
                      <button
                        type="button"
                        className="buy-button"
                        disabled
                      >
                        Currently Unavailable
                      </button>
                    )}

                    <p className="book-note">
                      <Code2 size={13} />

                      {comingSoon
                        ? "This ebook is coming soon."
                        : "Learn at your own pace."}
                    </p>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
