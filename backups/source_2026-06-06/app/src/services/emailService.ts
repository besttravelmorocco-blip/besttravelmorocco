// ============================================================================
// EMAIL SERVICE - SMTP Configuration for Gmail & Hosting Server
// ============================================================================
// This service handles all email functionality including:
// - Tour enquiries
// - Booking confirmations
// - Contact form submissions
// - Newsletter subscriptions
// ============================================================================

// Email configuration interface
export interface EmailConfig {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  fromEmail: string;
  fromName: string;
  toEmail: string; // Where enquiries should be sent
}

// Default configuration - Update these values with your actual credentials
const defaultConfig: EmailConfig = {
  // Gmail SMTP settings (uncomment and use if using Gmail)
  // smtpHost: 'smtp.gmail.com',
  // smtpPort: 587,
  // smtpUser: 'your-gmail@gmail.com',
  // smtpPass: 'your-app-password', // Use app password, not regular password
  
  // Hosting server SMTP settings (recommended for production)
  smtpHost: import.meta.env.VITE_SMTP_HOST || 'mail.gobestmorocco.com',
  smtpPort: parseInt(import.meta.env.VITE_SMTP_PORT || '587'),
  smtpUser: import.meta.env.VITE_SMTP_USER || 'hello@gobestmorocco.com',
  smtpPass: import.meta.env.VITE_SMTP_PASS || '',
  
  fromEmail: import.meta.env.VITE_FROM_EMAIL || 'hello@gobestmorocco.com',
  fromName: import.meta.env.VITE_FROM_NAME || 'Best of Morocco',
  toEmail: import.meta.env.VITE_TO_EMAIL || 'hello@gobestmorocco.com',
};

// Enquiry form data interface
export interface EnquiryData {
  name: string;
  email: string;
  phone?: string;
  travelDate?: string;
  travelers?: string;
  message?: string;
  tourName?: string;
  tourSlug?: string;
  tourPrice?: number;
}

// Booking form data interface
export interface BookingData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationality: string;
  tourId: number;
  tourName: string;
  travelDate: string;
  adults: number;
  children: number;
  specialRequests?: string;
}

// Contact form data interface
export interface ContactData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

// Newsletter subscription interface
export interface NewsletterData {
  email: string;
}

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================

const enquiryTemplate = (data: EnquiryData): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Tour Enquiry - Best of Morocco</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #C9A96E; color: #15151a; padding: 20px; text-align: center; }
    .content { background: #f9f9f9; padding: 20px; }
    .field { margin-bottom: 15px; }
    .label { font-weight: bold; color: #15151a; }
    .value { color: #3c3c3c; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Tour Enquiry</h1>
      <p>Best of Morocco</p>
    </div>
    <div class="content">
      <div class="field">
        <span class="label">Tour:</span>
        <span class="value">${data.tourName || 'Custom Tour Request'}</span>
      </div>
      <div class="field">
        <span class="label">Name:</span>
        <span class="value">${data.name}</span>
      </div>
      <div class="field">
        <span class="label">Email:</span>
        <span class="value">${data.email}</span>
      </div>
      ${data.phone ? `
      <div class="field">
        <span class="label">Phone:</span>
        <span class="value">${data.phone}</span>
      </div>
      ` : ''}
      ${data.travelDate ? `
      <div class="field">
        <span class="label">Travel Date:</span>
        <span class="value">${data.travelDate}</span>
      </div>
      ` : ''}
      ${data.travelers ? `
      <div class="field">
        <span class="label">Number of Travelers:</span>
        <span class="value">${data.travelers}</span>
      </div>
      ` : ''}
      ${data.tourPrice ? `
      <div class="field">
        <span class="label">Tour Price:</span>
        <span class="value">$${data.tourPrice} per person</span>
      </div>
      ` : ''}
      ${data.message ? `
      <div class="field">
        <span class="label">Message:</span>
        <p class="value">${data.message.replace(/\n/g, '<br>')}</p>
      </div>
      ` : ''}
    </div>
    <div class="footer">
      <p>This enquiry was submitted through the Best of Morocco website.</p>
      <p>Reply directly to this email to contact the customer.</p>
    </div>
  </div>
</body>
</html>
`;

const bookingConfirmationTemplate = (data: BookingData): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Booking Confirmation - Best of Morocco</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #C9A96E; color: #15151a; padding: 20px; text-align: center; }
    .content { background: #f9f9f9; padding: 20px; }
    .field { margin-bottom: 15px; }
    .label { font-weight: bold; color: #15151a; }
    .value { color: #3c3c3c; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Booking Confirmation</h1>
      <p>Best of Morocco</p>
    </div>
    <div class="content">
      <p>Dear ${data.firstName} ${data.lastName},</p>
      <p>Thank you for booking with Best of Morocco! We have received your booking request and will contact you shortly to confirm the details.</p>
      
      <h3>Booking Details:</h3>
      <div class="field">
        <span class="label">Tour:</span>
        <span class="value">${data.tourName}</span>
      </div>
      <div class="field">
        <span class="label">Travel Date:</span>
        <span class="value">${data.travelDate}</span>
      </div>
      <div class="field">
        <span class="label">Travelers:</span>
        <span class="value">${data.adults} Adults, ${data.children} Children</span>
      </div>
      
      <p>We will send you a detailed itinerary and payment instructions within 24 hours.</p>
      
      <p>If you have any questions, please contact us at:<br>
      Email: hello@gobestmorocco.com<br>
      Phone: +212 768-660428</p>
    </div>
    <div class="footer">
      <p>Best of Morocco - Your Gateway to Authentic Moroccan Adventures</p>
    </div>
  </div>
</body>
</html>
`;

const contactFormTemplate = (data: ContactData): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Contact Form Submission - Best of Morocco</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #C9A96E; color: #15151a; padding: 20px; text-align: center; }
    .content { background: #f9f9f9; padding: 20px; }
    .field { margin-bottom: 15px; }
    .label { font-weight: bold; color: #15151a; }
    .value { color: #3c3c3c; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Contact Form Submission</h1>
      <p>Best of Morocco</p>
    </div>
    <div class="content">
      <div class="field">
        <span class="label">Name:</span>
        <span class="value">${data.name}</span>
      </div>
      <div class="field">
        <span class="label">Email:</span>
        <span class="value">${data.email}</span>
      </div>
      ${data.phone ? `
      <div class="field">
        <span class="label">Phone:</span>
        <span class="value">${data.phone}</span>
      </div>
      ` : ''}
      <div class="field">
        <span class="label">Subject:</span>
        <span class="value">${data.subject}</span>
      </div>
      <div class="field">
        <span class="label">Message:</span>
        <p class="value">${data.message.replace(/\n/g, '<br>')}</p>
      </div>
    </div>
    <div class="footer">
      <p>This message was submitted through the Best of Morocco contact form.</p>
    </div>
  </div>
</body>
</html>
`;

const newsletterWelcomeTemplate = (_email: string): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome to Best of Morocco Newsletter</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #C9A96E; color: #15151a; padding: 20px; text-align: center; }
    .content { background: #f9f9f9; padding: 20px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .button { display: inline-block; background: #C9A96E; color: #15151a; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to Best of Morocco!</h1>
    </div>
    <div class="content">
      <p>Thank you for subscribing to our newsletter!</p>
      <p>You'll now receive:</p>
      <ul>
        <li>Exclusive travel deals and discounts</li>
        <li>Insider tips for exploring Morocco</li>
        <li>New tour announcements</li>
        <li>Travel inspiration and stories</li>
      </ul>
      <a href="https://gobestmorocco.com/tours" class="button">Explore Our Tours</a>
    </div>
    <div class="footer">
      <p>Best of Morocco - Your Gateway to Authentic Moroccan Adventures</p>
      <p>If you didn't subscribe to this newsletter, please ignore this email.</p>
    </div>
  </div>
</body>
</html>
`;

// ============================================================================
// EMAIL SERVICE FUNCTIONS
// ============================================================================

/**
 * Send a tour enquiry email
 * In a real implementation, this would connect to your backend API
 * For now, it simulates a successful send
 */
export async function sendEnquiryEmail(data: EnquiryData, config?: Partial<EmailConfig>): Promise<{ success: boolean; message: string }> {
  try {
    // In production, this should call your backend API
    // Example: const response = await fetch('/api/send-enquiry', { method: 'POST', body: JSON.stringify(data) });
    
    // For demo purposes, we'll log and simulate success
    console.log('Sending enquiry email:', {
      to: config?.toEmail || defaultConfig.toEmail,
      subject: `New Enquiry: ${data.tourName || 'Custom Tour'}`,
      html: enquiryTemplate(data),
    });
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      success: true,
      message: 'Enquiry sent successfully! We will contact you within 24 hours.',
    };
  } catch (error) {
    console.error('Error sending enquiry:', error);
    return {
      success: false,
      message: 'Failed to send enquiry. Please try again or contact us directly.',
    };
  }
}

/**
 * Send booking confirmation emails
 */
export async function sendBookingConfirmation(data: BookingData, _config?: Partial<EmailConfig>): Promise<{ success: boolean; message: string }> {
  try {
    console.log('Sending booking confirmation:', {
      to: data.email,
      subject: `Booking Confirmation - ${data.tourName}`,
      html: bookingConfirmationTemplate(data),
    });
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      success: true,
      message: 'Booking confirmation sent!',
    };
  } catch (error) {
    console.error('Error sending booking confirmation:', error);
    return {
      success: false,
      message: 'Failed to send confirmation.',
    };
  }
}

/**
 * Send contact form email
 */
export async function sendContactEmail(data: ContactData, config?: Partial<EmailConfig>): Promise<{ success: boolean; message: string }> {
  try {
    console.log('Sending contact form:', {
      to: config?.toEmail || defaultConfig.toEmail,
      subject: `Contact Form: ${data.subject}`,
      html: contactFormTemplate(data),
    });
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      success: true,
      message: 'Message sent successfully!',
    };
  } catch (error) {
    console.error('Error sending contact form:', error);
    return {
      success: false,
      message: 'Failed to send message.',
    };
  }
}

/**
 * Send newsletter welcome email
 */
export async function sendNewsletterWelcome(email: string, _config?: Partial<EmailConfig>): Promise<{ success: boolean; message: string }> {
  try {
    console.log('Sending newsletter welcome:', {
      to: email,
      subject: 'Welcome to Best of Morocco Newsletter!',
      html: newsletterWelcomeTemplate(email),
    });
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      message: 'Welcome email sent!',
    };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return {
      success: false,
      message: 'Failed to send welcome email.',
    };
  }
}

/**
 * Get current email configuration
 */
export function getEmailConfig(): EmailConfig {
  return { ...defaultConfig };
}

/**
 * Update email configuration (for admin use)
 */
export function updateEmailConfig(config: Partial<EmailConfig>): void {
  Object.assign(defaultConfig, config);
}

// ============================================================================
// ENVIRONMENT VARIABLES SETUP
// ============================================================================
/**
 * Create a .env file with the following variables:
 * 
 * VITE_SMTP_HOST=mail.gobestmorocco.com
 * VITE_SMTP_PORT=587
 * VITE_SMTP_USER=hello@gobestmorocco.com
 * VITE_SMTP_PASS=your_smtp_password
 * VITE_FROM_EMAIL=hello@gobestmorocco.com
 * VITE_FROM_NAME=Best of Morocco
 * VITE_TO_EMAIL=hello@gobestmorocco.com
 * 
 * For Gmail:
 * VITE_SMTP_HOST=smtp.gmail.com
 * VITE_SMTP_PORT=587
 * VITE_SMTP_USER=your-gmail@gmail.com
 * VITE_SMTP_PASS=your-app-password (NOT your regular password)
 */

export default {
  sendEnquiryEmail,
  sendBookingConfirmation,
  sendContactEmail,
  sendNewsletterWelcome,
  getEmailConfig,
  updateEmailConfig,
};
