import axios from 'axios';
import FormData from 'form-data';

const baseUrl = process.env.PRONTO_API_BASE_URL || 'https://api.getpronto.io/v1';

/**
 * Upload file to Pronto using REST API
 * @param {Buffer} buffer - file buffer
 * @param {string} filename - original file name
 * @param {string} mimeType - MIME type
 * @returns {Promise<object>} upload result JSON
 */
export async function uploadFile(buffer, filename, mimeType) {
  // API key will be read at runtime inside uploadFile
  const apiKey = process.env.PRONTO_API_KEY;
  const form = new FormData();
  form.append('file', buffer, { filename, contentType: mimeType });

  const headers = {
    ...form.getHeaders(),
    Authorization: `ApiKey ${apiKey}`,
  };

  const response = await axios.post(`${baseUrl}/upload`, form, { headers });
  return response.data;
}
