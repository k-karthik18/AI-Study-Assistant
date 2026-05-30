import axios from 'axios';

// Get backend API URL from env variables (Vite uses VITE_ prefix) or default to local FastAPI dev server
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  /**
   * Upload a PDF file to the backend under this specific user's namespace
   * @param {File} file The PDF file object
   * @param {string} userId Clerk User ID
   * @param {Function} onUploadProgress Optional callback for tracking progress percentage
   */
  uploadPDF: async (file, userId, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-User-ID': userId,
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(percentCompleted);
        }
      },
    });
    return response.data;
  },

  /**
   * Ask the chatbot a question grounded in the specified PDF context under this user's namespace
   * @param {string} question User prompt
   * @param {string} docId Generated document GUID
   * @param {string} userId Clerk User ID
   */
  askQuestion: async (question, docId, userId) => {
    const response = await api.post('/ask', {
      question,
      doc_id: docId,
    }, {
      headers: {
        'X-User-ID': userId,
      }
    });
    return response.data;
  },

  /**
   * Retrieve all uploaded textbooks metadata for a given user from Supabase
   * @param {string} userId Clerk User ID
   */
  getDocuments: async (userId) => {
    const response = await api.get('/documents', {
      headers: {
        'X-User-ID': userId,
      }
    });
    return response.data;
  },

  /**
   * Retrieve persistent message history for a given textbook and user from Supabase
   * @param {string} docId Unique document ID
   * @param {string} userId Clerk User ID
   */
  getHistory: async (docId, userId) => {
    const response = await api.get(`/history/${docId}`, {
      headers: {
        'X-User-ID': userId,
      }
    });
    return response.data;
  },

  /**
   * Run RAGAS pipeline evaluation on the uploaded PDF
   * @param {string} docId Generated document GUID
   * @param {Array} dataset List of {question, ground_truth} benchmark targets
   * @param {string} userId Clerk User ID
   */
  evaluateRAG: async (docId, dataset, userId) => {
    const response = await api.post('/evaluate', {
      doc_id: docId,
      dataset,
    }, {
      headers: {
        'X-User-ID': userId,
      }
    });
    return response.data;
  },
};

export default apiService;
