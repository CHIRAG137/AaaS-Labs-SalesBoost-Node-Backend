const { google } = require('googleapis');
const { JWT } = require('google-auth-library');

exports.fillDocWithUserConfig = async (data, templateId) => {
  const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);

  const auth = new JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/documents', 'https://www.googleapis.com/auth/drive']
  });

  const drive = google.drive({ version: 'v3', auth });
  const docs = google.docs({ version: 'v1', auth });

  // Copy the template
  const copy = await drive.files.copy({
    fileId: templateId,
    requestBody: {
      name: `Invoice - ${data.name}`
    }
  });

  const docId = copy.data.id;

  // Replace placeholders
  const requests = Object.keys(data).map(key => ({
    replaceAllText: {
      containsText: {
        text: `{{${key}}}`,
        matchCase: true
      },
      replaceText: data[key]
    }
  }));

  await docs.documents.batchUpdate({
    documentId: docId,
    requestBody: { requests }
  });

  // Export as PDF
  const pdf = await drive.files.export({
    fileId: docId,
    mimeType: 'application/pdf'
  }, { responseType: 'arraybuffer' });

  return Buffer.from(pdf.data);
};