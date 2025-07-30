import { EmailData, UserEmailConfig } from '../email.service';

export function generateScreeningTemplate(recipient: EmailData, userConfig: UserEmailConfig): string {
  const companyName = userConfig.companyName || 'Our Company';
  const position = recipient.jobPosition || 'Software Engineer Intern';
  const senderName = userConfig.senderName || 'The Hiring Team';
  const senderTitle = userConfig.jobTitle || 'Hiring Manager';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Next Steps - Software Engineer Intern Position</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .content {
          background: #f8f9fa;
          padding: 30px;
          border-radius: 0 0 10px 10px;
        }
        .section {
          background: #fff;
          padding: 20px;
          margin: 20px 0;
          border-radius: 8px;
          border-left: 4px solid #4f46e5;
        }
        .question-list {
          background: #f1f5f9;
          padding: 15px;
          border-radius: 6px;
          margin: 10px 0;
        }
        .footer {
          text-align: left;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          color: #666;
        }
        .signature {
          margin-top: 20px;
          font-weight: 500;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🚀 Next Steps - ${position}</h1>
      </div>
      <div class="content">
        <p>Dear ${recipient.firstName},</p>
        
        <p>Thank you for your interest in the <strong>${position} position at ${companyName}</strong>. We're excited to learn more about your background and interest in joining our team.</p>
        
        <p>Before we proceed with the next steps, we'd like to confirm a few important details and ask some initial screening questions:</p>
        
        <div class="section">
          <h3>📅 Duration Commitment (Critical)</h3>
          <p>Our internship is a <strong>full-time, 6-12 month commitment starting August 2025</strong>.</p>
          <div class="question-list">
            <ul>
              <li>Can you confirm your availability for the entire duration of this internship?</li>
              <li>Are there any academic, personal, or other commitments that might conflict with this timeline?</li>
              <li>Are you able to work on-site at our office in Singapore during the internship period?</li>
            </ul>
          </div>
        </div>
        
        <div class="section">
          <h3>💻 Technical Background</h3>
          <p>Please rate your experience level (1-5, where 5 is expert) with the following technologies:</p>
          <div class="question-list">
            <ul>
              <li>TypeScript/JavaScript</li>
              <li>Node.js/Express.js</li>
              <li>React (or similar frontend frameworks)</li>
              <li>Databases (PostgreSQL, SQL)</li>
              <li>Full-stack development</li>
            </ul>
          </div>
          <p>Can you share a brief description of your most significant software development project? Please include:</p>
          <div class="question-list">
            <ul>
              <li>Technologies used</li>
              <li>Your role and contributions</li>
              <li>Link to GitHub repository or portfolio (if available)</li>
            </ul>
          </div>
        </div>
        
        <div class="section">
          <h3>🤝 Work Style & Availability</h3>
          <div class="question-list">
            <ul>
              <li>Describe a time when you worked effectively in a team environment. What was your role and contribution?</li>
              <li>Are you comfortable with a collaborative, fast-paced startup environment where you might need to adapt quickly to new technologies and requirements?</li>
            </ul>
          </div>
        </div>
        
        <div class="footer">
          <div class="signature">
            Best regards,<br>
            ${senderName}<br>
            ${senderTitle}<br>
            ${companyName}
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}
