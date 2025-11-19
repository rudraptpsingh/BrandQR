import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { getGuideBySlug, getRelatedGuides } from '../../data/guidesData';
import './GuideLayout.css';

const GuideLayout = ({ children }) => {
  const { slug } = useParams();
  const guideData = getGuideBySlug(slug);
  const relatedGuides = getRelatedGuides(slug);

  if (!guideData) {
    return (
      <div className="guide-layout">
        <div className="guide-not-found">
          <h1>Guide Not Found</h1>
          <p>The guide you're looking for doesn't exist.</p>
          <Link to="/guides" className="back-to-guides">← Back to Guides</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="guide-layout">
      {/* Navigation */}
      <nav className="guide-nav">
        <div className="guide-nav-content">
          <Link 
            to="/" 
            className="guide-logo"
            onClick={() => window.scrollTo(0, 0)}
          >
            <div className="guide-logo-icon"></div>
            <span>BrandQR</span>
          </Link>
          <div className="guide-nav-links">
            <Link to="/guides" className="guide-nav-link">
              ← All Guides
            </Link>
            <Link 
              to="/" 
              className="guide-nav-cta"
              onClick={() => window.scrollTo(0, 0)}
            >
              Try Generator
            </Link>
          </div>
        </div>
      </nav>

      {/* Guide Header */}
      <header className="guide-header">
        <div className="guide-header-content">
          <div className="guide-breadcrumb">
            <Link to="/">Home</Link>
            <span className="breadcrumb-separator">›</span>
            <Link to="/guides">Guides</Link>
            <span className="breadcrumb-separator">›</span>
            <span>{guideData.category}</span>
          </div>
          <h1 className="guide-title">{guideData.title}</h1>
          <div className="guide-meta">
            <span className="guide-author">By {guideData.author}</span>
            <span className="guide-separator">•</span>
            <span className="guide-date">{new Date(guideData.publishedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            <span className="guide-separator">•</span>
            <span className="guide-read-time">{guideData.readTime}</span>
          </div>
          <div className="guide-tags">
            {guideData.tags.map(tag => (
              <span key={tag} className="guide-header-tag">{tag}</span>
            ))}
          </div>
        </div>
      </header>

      {/* Guide Content */}
      <main className="guide-main">
        <article className="guide-article">
          {children}
        </article>
      </main>

      {/* Related Guides */}
      {relatedGuides.length > 0 && (
        <section className="related-guides-section">
          <div className="related-guides-content">
            <h2>Related Guides</h2>
            <div className="related-guides-grid">
              {relatedGuides.map(guide => (
                <Link
                  key={guide.id}
                  to={`/guides/${guide.slug}`}
                  className="related-guide-card"
                >
                  <div className="related-guide-category">{guide.category}</div>
                  <h3 className="related-guide-title">{guide.title}</h3>
                  <p className="related-guide-excerpt">{guide.excerpt}</p>
                  <span className="related-guide-cta">Read Guide →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="guide-cta-section">
        <div className="guide-cta-content">
          <h2>Ready to Create Your Branded QR Code?</h2>
          <p>Put this knowledge into action with our powerful generator.</p>
          <Link 
            to="/" 
            className="guide-cta-button"
            onClick={() => window.scrollTo(0, 0)}
          >
            Start Generating Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="guide-footer">
        <div className="guide-footer-content">
          <div className="guide-footer-brand">
            <div className="guide-footer-logo">
              <div className="guide-logo-icon"></div>
              <span>BrandQR</span>
            </div>
            <p>Create trackable, branded QR codes instantly.</p>
          </div>
          <div className="guide-footer-links">
            <Link 
              to="/"
              onClick={() => window.scrollTo(0, 0)}
            >
              Generator
            </Link>
            <Link to="/guides">Guides</Link>
          </div>
        </div>
        <div className="guide-footer-bottom">
          <p>&copy; {new Date().getFullYear()} BrandQR. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default GuideLayout;

