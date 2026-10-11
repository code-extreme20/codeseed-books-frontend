import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  BookOpen,
  ShoppingBag,
  Plus,
  RefreshCw,
  Pencil,
  Trash2,
  X,
  Eye,
  EyeOff,
  Save,
  Upload,
  FileText,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

const emptyForm = {
  title: "",
  subtitle: "",
  description: "",
  category: "Frontend",
  regularPrice: "100",
  launchPrice: "50",
  coverImage: "",
  pdfUrl: "",
  pdfDriveFileId: "",
  level: "Beginner",
  format: "Digital PDF Ebook",
  isPublished: false,
  comingSoon: false,
};

function getToken() {
  return sessionStorage.getItem("codeseed_admin_token");
}

function authConfig() {
  return {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  };
}

export default function Dashboard() {
  const [admin, setAdmin] = useState(null);
  const [books, setBooks] = useState([]);

  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    paidOrders: 0,
    pendingOrders: 0,
    failedOrders: 0,
    revenuePaise: 0,
    currency: "INR",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [pdfFile, setPdfFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [adminResponse, booksResponse, statsResponse] =
        await Promise.all([
          axios.get(`${API_URL}/auth/me`, authConfig()),
          axios.get(`${API_URL}/books/admin/all`, authConfig()),
          axios.get(`${API_URL}/dashboard/stats`, authConfig()),
        ]);

      setAdmin(adminResponse.data.admin);
      setBooks(booksResponse.data.books || []);

      setOrderStats(
        statsResponse.data.stats || {
          totalOrders: 0,
          paidOrders: 0,
          pendingOrders: 0,
          failedOrders: 0,
          revenuePaise: 0,
          currency: "INR",
        }
      );
    } catch (err) {
      console.error("Dashboard loading error:", err);

      setError(
        err.response?.data?.message ||
          "Could not load dashboard. Check your backend connection."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  function openAddForm() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setPdfFile(null);
    setCoverFile(null);
    setCoverPreview("");
    setNotice("");
    setError("");
    setFormOpen(true);
  }

  function openEditForm(book) {
    setEditingId(book._id);

    setForm({
      title: book.title || "",
      subtitle: book.subtitle || "",
      description: book.description || "",
      category: book.category || "Frontend",
      regularPrice: String(book.regularPrice ?? 100),
      launchPrice: String(book.launchPrice ?? 50),
      coverImage: book.coverImage || "",
      pdfUrl: book.pdfUrl || "",
      pdfDriveFileId: book.pdfDriveFileId || "",
      level: book.level || "Beginner",
      format: book.format || "Digital PDF Ebook",
      isPublished: Boolean(book.isPublished),
      comingSoon: Boolean(book.comingSoon),
    });

    setPdfFile(null);
    setCoverFile(null);
    setCoverPreview(book.coverImage || "");
    setNotice("");
    setError("");
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingId(null);
    setForm({ ...emptyForm });
    setPdfFile(null);
    setCoverFile(null);
    setCoverPreview("");
    setError("");
  }

  function updateField(event) {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleCoverUpload() {
    if (!coverFile) {
      setError("Please select a cover image first.");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(coverFile.type)) {
      setError("Please select a JPG, PNG or WebP image.");
      return;
    }

    if (coverFile.size > 5 * 1024 * 1024) {
      setError("Cover image size must not exceed 5 MB.");
      return;
    }

    const data = new FormData();
    data.append("image", coverFile);

    setUploadingCover(true);
    setError("");
    setNotice("");

    try {
      const response = await axios.post(
        `${API_URL}/images/cover`,
        data,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      const imageUrl = response.data?.file?.coverImageUrl;

      if (!imageUrl) {
        throw new Error(
          "Upload response did not contain a cover image URL."
        );
      }

      setForm((previous) => ({
        ...previous,
        coverImage: imageUrl,
      }));

      setCoverFile(null);
      setCoverPreview(imageUrl);

      const input = document.getElementById("book-cover-file");
      if (input) input.value = "";

      setNotice(
        "Cover image uploaded. Click Save/Create Book to save it."
      );
    } catch (err) {
      console.error("Cover image upload failed:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Cover image upload failed. Check your backend."
      );
    } finally {
      setUploadingCover(false);
    }
  }

  async function handlePdfUpload() {
    if (!pdfFile) {
      setError("Please select a PDF file first.");
      return;
    }

    const isPdf =
      pdfFile.type === "application/pdf" ||
      pdfFile.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setError("Please select a PDF file.");
      return;
    }

    if (pdfFile.size > 15 * 1024 * 1024) {
      setError("PDF size must not exceed 15 MB.");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", pdfFile);

    setUploadingPdf(true);
    setError("");
    setNotice("");

    try {
      const response = await axios.post(
        `${API_URL}/pdfs/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      const fileId = response.data?.file?.id;

      if (!fileId) {
        throw new Error(
          "Upload response did not contain a Google Drive file ID."
        );
      }

      setForm((previous) => ({
        ...previous,
        pdfDriveFileId: fileId,
        pdfUrl: "",
      }));

      setPdfFile(null);

      const input = document.getElementById("book-pdf-file");
      if (input) input.value = "";

      setNotice(
        "PDF uploaded successfully. Click Save/Create Book to save its ID."
      );
    } catch (err) {
      console.error("PDF upload failed:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "PDF upload failed. Check your backend."
      );
    } finally {
      setUploadingPdf(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (coverFile) {
      setError(
        "Please upload the selected cover image before saving the book."
      );
      return;
    }

    if (uploadingCover || uploadingPdf) {
      setError("Please wait until uploads finish.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    const payload = {
      ...form,
      regularPrice: Number(form.regularPrice),
      launchPrice: Number(form.launchPrice),
      pdfDriveFileId: form.pdfDriveFileId,
    };

    try {
      if (editingId) {
        await axios.put(
          `${API_URL}/books/admin/${editingId}`,
          payload,
          authConfig()
        );

        setNotice("Book updated successfully.");
      } else {
        await axios.post(
          `${API_URL}/books/admin`,
          payload,
          authConfig()
        );

        setNotice("Book added successfully.");
      }

      setFormOpen(false);
      setEditingId(null);
      setForm({ ...emptyForm });
      setPdfFile(null);
      setCoverFile(null);
      setCoverPreview("");

      await loadDashboard();
    } catch (err) {
      console.error("Saving book failed:", err);

      setError(
        err.response?.data?.message ||
          "Could not save the book. Please check your details."
      );
    } finally {
      setSaving(false);
    }
  }

  async function togglePublished(book) {
    setError("");
    setNotice("");

    try {
      await axios.put(
        `${API_URL}/books/admin/${book._id}`,
        { isPublished: !book.isPublished },
        authConfig()
      );

      setNotice(
        !book.isPublished
          ? "Book published successfully."
          : "Book unpublished successfully."
      );

      await loadDashboard();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not update publication status."
      );
    }
  }

  async function handleDelete(book) {
    const confirmed = window.confirm(
      `Delete "${book.title}" permanently? This cannot be undone.`
    );

    if (!confirmed) return;

    setError("");
    setNotice("");

    try {
      await axios.delete(
        `${API_URL}/books/admin/${book._id}`,
        authConfig()
      );

      setNotice("Book deleted successfully.");
      await loadDashboard();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not delete this book."
      );
    }
  }

  const publishedCount = books.filter(
    (book) => book.isPublished
  ).length;

  const formatRevenue = (amountInPaise) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format((amountInPaise || 0) / 100);

  return (
    <main className="admin-dashboard">
      <div className="admin-page-heading">
        <div>
          <span className="admin-eyebrow">OVERVIEW</span>
          <h1>Dashboard</h1>
          <p className="admin-muted">
            Welcome{admin?.name ? `, ${admin.name}` : ""}. Manage your
            CodeSeed ebook store.
          </p>
        </div>

        <button
          type="button"
          className="admin-refresh"
          onClick={loadDashboard}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && <div className="admin-error">{error}</div>}
      {notice && <div className="admin-success">{notice}</div>}

      <section className="admin-stat-grid">
        <article className="admin-stat-card">
          <span className="admin-stat-icon">
            <BookOpen size={21} />
          </span>
          <p>Total books</p>
          <h2>{loading ? "..." : books.length}</h2>
          <small>All books stored in MongoDB</small>
        </article>

        <article className="admin-stat-card">
          <span className="admin-stat-icon">
            <Eye size={21} />
          </span>
          <p>Published books</p>
          <h2>{loading ? "..." : publishedCount}</h2>
          <small>Visible in the public library API</small>
        </article>

        <article className="admin-stat-card">
          <span className="admin-stat-icon">
            <ShoppingBag size={21} />
          </span>
          <p>Total orders</p>
          <h2>{loading ? "..." : orderStats.totalOrders}</h2>
          <small>
            {loading
              ? "Loading order statistics..."
              : `${orderStats.paidOrders} paid · ${orderStats.pendingOrders} pending`}
          </small>
        </article>

        <article className="admin-stat-card">
          <span className="admin-stat-icon">
            <ShoppingBag size={21} />
          </span>
          <p>Paid revenue</p>
          <h2>
            {loading ? "..." : formatRevenue(orderStats.revenuePaise)}
          </h2>
          <small>
            {loading
              ? "Loading..."
              : `${orderStats.failedOrders} failed orders`}
          </small>
        </article>
      </section>

      <section className="admin-content-card admin-book-toolbar">
        <div>
          <h2>Book library</h2>
          <p className="admin-muted">
            Add, edit, publish or remove your ebooks.
          </p>
        </div>

        <button
          type="button"
          className="admin-add-button"
          onClick={openAddForm}
        >
          <Plus size={18} />
          Add book
        </button>
      </section>

      {formOpen && (
        <section className="admin-content-card admin-form-card">
          <div className="admin-form-heading">
            <div>
              <span className="admin-eyebrow">
                {editingId ? "UPDATE EBOOK" : "NEW EBOOK"}
              </span>
              <h2>{editingId ? "Edit book" : "Add a book"}</h2>
            </div>

            <button
              type="button"
              className="admin-icon-button"
              onClick={closeForm}
              aria-label="Close form"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="admin-book-form">
            <div className="admin-form-grid">
              <div className="admin-field">
                <label htmlFor="book-title">Book title *</label>
                <input
                  id="book-title"
                  name="title"
                  value={form.title}
                  onChange={updateField}
                  maxLength={150}
                  required
                />
              </div>

              <div className="admin-field">
                <label htmlFor="book-subtitle">Subtitle</label>
                <input
                  id="book-subtitle"
                  name="subtitle"
                  value={form.subtitle}
                  onChange={updateField}
                  maxLength={200}
                />
              </div>

              <div className="admin-field admin-field-full">
                <label htmlFor="book-description">Description *</label>
                <textarea
                  id="book-description"
                  name="description"
                  value={form.description}
                  onChange={updateField}
                  maxLength={5000}
                  rows={4}
                  required
                />
              </div>

              <div className="admin-field">
                <label htmlFor="book-category">Category</label>
                <input
                  id="book-category"
                  name="category"
                  value={form.category}
                  onChange={updateField}
                  required
                />
              </div>

              <div className="admin-field">
                <label htmlFor="book-level">Level</label>
                <select
                  id="book-level"
                  name="level"
                  value={form.level}
                  onChange={updateField}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="All Levels">All Levels</option>
                </select>
              </div>

              <div className="admin-field">
                <label htmlFor="book-regular-price">
                  Regular price (₹) *
                </label>
                <input
                  id="book-regular-price"
                  name="regularPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.regularPrice}
                  onChange={updateField}
                  required
                />
              </div>

              <div className="admin-field">
                <label htmlFor="book-launch-price">
                  Launch price (₹) *
                </label>
                <input
                  id="book-launch-price"
                  name="launchPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.launchPrice}
                  onChange={updateField}
                  required
                />
              </div>

              <div className="admin-field admin-field-full">
                <label htmlFor="book-cover-file">Cover image</label>
                <input
                  id="book-cover-file"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null;
                    setCoverFile(file);
                    setError("");
                    setNotice("");

                    if (file) {
                      if (file.size > 5 * 1024 * 1024) {
                        setError(
                          "Cover image size must not exceed 5 MB."
                        );
                        setCoverFile(null);
                        setCoverPreview(form.coverImage || "");
                        event.target.value = "";
                        return;
                      }

                      if (
                        ![
                          "image/jpeg",
                          "image/png",
                          "image/webp",
                        ].includes(file.type)
                      ) {
                        setError(
                          "Please select a JPG, PNG or WebP image."
                        );
                        setCoverFile(null);
                        setCoverPreview(form.coverImage || "");
                        event.target.value = "";
                        return;
                      }

                      setCoverPreview(URL.createObjectURL(file));
                    } else {
                      setCoverPreview(form.coverImage || "");
                    }
                  }}
                />

                {coverPreview && (
                  <div
                    className="admin-cover-preview"
                    style={{ marginTop: 12 }}
                  >
                    <img
                      src={coverPreview}
                      alt="Book cover preview"
                      style={{
                        display: "block",
                        width: 140,
                        maxHeight: 190,
                        objectFit: "cover",
                        borderRadius: 8,
                        border: "1px solid #ddd",
                        marginBottom: 10,
                      }}
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                )}

                <button
                  type="button"
                  className="admin-add-button"
                  onClick={handleCoverUpload}
                  disabled={!coverFile || uploadingCover}
                >
                  {uploadingCover ? (
                    <>
                      <RefreshCw size={17} />
                      Uploading cover...
                    </>
                  ) : (
                    <>
                      <Upload size={17} />
                      Upload Cover Image to Google Drive
                    </>
                  )}
                </button>

                <small>JPG, PNG or WebP. Maximum size: 5 MB.</small>

                {form.coverImage && !coverFile && (
                  <small>Cover image attached to this book.</small>
                )}
              </div>

              <div className="admin-field admin-field-full">
                <label htmlFor="book-pdf-file">Book PDF</label>
                <input
                  id="book-pdf-file"
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(event) => {
                    setPdfFile(event.target.files?.[0] || null);
                    setError("");
                    setNotice("");
                  }}
                />

                <button
                  type="button"
                  className="admin-add-button"
                  onClick={handlePdfUpload}
                  disabled={!pdfFile || uploadingPdf}
                >
                  {uploadingPdf ? (
                    <>
                      <RefreshCw size={17} />
                      Uploading PDF...
                    </>
                  ) : (
                    <>
                      <Upload size={17} />
                      Upload PDF to Google Drive
                    </>
                  )}
                </button>

                {form.pdfDriveFileId && (
                  <small>
                    <FileText
                      size={14}
                      style={{
                        display: "inline",
                        verticalAlign: "middle",
                        marginRight: 5,
                      }}
                    />
                    PDF attached. File ID: {form.pdfDriveFileId}
                  </small>
                )}

                {!form.pdfDriveFileId && (
                  <small>
                    No PDF attached yet. Select a PDF and upload it before
                    saving the book.
                  </small>
                )}

                <small>
                  Maximum size: 15 MB. Upload only PDFs you have permission
                  to distribute.
                </small>
              </div>

              <div className="admin-field">
                <label htmlFor="book-format">Format</label>
                <input
                  id="book-format"
                  name="format"
                  value={form.format}
                  onChange={updateField}
                />
              </div>

              <label className="admin-publish-option">
                <input
                  type="checkbox"
                  name="isPublished"
                  checked={form.isPublished}
                  onChange={updateField}
                />
                Publish this book on the public website
              </label>
              <label className="admin-publish-option">
                <input
                  type="checkbox"
                  name="comingSoon"
                  checked={form.comingSoon}
                  onChange={updateField}
                />
                This is a coming soon book
              </label>
            </div>

            <div className="admin-form-actions">
              <button
                type="button"
                className="admin-cancel-button"
                onClick={closeForm}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="admin-add-button"
                disabled={saving || uploadingPdf || uploadingCover}
              >
                <Save size={17} />
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save changes"
                    : "Create book"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="admin-book-list">
        {loading ? (
          <div className="admin-empty-state">Loading books...</div>
        ) : books.length === 0 ? (
          <div className="admin-empty-state">
            <BookOpen size={35} />
            <h3>No books added yet</h3>
            <p>Add your first ebook to start building your library.</p>

            <button
              type="button"
              className="admin-add-button"
              onClick={openAddForm}
            >
              <Plus size={17} />
              Add your first book
            </button>
          </div>
        ) : (
          books.map((book) => (
            <article className="admin-book-row" key={book._id}>
              <div className="admin-book-cover">
                {book.coverImage ? (
                  <img src={book.coverImage} alt={book.title} />
                ) : (
                  <BookOpen size={27} />
                )}
              </div>

              <div className="admin-book-info">
                <h3>{book.title}</h3>
                {book.subtitle && <p>{book.subtitle}</p>}

                <small>
                  {book.category} · ₹{book.launchPrice} · Regular ₹
                  {book.regularPrice}
                </small>

                {book.pdfDriveFileId && <small>PDF attached</small>}
              </div>

              <span
                className={
                  book.isPublished
                    ? "admin-book-status published"
                    : "admin-book-status draft"
                }
              >
                {book.isPublished ? "Published" : "Draft"}
              </span>

              <div className="admin-book-actions">
                <button
                  type="button"
                  className="admin-icon-button"
                  title={
                    book.isPublished ? "Unpublish book" : "Publish book"
                  }
                  onClick={() => togglePublished(book)}
                >
                  {book.isPublished ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>

                <button
                  type="button"
                  className="admin-icon-button"
                  title="Edit book"
                  onClick={() => openEditForm(book)}
                >
                  <Pencil size={17} />
                </button>

                <button
                  type="button"
                  className="admin-icon-button danger"
                  title="Delete book"
                  onClick={() => handleDelete(book)}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}