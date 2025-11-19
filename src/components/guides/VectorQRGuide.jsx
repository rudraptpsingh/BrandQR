import React from 'react';
import GuideLayout from './GuideLayout';
import './VectorQRGuide.css';

const VectorQRGuide = () => {
  return (
    <GuideLayout>
      <div className="vector-qr-guide">
        {/* TL;DR Section */}
        <section className="guide-intro">
          <div className="tldr-box">
            <h3>TL;DR</h3>
            <div className="tldr-content">
              <p className="key-takeaway">
                <strong>Key Takeaway:</strong> PNG QR codes are raster images that pixelate when scaled, 
                making them unsuitable for professional print. SVG (vector) QR codes remain infinitely 
                scalable and crisp at any size—from a business card to a 20-foot billboard. For any 
                commercial print project, SVG is the only professional choice.
              </p>
              <p><strong>The Problem:</strong> Designers export PNG QR codes at 300px, then discover 
              pixelation when printing at poster size.</p>
              <p><strong>The Solution:</strong> Use SVG vector format for resolution-independent, 
              professional-quality output at any scale.</p>
            </div>
          </div>
        </section>

        {/* Section 1: The Problem with Pixels */}
        <section className="guide-section">
          <h2>The Problem with Pixels: Why PNG is the Wrong Choice for Large Formats</h2>
          
          <p>
            PNG (Portable Network Graphics) is a <strong>raster image format</strong>. This means your 
            QR code is composed of a fixed grid of pixels—tiny colored squares arranged in a specific 
            pattern. When you generate a 300×300px PNG QR code, you're locked into that resolution forever.
          </p>

          <h3>What Happens When You Scale a PNG?</h3>
          <p>
            Imagine you generate a QR code at 300×300 pixels for your business card. It looks sharp at 
            that size. But now your client wants the same code on a 6-foot trade show banner. When you 
            enlarge the PNG file, the image editing software must <em>interpolate</em>—it guesses what 
            pixels should fill the gaps. The result?
          </p>

          <div className="problem-list">
            <div className="problem-item">
              <span className="problem-icon">⚠️</span>
              <div>
                <h4>Blurry Edges</h4>
                <p>The sharp black-and-white contrast that QR scanners depend on becomes soft and fuzzy.</p>
              </div>
            </div>
            <div className="problem-item">
              <span className="problem-icon">⚠️</span>
              <div>
                <h4>Jagged Corners</h4>
                <p>Stair-stepping (aliasing) appears on diagonal lines and curves, destroying the clean geometry.</p>
              </div>
            </div>
            <div className="problem-item">
              <span className="problem-icon">⚠️</span>
              <div>
                <h4>Reduced Scanability</h4>
                <p>Scanner apps rely on high contrast. Blurred edges can cause scan failures, especially in poor lighting.</p>
              </div>
            </div>
            <div className="problem-item">
              <span className="problem-icon">⚠️</span>
              <div>
                <h4>Unprofessional Appearance</h4>
                <p>Clients and customers immediately notice low-quality graphics. Pixelation signals amateur work.</p>
              </div>
            </div>
          </div>

          <div className="visual-comparison">
            <h3>Visual Comparison: Scaled to 400%</h3>
            <div className="comparison-grid">
              <div className="comparison-item">
                <div className="comparison-visual png-example">
                  <div className="pixelated-box">
                    <span className="pixel-text">PIXELATED</span>
                  </div>
                </div>
                <p className="comparison-label bad">❌ PNG at 400%: Blurry, jagged edges</p>
              </div>
              <div className="comparison-item">
                <div className="comparison-visual svg-example">
                  <div className="crisp-box">
                    <span className="crisp-text">CRISP</span>
                  </div>
                </div>
                <p className="comparison-label good">✅ SVG at 400%: Perfect clarity</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Vector Victory */}
        <section className="guide-section">
          <h2>Vector Victory: How SVG Ensures Infinite Scaling</h2>
          
          <p>
            SVG (Scalable Vector Graphics) doesn't store pixels. Instead, it stores <strong>mathematical 
            instructions</strong> that describe the shapes, lines, and paths that make up your QR code. 
            Think of it as a blueprint rather than a photograph.
          </p>

          <h3>The Technical Advantage</h3>
          <p>
            When you open an SVG file in Illustrator, InDesign, or send it to a professional printer, 
            the rendering engine reads the mathematical paths and draws the image at whatever resolution 
            the output device supports. Printing on a 300 DPI desktop printer? The SVG renders perfectly. 
            Sending to a 2400 DPI commercial press for a billboard? Still perfect.
          </p>

          <div className="tech-callout">
            <h4>🔬 Under the Hood</h4>
            <p>
              An SVG QR code contains path data like: <code>&lt;rect x="10" y="10" width="5" height="5"/&gt;</code>. 
              This tells the renderer to draw a rectangle at specific coordinates. No matter the final 
              size, those coordinates are recalculated proportionally, maintaining infinite precision.
            </p>
          </div>

          {/* Comparison Table */}
          <div className="comparison-table-wrapper">
            <h3>Technical Comparison: SVG vs. PNG</h3>
            <table className="spec-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th className="svg-col">SVG (Vector)</th>
                  <th className="png-col">PNG (Raster)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Scalability</strong></td>
                  <td className="svg-col">✅ Infinite - No quality loss at any size</td>
                  <td className="png-col">❌ Fixed resolution - Pixelates when enlarged</td>
                </tr>
                <tr>
                  <td><strong>File Size</strong></td>
                  <td className="svg-col">✅ Tiny (2-5KB typically)</td>
                  <td className="png-col">⚠️ Large (50-200KB for high-res)</td>
                </tr>
                <tr>
                  <td><strong>Print Quality</strong></td>
                  <td className="svg-col">✅ Professional - Sharp at any DPI</td>
                  <td className="png-col">❌ Limited by original resolution</td>
                </tr>
                <tr>
                  <td><strong>Editability</strong></td>
                  <td className="svg-col">✅ Fully editable in vector software</td>
                  <td className="png-col">❌ Cannot edit paths, only pixels</td>
                </tr>
                <tr>
                  <td><strong>Color Changes</strong></td>
                  <td className="svg-col">✅ Easy - Change fill colors in code or software</td>
                  <td className="png-col">⚠️ Difficult - Requires raster editing</td>
                </tr>
                <tr>
                  <td><strong>Commercial Print</strong></td>
                  <td className="svg-col">✅ Preferred by professional printers</td>
                  <td className="png-col">❌ Often rejected or requires upsampling</td>
                </tr>
                <tr>
                  <td><strong>Web Use</strong></td>
                  <td className="svg-col">✅ Works perfectly, responsive</td>
                  <td className="png-col">✅ Works well, but not scalable</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="pro-tip">
            <h4>BrandQR Advantage</h4>
            <p>
              BrandQR generates both SVG and PNG formats simultaneously. For any print project—business 
              cards, posters, packaging, vehicle wraps—always choose SVG. Save PNG only for quick web 
              previews or social media where resolution is fixed.
            </p>
          </div>
        </section>

        {/* Section 3: Preparing for Professional Printers */}
        <section className="guide-section">
          <h2>For the Design Pro: Preparing Your SVG QR Code for Professional Printers</h2>
          
          <p>
            Professional print shops have specific requirements. Here's how to ensure your SVG QR code 
            passes technical review and prints flawlessly.
          </p>

          <h3>1. Verify Quiet Zone (Margin)</h3>
          <p>
            The <strong>quiet zone</strong> is the white border surrounding your QR code. It's technically 
            required to be at least 4 modules wide (4× the width of the smallest square in the QR pattern). 
            Most scanners are forgiving, but professional applications demand precision.
          </p>

          <div className="spec-detail">
            <h4>📐 Technical Specification</h4>
            <p>
              If your QR code's smallest module is 2mm, your quiet zone must be at least 8mm on all sides. 
              BrandQR automatically includes this margin in the SVG export, but always verify before sending 
              to print.
            </p>
          </div>

          <h3>2. Convert Text to Outlines (If Using Custom Fonts)</h3>
          <p>
            If you've added custom text below your QR code in Illustrator or InDesign, <strong>convert 
            all text to outlines</strong> before exporting the final file. This prevents font substitution 
            errors at the print shop.
          </p>

          <h3>3. Check Color Mode: RGB vs. CMYK</h3>
          <p>
            Most digital QR generators (including BrandQR) export in RGB color space since they're 
            designed for screens. For offset printing, your printer may request CMYK conversion. In 
            Illustrator or InDesign:
          </p>

          <ul className="process-list">
            <li>Open the SVG file</li>
            <li>Go to <strong>File → Document Color Mode → CMYK Color</strong></li>
            <li>Select your QR code and ensure the black is set to <strong>K:100</strong> (rich black)</li>
            <li>Save as PDF or export as press-ready file format</li>
          </ul>

          <h3>4. Confirm Minimum Print Size</h3>
          <p>
            While SVG scales infinitely, <em>scanability</em> depends on the physical size of the modules. 
            The general rule:
          </p>

          <div className="size-guide">
            <div className="size-item">
              <h4>Minimum Reliable Size</h4>
              <p><strong>0.8 inches (2 cm) square</strong></p>
              <p className="size-note">Smaller sizes risk scan failures on older devices</p>
            </div>
            <div className="size-item">
              <h4>Recommended Business Card Size</h4>
              <p><strong>1 inch (2.5 cm) square</strong></p>
              <p className="size-note">Comfortable scanning distance, professional appearance</p>
            </div>
            <div className="size-item">
              <h4>Poster/Billboard Size</h4>
              <p><strong>3-6 inches (7.5-15 cm) square</strong></p>
              <p className="size-note">Scannable from several feet away</p>
            </div>
          </div>

          <p className="internal-link-context">
            For more on design optimization, see our 
            <a href="/guides/branded-qr-code-analytics" className="internal-link"> Ultimate Guide to Branded QR Codes</a>.
          </p>
        </section>

        {/* Section 4: Technical Specs - Quiet Zone */}
        <section className="guide-section">
          <h2>Technical Specs: What is the Optimal Quiet Zone in SVG?</h2>
          
          <p>
            The quiet zone (also called the "clear zone") is one of the most commonly overlooked aspects 
            of QR code design, yet it's critical for reliable scanning.
          </p>

          <h3>Why the Quiet Zone Matters</h3>
          <p>
            QR code scanners identify the code by locating the three large squares in the corners 
            (called "finder patterns"). The quiet zone provides visual separation from surrounding 
            graphics, text, or background patterns. Without it, the scanner may fail to detect the 
            code boundaries.
          </p>

          <div className="quiet-zone-visual">
            <div className="zone-diagram">
              <div className="qr-pattern">
                <div className="finder-pattern top-left"></div>
                <div className="finder-pattern top-right"></div>
                <div className="finder-pattern bottom-left"></div>
                <div className="data-modules"></div>
              </div>
              <div className="zone-margin">
                <span className="margin-label">Quiet Zone (4 modules minimum)</span>
              </div>
            </div>
          </div>

          <h3>ISO/IEC Standard</h3>
          <p>
            The official ISO/IEC 18004 standard mandates a quiet zone of <strong>4 modules</strong> on 
            all four sides. A "module" is the width of one small square in the QR pattern.
          </p>

          <div className="calculation-example">
            <h4>Example Calculation</h4>
            <p>
              If your QR code is 33 modules wide (common for basic URLs) and you're printing at 3.3 cm:
            </p>
            <ul>
              <li>Module width = 3.3 cm ÷ 33 = <strong>1 mm</strong></li>
              <li>Required quiet zone = 4 × 1 mm = <strong>4 mm on each side</strong></li>
              <li>Total printable area = 3.3 cm + 0.8 cm = <strong>4.1 cm square</strong></li>
            </ul>
          </div>

          <div className="important-note">
            <strong>BrandQR's Default:</strong> All SVG exports from BrandQR include a 4-module quiet 
            zone by default. You don't need to manually add margins. However, if you're placing the SVG 
            on a busy background, consider increasing the margin to 5-6 modules for extra safety.
          </div>
        </section>

        {/* Section 5: Real-World Use Cases */}
        <section className="guide-section">
          <h2>Real-World Applications: When SVG is Non-Negotiable</h2>
          
          <p>
            Here are scenarios where using PNG instead of SVG would result in project failure or costly reprints:
          </p>

          <div className="use-cases">
            <div className="use-case-item">
              <h3>🏢 Corporate Branding Materials</h3>
              <p>
                <strong>Scenario:</strong> Your brand guidelines require QR codes on letterheads, business 
                cards, and large-format posters.
              </p>
              <p>
                <strong>Why SVG:</strong> One master SVG file scales perfectly from a 0.5-inch business 
                card print to a 3-foot poster without quality loss. PNG would require separate files at 
                different resolutions, risking inconsistency.
              </p>
            </div>

            <div className="use-case-item">
              <h3>📦 Product Packaging</h3>
              <p>
                <strong>Scenario:</strong> Printing QR codes on product boxes, labels, or flexible packaging 
                for warranty registration or recipe lookups.
              </p>
              <p>
                <strong>Why SVG:</strong> Packaging printers use high-resolution platemaking processes. 
                A PNG exported at 300 DPI may look soft next to sharp typography. SVG integrates seamlessly 
                with professional packaging workflows.
              </p>
            </div>

            <div className="use-case-item">
              <h3>🚗 Vehicle Wraps & Signage</h3>
              <p>
                <strong>Scenario:</strong> QR codes on delivery vans, storefront windows, or trade show 
                booth graphics.
              </p>
              <p>
                <strong>Why SVG:</strong> Large-format printers output at resolutions up to 1440 DPI for 
                close viewing. Even a high-res PNG (600 DPI) can appear jagged at billboard scale. SVG 
                renders perfectly at any output resolution.
              </p>
            </div>

            <div className="use-case-item">
              <h3>📄 Magazine & Newspaper Ads</h3>
              <p>
                <strong>Scenario:</strong> Including QR codes in print advertisements for publications.
              </p>
              <p>
                <strong>Why SVG:</strong> Publishers often require vector artwork for all graphics to 
                ensure press-ready files. Submitting a PNG may result in rejection or a request for revision, 
                delaying publication.
              </p>
            </div>
          </div>
        </section>

        {/* Section 6: Conclusion */}
        <section className="guide-section conclusion">
          <h2>Get Crisp, Scannable Designs Every Time</h2>
          
          <p>
            For designers and marketers working on professional print projects, the choice between SVG 
            and PNG isn't really a choice at all. SVG's resolution independence, tiny file size, and 
            editability make it the only format worth using for commercial applications.
          </p>

          <p>
            BrandQR makes it effortless: every QR code you generate includes both formats, but for 
            anything heading to a printer—or anything you might want to scale in the future—reach for 
            the SVG. Your printer will thank you, your clients will notice the quality, and you'll 
            never waste time regenerating codes at higher resolutions.
          </p>

          <div className="final-cta-inline">
            <h3>Ready to generate professional-quality SVG QR codes?</h3>
            <a 
              href="/" 
              className="inline-cta-button"
              onClick={() => window.scrollTo(0, 0)}
            >
              Start Generating Your SVG QR Code →
            </a>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="guide-section faq" itemScope itemType="https://schema.org/FAQPage">
          <h2>Frequently Asked Questions: SVG vs. PNG QR Codes</h2>
          
          <div className="faq-list">
            <div className="faq-item" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
              <h3 itemProp="name">Can I use a PNG QR code for print if I export it at high resolution?</h3>
              <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                <p itemProp="text">
                  You can, but it's not recommended. Even a PNG exported at 600 or 1200 DPI is still a 
                  fixed-resolution raster image. If you need to scale it larger than the original export 
                  size, you'll encounter pixelation. SVG sidesteps this problem entirely by storing 
                  mathematical paths that render perfectly at any resolution. Professional designers always 
                  choose SVG for print to avoid reprints and quality issues.
                </p>
              </div>
            </div>

            <div className="faq-item" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
              <h3 itemProp="name">Will an SVG QR code work on my website?</h3>
              <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                <p itemProp="text">
                  Yes, absolutely. All modern browsers support SVG natively. You can embed SVG QR codes 
                  directly into HTML using an <code>&lt;img&gt;</code> tag or inline SVG code. SVG even 
                  has advantages for web: it's responsive (scales with screen size), smaller in file size, 
                  and looks sharp on high-DPI retina displays without any extra effort.
                </p>
              </div>
            </div>

            <div className="faq-item" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
              <h3 itemProp="name">How do I open and edit an SVG file?</h3>
              <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                <p itemProp="text">
                  You can open SVG files in vector editing software like Adobe Illustrator, Affinity 
                  Designer, CorelDRAW, or the free Inkscape. You can also view and edit SVG code directly 
                  in any text editor since it's XML-based. For print workflows, import the SVG into Adobe 
                  InDesign or place it directly into your layout. Most professional printing services accept 
                  SVG files without conversion.
                </p>
              </div>
            </div>

            <div className="faq-item" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
              <h3 itemProp="name">What's the file size difference between SVG and PNG?</h3>
              <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                <p itemProp="text">
                  A typical QR code in SVG format is 2-5 KB. The same QR code as a high-resolution PNG 
                  (e.g., 2000×2000 pixels at 300 DPI) might be 50-200 KB—up to 40× larger. This makes SVG 
                  ideal for email attachments, web delivery, and reducing storage costs when managing 
                  thousands of codes.
                </p>
              </div>
            </div>

            <div className="faq-item" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
              <h3 itemProp="name">Do I need special software to create SVG QR codes?</h3>
              <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                <p itemProp="text">
                  No—BrandQR generates both SVG and PNG formats automatically when you create a QR code. 
                  Simply choose the SVG download option after generating your code. There's no additional 
                  software, plugins, or technical knowledge required. BrandQR handles all the vector path 
                  generation behind the scenes.
                </p>
              </div>
            </div>

            <div className="faq-item" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
              <h3 itemProp="name">Can I change the color of an SVG QR code after downloading?</h3>
              <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                <p itemProp="text">
                  Yes! This is one of SVG's major advantages. Open the SVG in Illustrator or any vector 
                  editor, select the paths, and change the fill color. You can even edit the SVG code 
                  directly in a text editor by changing the <code>fill="#000000"</code> attribute to any 
                  hex color code. This flexibility is impossible with PNG files.
                </p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </GuideLayout>
  );
};

export default VectorQRGuide;

