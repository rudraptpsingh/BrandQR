import React from 'react';
import { Link } from 'react-router-dom';
import { getAllGuides } from '../../data/guidesData';
import './GuidesListing.css';

const GuidesListing = () => {
  const guides = getAllGuides();
  const featuredGuides = getAllGuides({ featured: true });
  const regularGuides = guides.filter(guide => !guide.featured);

  return (
    <div className="guides-listing">
      {/* Navigation Bar */}
      <nav className="guides-nav">
        <div className="guides-nav-content">
          <Link 
            to="/" 
            className="guides-logo"
            onClick={() => window.scrollTo(0, 0)}
          >
            <div className="guides-logo-icon"></div>
            <span>BrandQR</span>
          </Link>
          <Link 
            to="/" 
            className="guides-back-link"
            onClick={() => window.scrollTo(0, 0)}
          >
            ← Back to Home
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="guides-hero">
        <div className="guides-hero-content">
          <h1>Guides & Resources</h1>
          <p>
            Master QR codes with our comprehensive guides on design, tracking, 
            analytics, and best practices for maximum ROI.
          </p>
        </div>
      </header>

      {/* Featured Guides */}
      {featuredGuides.length > 0 && (
        <section className="guides-featured-section">
          <div className="guides-container">
            <h2 className="guides-section-title">Featured Guide</h2>
            <div className="guides-featured-grid">
              {featuredGuides.map(guide => (
                <Link 
                  key={guide.id} 
                  to={`/guides/${guide.slug}`}
                  className="guide-card featured"
                >
                  <div className="guide-card-content">
                    <div className="guide-card-meta">
                      <span className="guide-card-category">{guide.category}</span>
                      <span className="guide-card-read-time">{guide.readTime}</span>
                    </div>
                    <h3 className="guide-card-title">{guide.title}</h3>
                    <p className="guide-card-excerpt">{guide.excerpt}</p>
                    <div className="guide-card-footer">
                      <div className="guide-card-tags">
                        {guide.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="guide-tag">{tag}</span>
                        ))}
                      </div>
                      <span className="guide-card-cta">Read Guide →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Guides */}
      <section className="guides-all-section">
        <div className="guides-container">
          <h2 className="guides-section-title">All Guides</h2>
          <div className="guides-grid">
            {guides.map(guide => (
              <Link 
                key={guide.id} 
                to={`/guides/${guide.slug}`}
                className="guide-card"
              >
                <div className="guide-card-content">
                  <div className="guide-card-meta">
                    <span className="guide-card-category">{guide.category}</span>
                    <span className="guide-card-read-time">{guide.readTime}</span>
                  </div>
                  <h3 className="guide-card-title">{guide.title}</h3>
                  <p className="guide-card-excerpt">{guide.excerpt}</p>
                  <div className="guide-card-footer">
                    <div className="guide-card-tags">
                      {guide.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="guide-tag">{tag}</span>
                      ))}
                    </div>
                    <span className="guide-card-cta">Read Guide →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Empty State */}
          {guides.length === 0 && (
            <div className="guides-empty">
              <p>No guides available yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="guides-cta-section">
        <div className="guides-cta-content">
          <h2>Ready to Create Your Branded QR Code?</h2>
          <p>Put your knowledge into action with our powerful QR code generator.</p>
          <Link 
            to="/" 
            className="guides-cta-button"
            onClick={() => window.scrollTo(0, 0)}
          >
            Start Generating Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default GuidesListing;

