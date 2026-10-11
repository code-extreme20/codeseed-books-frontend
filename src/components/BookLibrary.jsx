
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Search, Code2 } from "lucide-react";
import axios from "axios";

import RazorpayButton from "./RazorpayButton";

const API_URL = "http://localhost:5000/api";

export default function BookLibrary() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
          : Array.isArray(data.books)
            ? data.books
            : [];

        setBooks(bookList);
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
  }, []);

  const filteredBooks = books.filter((book) =>
    `${book.title || ""} ${book.category || ""} ${book.description || ""
      }`
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  );

  return (
    <section className="library section-wrap" id="books">
      <div className="section-heading">
        <span className="eyebrow">THE CODESEED LIBRARY</span>

        <h2>
          Your next skill starts <em>here.</em>
        </h2>

        <p>
          Practical learning resources for curious minds.
        </p>
      </div>

      <label className="book-search">
        <Search size={19} />

        <input
          type="search"
          placeholder="Search your ebook..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search ebooks"
        />
      </label>

      {!loading && !error && (
        <p className="result-count" aria-live="polite">
          {filteredBooks.length}{" "}
          {filteredBooks.length === 1 ? "book" : "books"} found
        </p>
      )}

      {loading && (
        <div className="empty-state" role="status">
          <p>Loading ebooks...</p>
        </div>
      )}

      {!loading && error && (
        <div className="empty-state" role="alert">
          <BookOpen size={30} />

          <h3>Unable to load ebooks</h3>

          <p>{error}</p>

          <button
            type="button"
            className="buy-button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="book-grid">
            {filteredBooks.map((book) => {
              const comingSoon = Boolean(book.comingSoon);

              const canPurchase =
                !comingSoon &&
                book.isPublished !== false &&
                Boolean(book._id);

              return (
                <motion.article
                  key={book._id || book.id}
                  className="book-card"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    className="ebook-cover"
                    style={{ position: "relative" }}
                  >
                    {comingSoon && (
                      <span
                        className="coming-soon-badge"
                        style={{
                          position: "absolute",
                          top: 12,
                          left: 12,
                          zIndex: 2,
                          padding: "7px 12px",
                          borderRadius: 20,
                          background: "#f4c95d",
                          color: "#201b10",
                          fontSize: 11,
                          fontWeight: 800,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                        }}
                      >
                        Coming Soon
                      </span>
                    )}

                    {book.coverImage ? (
                      <img
                        src={book.coverImage}
                        alt={`${book.title} cover`}
                        className="ebook-cover-image"
                        loading="lazy"
                      />
                    ) : (
                      <>
                        <div className="cover-brand">
                          <Code2 size={19} />
                          <span>CodeSeed</span>
                        </div>

                        <div className="cover-content">
                          <span>THE COMPLETE GUIDE</span>

                          <h3>
                            {book.title || "Frontend Developer"}
                          </h3>

                          <p>Zero to Advanced</p>

                          <div className="cover-rule" />

                          <small>
                            {(
                              book.subtitle || "Digital Edition"
                            ).toUpperCase()}
                          </small>
                        </div>

                        <span className="cover-symbol">
                          {"</>"}
                        </span>

                        <small className="cover-footer">
                          LEARN. BUILD. GROW.
                        </small>
                      </>
                    )}
                  </div>

                  <div className="book-info">
                    <div className="book-meta">
                      <span>
                        {book.format || "Digital Ebook"}
                      </span>

                      <span>
                        {book.level || "Beginner"}
                      </span>
                    </div>

                    <h3>{book.title}</h3>

                    <p>{book.description}</p>

                    <div className="price-row">
                      <strong>
                        ₹{book.launchPrice ?? 50}
                      </strong>

                      <del>
                        ₹{book.regularPrice ?? 100}
                      </del>

                      <span className="discount-badge">
                        50% OFF
                      </span>
                    </div>

                    {comingSoon ? (
                      <button
                        type="button"
                        className="buy-button"
                        disabled
                        aria-label={`${book.title} is coming soon`}
                        style={{
                          width: "100%",
                          cursor: "not-allowed",
                          opacity: 0.8,
                        }}
                      >
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
                        Not Available
                      </button>
                    )}

                    <small className="book-note">
                      {comingSoon
                        ? "This ebook is not available for purchase yet."
                        : "Digital ebook from CodeSeed."}
                    </small>
                  </div>
                </motion.article>
              );
            })}
          </div>

          {filteredBooks.length === 0 && (
            <div className="empty-state">
              <BookOpen size={30} />

              <h3>
                {books.length === 0
                  ? "No ebooks published yet"
                  : "No ebook found"}
              </h3>

              <p>
                {books.length === 0
                  ? "Published ebooks will appear here."
                  : "Try searching for a different topic."}
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
}
