# 📧 Email Templates Guide

This guide provides ready-to-use email templates for your hiring assistant application. These templates are safe to copy and paste directly into the email template editor without breaking the application UI.

## 🚀 Quick Start

1. Navigate to **Email Templates** in your dashboard
2. Click **"New Template"**
3. Copy and paste any template from this guide into the **Content** field
4. Set the appropriate category and subject line
5. Save and start using!

## 📋 Template Categories

Our templates are organized into 6 categories:

- **Acknowledgment** - Thank candidates for applying
- **Screening** - Initial screening questions and information gathering
- **Interview** - Interview invitations and scheduling
- **Offer** - Job offer communications
- **Rejection** - Polite rejection notifications
- **Follow Up** - Follow-up communications

## 🎨 Available Templates

### 1. Acknowledgment Template

**Category:** `acknowledgment`  
**Subject:** `Thank you for your application - {{jobPosition}} at {{companyName}}`

**HTML Content:**
```html
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1>🎯 Thank You for Your Interest!</h1>
  </div>
  <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
    <p>Dear {{firstName}} {{lastName}},</p>
    
    <p>Thank you for submitting your resume for consideration. We have received your application and our hiring team is currently reviewing it.</p>
    
    <div style="background: #e3f2fd; padding: 15px; border-left: 4px solid #2196f3; margin: 20px 0;">
      <strong>What happens next?</strong>
      <ul>
        <li>Our team will review your qualifications within the next 3-5 business days</li>
        <li>If your background matches our requirements, we'll reach out to schedule an interview</li>
        <li>We'll keep you updated on the status of your application</li>
      </ul>
    </div>
    
    <p>We appreciate the time you took to apply and look forward to potentially working together.</p>
    
    <p>Best regards,<br>
    <strong>{{senderName}}</strong><br>
    {{companyName}}</p>
  </div>
  <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px;">
    <p>This is an automated message. Please do not reply to this email.</p>
  </div>
</div>
```

---

### 2. Screening Template

**Category:** `screening`  
**Subject:** `Next Steps - {{jobPosition}} Position at {{companyName}}`

**HTML Content:**
```html
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1>🚀 Next Steps - {{jobPosition}}</h1>
  </div>
  <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
    <p>Dear {{firstName}},</p>
    
    <p>Thank you for your interest in the <strong>{{jobPosition}} position at {{companyName}}</strong>. We're excited to learn more about your background and interest in joining our team.</p>
    
    <p>Before we proceed with the next steps, we'd like to confirm a few important details and ask some initial screening questions:</p>
    
    <div style="background: #fff; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #4f46e5;">
      <h3>📅 Duration Commitment (Critical)</h3>
      <p>Our internship is a <strong>full-time, 6-12 month commitment starting Sep/Oct 2025</strong>.</p>
      <div style="background: #f1f5f9; padding: 15px; border-radius: 6px; margin: 10px 0;">
        <ul>
          <li>Can you confirm your availability for the entire duration of this internship?</li>
          <li>Are there any academic, personal, or other commitments that might conflict with this timeline?</li>
          <li>Are you able to work on-site at our office in Singapore during the internship period?</li>
        </ul>
      </div>
    </div>
    
    <div style="background: #fff; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #4f46e5;">
      <h3>💻 Technical Background</h3>
      <p>Please rate your experience level (1-5, where 5 is expert) with the following technologies:</p>
      <div style="background: #f1f5f9; padding: 15px; border-radius: 6px; margin: 10px 0;">
        <ul>
          <li>TypeScript/JavaScript</li>
          <li>Node.js/Express.js</li>
          <li>React (or similar frontend frameworks)</li>
          <li>Databases (PostgreSQL, SQL)</li>
          <li>Full-stack development</li>
        </ul>
      </div>
      <p>Can you share a brief description of your most significant software development project? Please include:</p>
      <div style="background: #f1f5f9; padding: 15px; border-radius: 6px; margin: 10px 0;">
        <ul>
          <li>Technologies used</li>
          <li>Your role and contributions</li>
          <li>Link to GitHub repository or portfolio (if available)</li>
        </ul>
      </div>
    </div>
    
    <div style="background: #fff; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #4f46e5;">
      <h3>🤝 Work Style & Availability</h3>
      <div style="background: #f1f5f9; padding: 15px; border-radius: 6px; margin: 10px 0;">
        <ul>
          <li>Describe a time when you worked effectively in a team environment. What was your role and contribution?</li>
          <li>Are you comfortable with a collaborative, fast-paced startup environment where you might need to adapt quickly to new technologies and requirements?</li>
        </ul>
      </div>
    </div>
    
    <div style="text-align: left; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666;">
      <div style="margin-top: 20px; font-weight: 500;">
        Best regards,<br>
        {{senderName}}<br>
        {{senderTitle}}<br>
        {{companyName}}
      </div>
    </div>
  </div>
</div>
```

---

### 3. Interview Invitation Template

**Category:** `interview`  
**Subject:** `Interview Invitation - {{jobPosition}} at {{companyName}}`

**HTML Content:**
```html
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1>🎉 You're Invited to Interview!</h1>
  </div>
  <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
    <p>Dear {{firstName}},</p>
    
    <p>Great news! We were impressed with your application for the <strong>{{jobPosition}}</strong> position at {{companyName}} and would like to invite you for an interview.</p>
    
    <div style="background: #d1fae5; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0; border-radius: 8px;">
      <h3 style="margin-top: 0; color: #065f46;">📅 Interview Details</h3>
      <ul style="margin: 10px 0;">
        <li><strong>Date & Time:</strong> [Please reply with your availability]</li>
        <li><strong>Duration:</strong> Approximately 45-60 minutes</li>
        <li><strong>Format:</strong> Video call via Google Meet</li>
        <li><strong>Interviewer:</strong> {{senderName}}, {{senderTitle}}</li>
      </ul>
    </div>
    
    <div style="background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; border-radius: 8px;">
      <h3 style="margin-top: 0; color: #92400e;">🎯 What to Expect</h3>
      <ul style="margin: 10px 0;">
        <li>Discussion about your technical background and experience</li>
        <li>Questions about your interest in the role and company</li>
        <li>Technical problem-solving or coding exercise</li>
        <li>Opportunity for you to ask questions about the role and team</li>
      </ul>
    </div>
    
    <p>Please reply to this email with your availability for the coming week, and we'll send you the meeting link and any preparation materials.</p>
    
    <p>We're looking forward to speaking with you!</p>
    
    <p>Best regards,<br>
    <strong>{{senderName}}</strong><br>
    {{senderTitle}}<br>
    {{companyName}}</p>
  </div>
</div>
```

---

### 4. Job Offer Template

**Category:** `offer`  
**Subject:** `Job Offer - {{jobPosition}} at {{companyName}}`

**HTML Content:**
```html
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1>🎊 Congratulations! Job Offer</h1>
  </div>
  <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
    <p>Dear {{firstName}},</p>
    
    <p>Congratulations! We are delighted to extend an offer for the <strong>{{jobPosition}}</strong> position at {{companyName}}.</p>
    
    <p>After careful consideration of your qualifications, experience, and interview performance, we believe you would be an excellent addition to our team.</p>
    
    <div style="background: #f3e8ff; padding: 20px; border-left: 4px solid #8b5cf6; margin: 20px 0; border-radius: 8px;">
      <h3 style="margin-top: 0; color: #6b46c1;">📋 Offer Details</h3>
      <ul style="margin: 10px 0;">
        <li><strong>Position:</strong> {{jobPosition}}</li>
        <li><strong>Start Date:</strong> [To be discussed]</li>
        <li><strong>Employment Type:</strong> Full-time</li>
        <li><strong>Reporting To:</strong> {{senderName}}</li>
      </ul>
    </div>
    
    <div style="background: #dbeafe; padding: 15px; border-left: 4px solid #3b82f6; margin: 20px 0; border-radius: 8px;">
      <h3 style="margin-top: 0; color: #1e40af;">📄 Next Steps</h3>
      <p style="margin: 10px 0;">Please review the attached offer letter carefully. If you have any questions or would like to discuss any aspects of the offer, please don't hesitate to reach out.</p>
      <p style="margin: 10px 0;"><strong>Please respond by [DATE] to confirm your acceptance.</strong></p>
    </div>
    
    <p>We're excited about the possibility of you joining our team and contributing to our mission!</p>
    
    <p>Best regards,<br>
    <strong>{{senderName}}</strong><br>
    {{senderTitle}}<br>
    {{companyName}}</p>
  </div>
</div>
```

---

### 5. Rejection Template

**Category:** `rejection`  
**Subject:** `Update on Your Application - {{jobPosition}} at {{companyName}}`

**HTML Content:**
```html
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1>📋 Application Update</h1>
  </div>
  <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
    <p>Dear {{firstName}},</p>
    
    <p>Thank you for your interest in the <strong>{{jobPosition}}</strong> position at {{companyName}} and for taking the time to go through our application process.</p>
    
    <p>After careful consideration, we have decided to move forward with other candidates whose experience more closely matches our current needs for this specific role.</p>
    
    <div style="background: #fef2f2; padding: 20px; border-left: 4px solid #f87171; margin: 20px 0; border-radius: 8px;">
      <h3 style="margin-top: 0; color: #dc2626;">🙏 Our Appreciation</h3>
      <p style="margin: 10px 0;">We want to express our sincere appreciation for the time and effort you invested in your application. The quality of candidates like yourself makes these decisions very challenging.</p>
    </div>
    
    <div style="background: #ecfdf5; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0; border-radius: 8px;">
      <h3 style="margin-top: 0; color: #047857;">🚀 Future Opportunities</h3>
      <p style="margin: 10px 0;">We encourage you to apply for future openings that might be a better fit for your skills and experience. We'll keep your resume on file for upcoming opportunities.</p>
    </div>
    
    <p>We wish you all the best in your job search and future career endeavors.</p>
    
    <p>Best regards,<br>
    <strong>{{senderName}}</strong><br>
    {{senderTitle}}<br>
    {{companyName}}</p>
  </div>
</div>
```

---

### 6. Follow-up Template

**Category:** `follow_up`  
**Subject:** `Following up - {{jobPosition}} Application at {{companyName}}`

**HTML Content:**
```html
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1>📞 Following Up on Your Application</h1>
  </div>
  <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
    <p>Dear {{firstName}},</p>
    
    <p>I hope this email finds you well. I wanted to follow up on your application for the <strong>{{jobPosition}}</strong> position at {{companyName}}.</p>
    
    <div style="background: #fef3c7; padding: 20px; border-left: 4px solid #f59e0b; margin: 20px 0; border-radius: 8px;">
      <h3 style="margin-top: 0; color: #92400e;">📋 Current Status</h3>
      <p style="margin: 10px 0;">We're still in the process of reviewing applications and wanted to keep you updated on where things stand. Your application is being given careful consideration.</p>
    </div>
    
    <div style="background: #e0e7ff; padding: 15px; border-left: 4px solid #6366f1; margin: 20px 0; border-radius: 8px;">
      <h3 style="margin-top: 0; color: #3730a3;">⏰ Timeline</h3>
      <p style="margin: 10px 0;">We expect to make decisions within the next 1-2 weeks and will be in touch with next steps shortly.</p>
    </div>
    
    <p>In the meantime, if you have any questions about the role or our company, please don't hesitate to reach out.</p>
    
    <p>Thank you for your patience and continued interest in joining our team.</p>
    
    <p>Best regards,<br>
    <strong>{{senderName}}</strong><br>
    {{senderTitle}}<br>
    {{companyName}}</p>
  </div>
</div>
```

## 🔧 Template Variables

All templates support the following variables that will be automatically replaced with actual data:

### Required Variables
- `{{firstName}}` - Candidate's first name
- `{{lastName}}` - Candidate's last name  
- `{{email}}` - Candidate's email address

### Optional Variables
- `{{fullName}}` - Candidate's full name
- `{{jobPosition}}` - Job position title
- `{{companyName}}` - Your company name
- `{{senderName}}` - Name of the email sender
- `{{senderTitle}}` - Job title of the sender
- `{{currentDate}}` - Current date

### Extended Variables (from resume data)
- `{{phone}}` - Candidate's phone number
- `{{linkedinUrl}}` - LinkedIn profile URL
- `{{githubUrl}}` - GitHub profile URL
- `{{portfolioUrl}}` - Portfolio website URL
- `{{skills}}` - List of candidate skills
- `{{experience}}` - Work experience details
- `{{education}}` - Educational background

## 🎨 Customization Tips

### Colors and Branding
Each template uses different gradient colors. You can customize them by changing the `background` style values:

- **Acknowledgment**: Purple gradient (`#667eea` to `#764ba2`)
- **Screening**: Blue-purple gradient (`#4f46e5` to `#7c3aed`)
- **Interview**: Green gradient (`#10b981` to `#059669`)
- **Offer**: Purple gradient (`#8b5cf6` to `#7c3aed`)
- **Rejection**: Gray gradient (`#6b7280` to `#4b5563`)
- **Follow-up**: Orange gradient (`#f59e0b` to `#d97706`)

### Adding Your Logo
To add a company logo, insert this HTML in the header section:
```html
<img src="YOUR_LOGO_URL" alt="Company Logo" style="max-height: 40px; margin-bottom: 10px;">
```

### Mobile Responsiveness
All templates are designed to be mobile-friendly with:
- Max width of 600px
- Responsive padding and margins
- Readable font sizes

## ⚠️ Important Notes

1. **Use Safe HTML**: Only use the templates provided here, not the full HTML documents from the codebase
2. **Test Before Using**: Always preview your templates before setting them as default
3. **Template Variables**: Make sure to use the correct variable syntax `{{variableName}}`
4. **Email Client Compatibility**: The templates use inline styles for maximum email client compatibility

## 🚀 Getting Started

1. Copy any template from above
2. Go to Email Templates → New Template
3. Paste the HTML content
4. Set the appropriate category and subject
5. Enable "Active Template" and optionally "Default Template"
6. Save and start using!

Happy emailing! 📧✨