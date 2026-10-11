
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, Menu, X, ArrowUpRight, BookOpen } from "lucide-react";

const links = [
  { label: "Home", href: "#home" },
  { label: "Books", href: "#books" },
  { label: "About", href: "#about" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <motion.header
      className="navbar"
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55 }}
    >
      <a href="#home" className="brand" aria-label="CodeSeed home">
        <span className="brand-icon"><Code2 size={21} /></span>
        <span className="brand-name">Code<span>Seed</span></span>
      </a>

      <nav className="desktop-nav" aria-label="Main navigation">
        {links.map((link) => (
          <a className="nav-link" key={link.href} href={link.href}>
            {link.label}
          </a>
        ))}
      </nav>

      <a href="#books" className="nav-cta">
        <BookOpen size={16} />
        <span>Explore Books</span>
        <ArrowUpRight size={16} />
      </a>

      <button
        className="mobile-menu-button"
        type="button"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        {menuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            className="mobile-nav"
            aria-label="Mobile navigation"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
                <ArrowUpRight size={16} />
              </a>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
