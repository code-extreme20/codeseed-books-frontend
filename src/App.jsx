
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Code2,
  BookOpen,
  Layers,
  GraduationCap,
  Zap,
  ShieldCheck,
  Star,
} from "lucide-react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import BookLibrary from "./components/BookLibrary";

import Login from "./admin/Login";
import AdminLayout from "./admin/Adminlayout";
import Dashboard from "./admin/Dashboard";
import Orders from "./admin/Orders";
import OrderDetails from "./admin/OrderDetails";
import Support from "./components/Support";
import SupportTickets from "./admin/SupportTickets";
import {
  ContactPage,
  PrivacyPolicy,
  RefundPolicy,
} from "./PolicyPages";
import "./admin/admin.css";
import "./index.css";

const benefits = [
  {
    icon: BookOpen,
    title: "Knowledge for everyone",
    description:
      "Explore ebooks for coding, creativity, fiction, and personal growth.",
  },
  {
    icon: Code2,
    title: "Learn by doing",
    description:
      "Discover practical guides that help turn ideas into real skills.",
  },
  {
    icon: GraduationCap,
    title: "Learn at your pace",
    description:
      "Read anytime and revisit your digital library whenever you want.",
  },
];

const reveal = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: "easeOut" },
  },
};

function HomePage() {
  return (
    <div className="codeseed-home">
      <Navbar />

      <main>
        <section className="premium-hero" id="home">
          <div className="premium-hero-glow premium-hero-glow-one" />
          <div className="premium-hero-glow premium-hero-glow-two" />

          <div className="premium-hero-inner">
            <motion.div
              className="premium-hero-copy"
              variants={reveal}
              initial="hidden"
              animate="visible"
            >
              <div className="premium-eyebrow">
                <Sparkles size={15} />
                <span>YOUR NEXT CHAPTER STARTS HERE</span>
              </div>

              <h1>
                Feed your curiosity.
                <span className="premium-gradient-text">
                  Grow without limits.
                </span>
              </h1>

              <p className="premium-hero-description">
                From practical programming guides to stories that
                spark imagination, discover digital books made for
                your next big idea.
              </p>

              <div className="premium-hero-actions">
                <a href="#books" className="premium-primary-button">
                  <BookOpen size={18} />
                  Explore the library
                  <ArrowRight size={17} />
                </a>

                <a href="#about" className="premium-secondary-button">
                  Discover CodeSeed
                </a>
              </div>

              <div className="premium-trust-row">
                <span>
                  <ShieldCheck size={16} />
                  Digital reading
                </span>
                <i />
                <span>
                  <Zap size={16} />
                  Learn at your pace
                </span>
              </div>
            </motion.div>

            <motion.div
              className="premium-hero-art"
              initial={{ opacity: 0, scale: 0.92, rotate: 2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
            >
              <div className="premium-orbit premium-orbit-one" />
              <div className="premium-orbit premium-orbit-two" />
              <div className="premium-art-glow" />

              <motion.div
                className="premium-floating-tag premium-tag-top"
                animate={{ y: [0, -9, 0] }}
                transition={{ duration: 3.2, repeat: Infinity }}
              >
                <Code2 size={16} />
                Learn something new
              </motion.div>

              <motion.div
                className="premium-floating-tag premium-tag-bottom"
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 3.8, repeat: Infinity }}
              >
                <Sparkles size={16} />
                Ideas become skills
              </motion.div>

              <div className="premium-book-stack">
                <div className="premium-book premium-book-back">
                  <span>IMAGINE</span>
                  <strong>Ideas into action.</strong>
                  <div className="premium-book-decoration">✳</div>
                </div>

                <div className="premium-book premium-book-middle">
                  <span>DISCOVER</span>
                  <strong>Explore new worlds.</strong>
                  <div className="premium-book-decoration">✦</div>
                </div>

                <div className="premium-book premium-book-front">
                  <div className="premium-book-brand">
                    <Code2 size={17} />
                    CODESEED
                  </div>

                  <span className="premium-book-kicker">
                    YOUR DIGITAL LIBRARY
                  </span>

                  <h2>
                    Learn.
                    <br />
                    Build.
                    <br />
                    <span>Grow.</span>
                  </h2>

                  <div className="premium-book-line" />
                  <p>One page can spark a new beginning.</p>
                  <div className="premium-book-symbol">&lt;/&gt;</div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="premium-hero-bottom">
            <span>CURIOUS MINDS WELCOME</span>
            <div />
            <span>FIND YOUR NEXT READ ↓</span>
          </div>
        </section>

        <section className="premium-promo-wrap">
          <motion.div
            className="premium-promo"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <div className="premium-promo-icon">
              <Star size={22} />
            </div>

            <div className="premium-promo-copy">
              <span>THE CODESEED EXPERIENCE</span>
              <h2>Your next favourite read is waiting.</h2>
              <p>
                Explore the collection and discover something
                worth learning, sharing, or getting lost in.
              </p>
            </div>

            <a href="#books" className="premium-promo-button">
              Browse books <ArrowRight size={17} />
            </a>
          </motion.div>
        </section>

        <section className="premium-library-section" id="books">
          <div className="premium-section-heading">
            <div>
              <span className="premium-section-kicker">
                THE DIGITAL LIBRARY
              </span>

              <h2>
                Find your next <span>favourite.</span>
              </h2>

              <p>
                Browse the collection and choose what inspires you.
              </p>
            </div>

            <a href="#about" className="premium-text-link">
              Why CodeSeed? <ArrowRight size={16} />
            </a>
          </div>

          <BookLibrary />
        </section>

        <section className="premium-about" id="about">
          <div className="premium-about-inner">
            <div className="premium-section-heading premium-about-heading">
              <div>
                <span className="premium-section-kicker">
                  A BETTER WAY TO DISCOVER
                </span>

                <h2>
                  Made for curious <span>minds.</span>
                </h2>

                <p>
                  Whether you are learning a skill or exploring a
                  new story, your next discovery starts here.
                </p>
              </div>
            </div>

            <div className="premium-benefit-grid">
              {benefits.map(
                ({ icon: Icon, title, description }, index) => (
                  <motion.article
                    className="premium-benefit-card"
                    key={title}
                    initial={{ opacity: 0, y: 22 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: index * 0.12,
                      duration: 0.45,
                    }}
                    whileHover={{ y: -6 }}
                  >
                    <div className="premium-benefit-icon">
                      <Icon size={22} />
                    </div>

                    <h3>{title}</h3>
                    <p>{description}</p>

                    <span className="premium-benefit-number">
                      0{index + 1}
                    </span>
                  </motion.article>
                )
              )}
            </div>
          </div>
        </section>

        <section className="premium-closing">
          <div className="premium-closing-glow" />

          <div className="premium-closing-content">
            <Sparkles size={26} />

            <span className="premium-section-kicker">
              START YOUR NEXT CHAPTER
            </span>

            <h2>
              One discovery can
              <span> change everything.</span>
            </h2>

            <p>
              Explore ideas. Learn new things. Find your next read.
            </p>

            <a href="#books" className="premium-primary-button">
              Explore CodeSeed <ArrowRight size={17} />
            </a>
          </div>
        </section>
      </main>

      <footer className="premium-footer">
        <div className="premium-footer-inner">
          <a href="#home" className="premium-footer-brand">
            <span className="premium-footer-icon">
              <Code2 size={20} />
            </span>

            <span>
              Code<span>Seed</span>
            </span>
          </a>

          <p>
            A little curiosity can grow into something extraordinary.
          </p>

          <div className="premium-footer-links">
            <a href="#home">Home</a>
            <a href="#books">Library</a>
            <a href="#about">About</a>
            <Link to="/support">Customer Support</Link>
            <Link to="/contact">Contact Us</Link>
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/refund-policy">Refund & Cancellation</Link>
          </div>

          <div className="premium-footer-bottom">
            <span>© {new Date().getFullYear()} CodeSeed</span>
            <span>Made for curious minds ✳</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/support" element={<Support />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/admin" element={<Login />} />

        <Route path="/admin/dashboard" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:id" element={<OrderDetails />} />
          <Route path="support" element={<SupportTickets />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
