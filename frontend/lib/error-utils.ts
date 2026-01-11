/** Error handling utilities for API responses. */

/**
 * Extract a user-friendly error message from an API error response.
 * Handles FastAPI validation errors and other error formats.
 */
export function extractErrorMessage(error: any, fallback: string = 'An error occurred'): string {
  if (!error) return fallback;

  // Handle axios error response
  const response = error.response || error;
  const data = response?.data || response;

  // If detail is a string, use it directly
  if (typeof data?.detail === 'string') {
    return data.detail;
  }

  // If detail is an array (validation errors), format them
  if (Array.isArray(data?.detail)) {
    const messages = data.detail
      .map((err: any) => {
        if (typeof err === 'string') return err;
        if (err.msg) return err.msg;
        if (err.message) return err.message;
        return JSON.stringify(err);
      })
      .filter(Boolean);
    
    if (messages.length > 0) {
      return messages.join('. ');
    }
  }

  // If detail is an object, try to extract message
  if (data?.detail && typeof data.detail === 'object') {
    if (data.detail.msg) return data.detail.msg;
    if (data.detail.message) return data.detail.message;
  }

  // Try error message
  if (data?.message) return data.message;
  if (error.message) return error.message;

  // Fallback
  return fallback;
}

