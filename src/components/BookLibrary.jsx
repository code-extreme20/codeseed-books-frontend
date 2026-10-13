import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Search,
  Code2,
  RefreshCw,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import axios from "axios";
import RazorpayButton from "./RazorpayButton";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

const BASE_CATEGORIES = [
  { name: "All Books", icon: "✦" },
  { name: "Education", icon: "🎓" },
  { name: "Programming", icon: "💻" },
  { name: "Comics", icon: "💥" },
  { name: "Manga", icon: "📚" },
  { name: "Dark Romance", icon: "🖤" },
  { name: "18+", icon: "🔞" },
  { name: "Fiction", icon: "✨" },
  { name: "Self Help", icon: "🌱" },
  { name: "Business", icon: "📈" },
  { name: "Health", icon: "💚" },
  { name: "Motivation", icon: "⚡" },
];

const CATEGORY_ICONS = {
  technology: "💻",
  science: "🔬",
  history: "🏛️",
  biography: "👤",
  fantasy: "🪄",
  mystery: "🔎",
  thriller: "🕵️",
  poetry: "📝",
  general: "📘",
};

const CATEGORY_ALIASES = {
  frontend: "programming",
  "web development": "programming",
  "web development ebook": "programming",
  educational: "education",
  comic: "comics",
  "self-help": "self help",
  romance: "dark romance",
};

function normalizeCategory(category = "") {
  const value = String(category).trim().toLowerCase();
  return CATEGORY_ALIASES[value] || value;
}

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

function getBookPrice(book) {
  for (const value of [book.launchPrice, book.regularPrice, book.price]) {
    if (
      value !== null &&
      value !== undefined &&
      value !== "" &&
      Number.isFinite(Number(value)) &&
      Number(value) >= 0
    ) {
      return Number(value);
    }
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
      <h3>{title || "Discover Your Next Book"}</h3>
      <div className="book-cover-fallback-line" />
      <p>Learn. Build. Grow.</p>
    </div>
  );
}

function BookCard({ book, index, failedImages, onImageError }) {
  const comingSoon = isTrue(book.comingSoon);
  const published = isTrue(book.isPublished);
  const canPurchase = published && !comingSoon && Boolean(book._id);
  const currentPrice = getBookPrice(book);
  const imageUrl = getCoverUrl(book.coverImage || book.coverImageUrl);
  const imageKey = book._id || book.title || String(index);
  const showImage = Boolean(imageUrl) && !failedImages[imageKey];

  const regularPrice =
    book.regularPrice !== null &&
    book.regularPrice !== undefined &&
    book.regularPrice !== "" &&
    Number.isFinite(Number(book.regularPrice))
      ? Number(book.regularPrice)
      : null;

  const showDiscount =
    currentPrice !== null && regularPrice !== null && regularPrice > currentPrice;

  return (
    <motion.article
      className="book-card"
      layout
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.2) }}
      whileHover={{ y: -7 }}
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
            onError={() => onImageError(imageKey)}
          />
        ) : (
          <CoverFallback title={book.title} />
        )}

        <span className="book-cover-label">
          {comingSoon ? "COMING SOON" : "DIGITAL BOOK"}
        </span>

        {showDiscount && (
          <span className="book-cover-discount">
            {Math.round(((regularPrice - currentPrice) / regularPrice) * 100)}% OFF
          </span>
        )}
      </div>

      <div className="book-info">
        <div className="book-meta">
          <span>{book.category || "General"}</span>
          {comingSoon && <span>COMING SOON</span>}
        </div>

        <h3>{book.title || "Untitled Book"}</h3>
        {book.subtitle && <p className="book-subtitle">{book.subtitle}</p>}
        <p className="book-description">
          {book.description ||
            "Discover useful ideas and explore something new with this digital book."}
        </p>

        <div className="price-row">
          <strong>
            {currentPrice === null
              ? "Price not set"
              : currentPrice === 0
                ? "Free"
                : `₹${currentPrice}`}
          </strong>
          {showDiscount && <del>₹{regularPrice}</del>}
        </div>

        {comingSoon ? (
          <button type="button" className="buy-button" disabled>
            <BookOpen size={17} />
            Coming Soon
          </button>
        ) : canPurchase ? (
          <RazorpayButton bookId={book._id} bookTitle={book.title} />
        ) : (
          <button type="button" className="buy-button" disabled>
            Currently Unavailable
          </button>
        )}

        <p className="book-note">
          <Code2 size={13} />
          {comingSoon
            ? "This ebook is coming soon."
            : "Digital reading, at your own pace."}
        </p>
      </div>
    </motion.article>
  );
}

export default function BookLibrary() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Books");
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
        if (active) setLoading(false);
      }
    }

    fetchBooks();
    return () => {
      active = false;
    };
  }, [retryKey]);

  const visibleBooks = useMemo(
    () =>
      books.filter(
        (book) => isTrue(book.isPublished) || isTrue(book.comingSoon)
      ),
    [books]
  );

  // Combine the predefined categories with any categories found in MongoDB.
  const categories = useMemo(() => {
    const baseNames = new Set(
      BASE_CATEGORIES.map((category) => normalizeCategory(category.name))
    );
    const discovered = new Map();

    visibleBooks.forEach((book) => {
      const name = String(book.category || "").trim();
      if (!name) return;

      const normalized = normalizeCategory(name);
      if (
        !normalized ||
        normalized === "all books" ||
        baseNames.has(normalized) ||
        discovered.has(normalized)
      ) {
        return;
      }

      discovered.set(normalized, {
        name,
        icon: CATEGORY_ICONS[normalized] || "📘",
      });
    });

    return [
      ...BASE_CATEGORIES,
      ...Array.from(discovered.values()).sort((a, b) =>
        a.name.localeCompare(b.name)
      ),
    ];
  }, [visibleBooks]);

  const filteredBooks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return visibleBooks.filter((book) => {
      const searchableText = [
        book.title,
        book.subtitle,
        book.category,
        book.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchableText.includes(query);
      const matchesCategory =
        activeCategory === "All Books" ||
        normalizeCategory(book.category) === normalizeCategory(activeCategory);

      return matchesSearch && matchesCategory;
    });
  }, [visibleBooks, search, activeCategory]);

  function markImageFailed(imageKey) {
    setFailedImages((previous) => ({ ...previous, [imageKey]: true }));
  }

  function clearFilters() {
    setSearch("");
    setActiveCategory("All Books");
  }

  return (
    <section className="library" id="books">
      <div className="section-wrap">
        <motion.div
          className="library-heading"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="library-eyebrow">
            <Sparkles size={15} />
            THE CODESEED COLLECTION
          </span>
          <h2>
            Find your next <em>favorite read.</em>
          </h2>
          <p>
            Explore practical guides, imaginative worlds, stories, and ideas—all
            in one digital library.
          </p>
        </motion.div>

        <div className="library-toolbar">
          <label className="book-search">
            <Search size={19} />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search books, categories, topics..."
              aria-label="Search books"
            />
            {search && (
              <button
                type="button"
                className="search-clear"
                aria-label="Clear search"
                onClick={() => setSearch("")}
              >
                <X size={16} />
              </button>
            )}
          </label>

          <div className="library-count">
            <SlidersHorizontal size={16} />
            <span>{loading ? "Loading..." : `${filteredBooks.length} books`}</span>
          </div>
        </div>

        <div className="category-bar" aria-label="Filter books by category">
          {categories.map((category) => (
            <button
              key={category.name}
              type="button"
              className={`category-pill ${
                activeCategory === category.name ? "active" : ""
              }`}
              onClick={() => setActiveCategory(category.name)}
              aria-pressed={activeCategory === category.name}
            >
              <span aria-hidden="true">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        {!loading && !error && (
          <div className="library-results-heading">
            <div>
              <span className="results-kicker">BROWSE LIBRARY</span>
              <h3>
                {activeCategory === "All Books"
                  ? "Explore all books"
                  : activeCategory}
              </h3>
            </div>
            <span className="results-total">
              {filteredBooks.length} {filteredBooks.length === 1 ? "result" : "results"}
            </span>
          </div>
        )}

        {loading && (
          <div className="empty-state">
            <RefreshCw size={28} className="loading-spinner" />
            <p>Opening your library...</p>
          </div>
        )}

        {!loading && error && (
          <div className="empty-state">
            <BookOpen size={30} />
            <h3>Library unavailable</h3>
            <p>{error}</p>
            <button
              type="button"
              className="text-button"
              onClick={() => setRetryKey((key) => key + 1)}
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && filteredBooks.length === 0 && (
          <div className="empty-state category-empty-state">
            <div className="empty-state-icon">
              <BookOpen size={30} />
            </div>
            <h3>
              {search
                ? "No matching books found"
                : `No books in ${activeCategory} yet`}
            </h3>
            <p>
              {search
                ? "Try a different title, topic, or category."
                : "New additions to this collection can appear here once published."}
            </p>
            <button type="button" className="text-button" onClick={clearFilters}>
              Browse all books
            </button>
          </div>
        )}

        {!loading && !error && filteredBooks.length > 0 && (
          <motion.div className="book-grid" layout>
            {filteredBooks.map((book, index) => (
              <BookCard
                key={book._id || book.id || book.title || index}
                book={book}
                index={index}
                failedImages={failedImages}
                onImageError={markImageFailed}
              />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
