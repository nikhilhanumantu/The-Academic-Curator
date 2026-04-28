const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const puppeteer = require('puppeteer');
// const { OpenAI } = require('openai'); // Uncomment when OpenAI API key is available
const StudentProfile = require('../models/StudentProfile');

// @route   POST api/resume/generate
// @desc    Generate PDF Resume based on student profile and template type
router.post('/generate', auth, async (req, res) => {
  try {
    const { template } = req.body;
    const profile = await StudentProfile.findOne({ userId: req.user.id }).populate('userId', ['name', 'email']);
    
    if (!profile) {
      return res.status(400).json({ msg: 'Profile not found' });
    }

    let resumeHTML = '';

    // PROFESSIONAL TECHNICAL TEMPLATE (FAANG Standards)
    const name = profile.userId.name.toUpperCase();
    const email = profile.userId.email;
    
    resumeHTML = `
      <html>
        <head>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
            body { 
              font-family: 'Inter', sans-serif; 
              padding: 40px 60px; 
              color: #111; 
              background: #fff; 
              line-height: 1.4;
              font-size: 10.5pt;
            }
            .header { text-align: center; margin-bottom: 20px; }
            .name { font-size: 24pt; font-weight: 700; margin-bottom: 5px; }
            .contact { font-size: 10pt; color: #444; }
            
            section { margin-top: 15px; }
            .section-title { 
              font-size: 12pt; 
              font-weight: 700; 
              text-transform: uppercase; 
              border-bottom: 1px solid #111;
              padding-bottom: 2px;
              margin-bottom: 8px;
            }
            
            .entry { margin-bottom: 10px; }
            .entry-header { display: flex; justify-content: space-between; font-weight: 700; }
            .entry-sub { display: flex; justify-content: space-between; font-style: italic; color: #444; margin-bottom: 3px; }
            
            ul { margin: 5px 0 0 20px; padding: 0; }
            li { margin-bottom: 4px; }
            
            .skills-grid { 
              display: grid; 
              grid-template-columns: auto 1fr; 
              gap: 10px; 
              margin-top: 5px;
            }
            .skills-label { font-weight: 700; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="name">${name}</div>
            <div class="contact">
              ${email} | ${profile.location || 'Location'} | 
              ${profile.phone || 'Phone'} | 
              ${profile.linkedin ? 'LinkedIn' : ''} | 
              ${profile.github ? 'GitHub' : ''}
            </div>
          </div>

          <section>
            <div class="section-title">Education</div>
            ${profile.education.map(edu => `
              <div class="entry">
                <div class="entry-header">
                  <span>${edu.school}</span>
                  <span>${edu.location || ''}</span>
                </div>
                <div class="entry-sub">
                  <span>${edu.degree || ''} in ${edu.fieldOfStudy || ''}</span>
                  <span>${edu.startYear} – ${edu.endYear || 'Present'}</span>
                </div>
              </div>
            `).join('')}
          </section>

          <section>
            <div class="section-title">Experience</div>
            ${profile.projects.length > 0 ? profile.projects.map(proj => `
              <div class="entry">
                <div class="entry-header">
                  <span>${proj.title}</span>
                  <span>${proj.date || ''}</span>
                </div>
                <ul>
                  <li>${proj.description}</li>
                  ${proj.technologies ? `<li><strong>Technologies:</strong> ${proj.technologies.join(', ')}</li>` : ''}
                </ul>
              </div>
            `).join('') : '<p>No experience listed.</p>'}
          </section>

          <section>
            <div class="section-title">Technical Skills</div>
            <div class="skills-grid">
              <span class="skills-label">Skills:</span>
              <span>${profile.skills.join(', ')}</span>
            </div>
          </section>
        </body>
      </html>
    `;

    // Convert HTML to PDF using Puppeteer
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(resumeHTML, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    
    await browser.close();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${profile.userId.name.replace(/\s+/g, '_')}_Resume.pdf"`
    });
    
    res.send(pdfBuffer);

  } catch (err) {
    console.error('Error generating resume:', err);
    res.status(500).send('Server Error generating resume');
  }
});

module.exports = router;
