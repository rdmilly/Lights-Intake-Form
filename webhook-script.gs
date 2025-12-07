/**
 * PNWLights Quote Form Webhook Handler
 * 
 * This Google Apps Script receives form submissions, saves to Google Sheets,
 * and sends email notifications.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a new Google Sheet called "PNWLights Quote Submissions"
 * 2. Create headers in Row 1: Timestamp, First Name, Last Name, Email, Phone, 
 *    Company, Property Type, Experience, Areas, Colors, Custom Color, 
 *    Street Address, Unit, City, State, ZIP, Notes, Marketing Opt-in
 * 3. Go to Extensions > Apps Script
 * 4. Paste this entire script
 * 5. Update the EMAIL_TO variable with your email
 * 6. Click Deploy > New deployment
 * 7. Select Type: Web app
 * 8. Execute as: Me
 * 9. Who has access: Anyone
 * 10. Copy the Web App URL - that's your webhook!
 */

// ============================================
// CONFIGURATION - UPDATE THESE VALUES
// ============================================

const EMAIL_TO = 'your-email@pnwlights.com'; // Your notification email
const EMAIL_CC = ''; // Optional: CC email (leave blank if not needed)
const SHEET_NAME = 'Submissions'; // Name of the sheet tab

// ============================================
// MAIN WEBHOOK HANDLER
// ============================================

function doPost(e) {
  try {
    // Parse the incoming JSON data
    let data;
    
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      data = e.parameter;
    } else {
      throw new Error('No data received');
    }
    
    // Save to Google Sheets
    saveToSheet(data);
    
    // Send email notification
    sendEmailNotification(data);
    
    // Return success response with CORS headers
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Form submitted successfully'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Log error for debugging
    console.error('Error processing form submission:', error);
    
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle GET requests (for testing)
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'PNWLights Webhook is active',
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// GOOGLE SHEETS FUNCTIONS
// ============================================

function saveToSheet(data) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  
  // Create sheet if it doesn't exist
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    // Add headers
    sheet.appendRow([
      'Timestamp',
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Company',
      'Property Type',
      'Experience',
      'Areas to Light',
      'Color Preference',
      'Custom Color',
      'Street Address',
      'Unit/Apt',
      'City',
      'State',
      'ZIP Code',
      'Additional Notes',
      'Marketing Opt-in'
    ]);
    // Format header row
    sheet.getRange(1, 1, 1, 18).setFontWeight('bold').setBackground('#FFD700');
  }
  
  // Prepare row data
  const timestamp = new Date().toLocaleString('en-US', {
    timeZone: 'America/Los_Angeles',
    dateStyle: 'short',
    timeStyle: 'short'
  });
  
  const rowData = [
    timestamp,
    data.firstName || '',
    data.lastName || '',
    data.email || '',
    data.phone || '',
    data.companyName || '',
    formatPropertyType(data.propertyType),
    formatExperience(data.experience),
    formatAreas(data.areas),
    formatColors(data.colors),
    data.customColor || '',
    data.streetAddress || '',
    data.unitNumber || '',
    data.city || '',
    data.state || 'Oregon',
    data.zipCode || '',
    data.additionalNotes || '',
    data.marketingOptIn ? 'Yes' : 'No'
  ];
  
  // Append row
  sheet.appendRow(rowData);
  
  // Auto-resize columns for readability
  try {
    sheet.autoResizeColumns(1, 18);
  } catch (e) {
    // Ignore resize errors
  }
  
  return true;
}

// ============================================
// EMAIL NOTIFICATION FUNCTIONS
// ============================================

function sendEmailNotification(data) {
  const subject = `🎄 New Quote Request: ${data.firstName} ${data.lastName}`;
  
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #0a0a1a 0%, #0d1525 100%); padding: 30px; border-radius: 12px 12px 0 0;">
        <h1 style="color: #FFD700; margin: 0; font-size: 24px;">🎄 New Quote Request!</h1>
        <p style="color: #ffffff; margin: 10px 0 0 0;">Someone wants holiday magic!</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 25px; border: 1px solid #e9ecef;">
        <h2 style="color: #0a0a1a; font-size: 18px; margin-top: 0; border-bottom: 2px solid #FFD700; padding-bottom: 10px;">
          Contact Information
        </h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666; width: 140px;"><strong>Name:</strong></td>
            <td style="padding: 8px 0; color: #333;">${data.firstName} ${data.lastName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;"><strong>Email:</strong></td>
            <td style="padding: 8px 0; color: #333;"><a href="mailto:${data.email}">${data.email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;"><strong>Phone:</strong></td>
            <td style="padding: 8px 0; color: #333;"><a href="tel:${data.phone}">${data.phone}</a></td>
          </tr>
          ${data.companyName ? `
          <tr>
            <td style="padding: 8px 0; color: #666;"><strong>Company:</strong></td>
            <td style="padding: 8px 0; color: #333;">${data.companyName}</td>
          </tr>
          ` : ''}
        </table>
        
        <h2 style="color: #0a0a1a; font-size: 18px; margin-top: 25px; border-bottom: 2px solid #FFD700; padding-bottom: 10px;">
          Property Details
        </h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666; width: 140px;"><strong>Address:</strong></td>
            <td style="padding: 8px 0; color: #333;">
              ${data.streetAddress}${data.unitNumber ? ', ' + data.unitNumber : ''}<br>
              ${data.city}, ${data.state || 'Oregon'} ${data.zipCode}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;"><strong>Property Type:</strong></td>
            <td style="padding: 8px 0; color: #333;">${formatPropertyType(data.propertyType)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;"><strong>Experience:</strong></td>
            <td style="padding: 8px 0; color: #333;">${formatExperience(data.experience)}</td>
          </tr>
        </table>
        
        <h2 style="color: #0a0a1a; font-size: 18px; margin-top: 25px; border-bottom: 2px solid #FFD700; padding-bottom: 10px;">
          Project Preferences
        </h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666; width: 140px;"><strong>Areas to Light:</strong></td>
            <td style="padding: 8px 0; color: #333;">${formatAreas(data.areas) || 'Not specified'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;"><strong>Color Choice:</strong></td>
            <td style="padding: 8px 0; color: #333;">
              ${formatColors(data.colors)}
              ${data.customColor ? '<br><em>Custom: ' + data.customColor + '</em>' : ''}
            </td>
          </tr>
          ${data.additionalNotes ? `
          <tr>
            <td style="padding: 8px 0; color: #666; vertical-align: top;"><strong>Notes:</strong></td>
            <td style="padding: 8px 0; color: #333;">${data.additionalNotes}</td>
          </tr>
          ` : ''}
        </table>
        
        <div style="margin-top: 25px; padding: 15px; background: ${data.marketingOptIn ? '#d4edda' : '#fff3cd'}; border-radius: 8px;">
          <strong>Marketing Opt-in:</strong> ${data.marketingOptIn ? '✅ Yes - Add to email list' : '❌ No'}
        </div>
      </div>
      
      <div style="background: #0a0a1a; padding: 20px; border-radius: 0 0 12px 12px; text-align: center;">
        <a href="https://www.google.com/maps/search/${encodeURIComponent(data.streetAddress + ', ' + data.city + ', Oregon ' + data.zipCode)}" 
           style="display: inline-block; background: #FFD700; color: #0a0a1a; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-right: 10px;">
          📍 View on Map
        </a>
        <a href="tel:${data.phone}" 
           style="display: inline-block; background: #22c55e; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
          📞 Call Now
        </a>
      </div>
      
      <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
        This quote request was submitted via pnwlights.com at ${new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })}
      </p>
    </div>
  `;
  
  const plainBody = `
New Quote Request from PNWLights.com

CONTACT INFORMATION
Name: ${data.firstName} ${data.lastName}
Email: ${data.email}
Phone: ${data.phone}
${data.companyName ? 'Company: ' + data.companyName : ''}

PROPERTY DETAILS
Address: ${data.streetAddress}${data.unitNumber ? ', ' + data.unitNumber : ''}, ${data.city}, ${data.state || 'Oregon'} ${data.zipCode}
Property Type: ${formatPropertyType(data.propertyType)}
Experience: ${formatExperience(data.experience)}

PROJECT PREFERENCES
Areas to Light: ${formatAreas(data.areas) || 'Not specified'}
Color Choice: ${formatColors(data.colors)}${data.customColor ? ' - Custom: ' + data.customColor : ''}
${data.additionalNotes ? 'Additional Notes: ' + data.additionalNotes : ''}

Marketing Opt-in: ${data.marketingOptIn ? 'Yes' : 'No'}

---
Submitted at ${new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })}
  `;
  
  // Send the email
  const mailOptions = {
    to: EMAIL_TO,
    subject: subject,
    body: plainBody,
    htmlBody: htmlBody
  };
  
  if (EMAIL_CC) {
    mailOptions.cc = EMAIL_CC;
  }
  
  MailApp.sendEmail(mailOptions);
  
  return true;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatPropertyType(type) {
  const types = {
    'homeowner': '🏠 Homeowner',
    'business': '🏢 Business'
  };
  return types[type] || type || 'Not specified';
}

function formatExperience(exp) {
  const experiences = {
    'yes': '✨ Has used professional lighting before',
    'no': '🌟 First time customer'
  };
  return experiences[exp] || exp || 'Not specified';
}

function formatAreas(areas) {
  if (!areas || !Array.isArray(areas) || areas.length === 0) {
    return '';
  }
  
  const areaLabels = {
    'roofline': '🏠 Roofline',
    'windows': '🪟 Windows',
    'doors': '🚪 Doors & Entryways',
    'columns': '🏛️ Columns & Pillars',
    'trees': '🌲 Trees & Shrubs',
    'wreaths': '🎄 Wreaths & Decorations',
    'walkways': '🛤️ Walkways & Ground',
    'other': '✨ Other/Custom'
  };
  
  return areas.map(a => areaLabels[a] || a).join(', ');
}

function formatColors(color) {
  const colors = {
    'white': '⚪ Classic White',
    'multicolor': '🌈 Multi-Color',
    'red': '🔴 Red',
    'custom': '🎨 Custom Colors',
    'unsure': '❓ Needs Help Deciding'
  };
  return colors[color] || color || 'Not specified';
}

// ============================================
// JOBBER DATA FORMAT (for Zapier integration)
// ============================================

/**
 * This function formats data for Jobber integration via Zapier
 * The Google Sheet columns are already formatted for easy Zapier mapping:
 * 
 * Zapier Setup:
 * 1. Trigger: Google Sheets > New Spreadsheet Row
 * 2. Action 1: Jobber > Find or Create Client
 *    - First Name: Column B
 *    - Last Name: Column C
 *    - Email: Column D
 *    - Phone: Column E
 *    - Company: Column F
 *    - Street: Column L
 *    - City: Column N
 *    - State: Column O
 *    - ZIP: Column P
 * 
 * 3. Action 2: Jobber > Create Request
 *    - Client: Use ID from step 2
 *    - Title: "Holiday Lighting Quote Request"
 *    - Details: Combine columns G, H, I, J, K, Q
 */
