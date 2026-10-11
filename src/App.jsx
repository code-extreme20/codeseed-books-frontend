
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Code2,
  BookOpen,
  Layers,
  GraduationCap,
} from "lucide-react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import BookLibrary from "./components/BookLibrary";

import Login from "./admin/Login";
import AdminLayout from "./admin/Adminlayout";
import Dashboard from "./admin/Dashboard";
import Orders from "./admin/Orders";
import OrderDetails from "./admin/OrderDetails";

import "./admin/admin.css";

const benefits = [
  {
    icon: BookOpen,
    title: "Beginner-friendly",
    description: "Clear explanations that help you learn step by step.",
  },
  {
    icon: Code2,
    title: "Practical learning",
    description: "Understand concepts through coding examples and projects.",
  },
  {
    icon: GraduationCap,
    title: "Learn at your pace",
    description: "Study when you want and revisit lessons whenever needed.",
  },
];

function HomePage() {
  return (
    <>
      <Navbar />

      <main>
        <section className="hero section-wrap" id="home">
          <motion.div
            className="hero-copy"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="eyebrow">
              <Sparkles size={15} />
              YOUR CODING JOURNEY STARTS HERE
            </span>

            <h1>
              Don't just learn code.
              <span> Build your future.</span>
            </h1>

            <p className="hero-description">
              Discover practical ebooks that make web development
              easier to understand. Learn step by step, practice
              your skills, and build something real.
            </p>

            <div className="hero-actions">
              <a href="#books" className="primary-button">
                Explore Books <ArrowRight size={17} />
              </a>

              <a href="#about" className="secondary-button">
                Discover CodeSeed
              </a>
            </div>

            <div className="hero-note">
              <span>✳</span>
              Learn at your own pace
              <span className="note-divider">/</span>
              Build practical skills
            </div>
          </motion.div>

          <motion.div
            className="hero-visual"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="visual-glow" />

            <motion.div
              className="floating-chip chip-one"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {"<html />"}
            </motion.div>

            <motion.div
              className="floating-chip chip-two"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 3.5, repeat: Infinity }}
            >
              {"{ learn: true }"}
            </motion.div>

            <div className="code-window">
              <div className="code-window-header">
                <div className="window-dots">
                  <i />
                  <i />
                  <i />
                </div>
                <span>your-future.jsx</span>
              </div>

              <div className="code-lines">
                <p><span>01</span> <b>const</b> future = {"{"}</p>
                <p><span>02</span> &nbsp; skills: <em>"growing"</em>,</p>
                <p><span>03</span> &nbsp; projects: <em>"building"</em>,</p>
                <p><span>04</span> &nbsp; mindset: <em>"curious"</em></p>
                <p><span>05</span> {"}"};</p>
                <br />
                <p><span>06</span> <b>keepLearning();</b></p>
              </div>

              <div className="code-window-footer">
                <span><i /> READY TO BUILD</span>
                <Code2 size={15} />
              </div>
            </div>

            <div className="visual-caption">
              <span className="caption-icon">
                <Layers size={19} />
              </span>
              <div>
                <strong>Learn. Build. Grow.</strong>
                <small>One line at a time.</small>
              </div>
            </div>
          </motion.div>
        </section>

        <BookLibrary />

        <section className="about section-wrap" id="about">
          <div className="section-heading">
            <span className="eyebrow">THE CODESEED APPROACH</span>
            <h2>
              Learning should feel like <em>progress.</em>
            </h2>
            <p>
              Clear explanations. Practical knowledge. Small steps forward.
            </p>
          </div>

          <div className="benefit-grid">
            {benefits.map(({ icon: Icon, title, description }, index) => (
              <motion.article
                className="benefit-card"
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.12, duration: 0.4 }}
                whileHover={{ y: -5 }}
              >
                <div className="benefit-icon">
                  <Icon size={21} />
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="closing-section" id="purchase">
          <Sparkles size={25} />
          <h2>Your next chapter starts today.</h2>
          <p>Learn something new. Build something real.</p>
          <a href="#books" className="primary-button">
            Explore the Ebook <ArrowRight size={17} />
          </a>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-inner section-wrap">
          <a href="#home" className="footer-brand">
            <Code2 size={21} /> CodeSeed
          </a>

          <p>Helping curious minds grow, one line at a time.</p>

          <div className="footer-links">
            <a href="#home">Home</a>
            <a href="#books">Books</a>
            <a href="#about">About</a>
          </div>

          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} CodeSeed</span>
            <span>Learn. Build. Grow. ✳</span>
          </div>
        </div>
      </footer>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/admin" element={<Login />} />

        <Route path="/admin/dashboard" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:id" element={<OrderDetails />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
