/**
 * Kevalon Technology CRM API Configuration
 * Default Production Backend: https://hr-b.onrender.com/api
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://hr-b.onrender.com/api';

export const getApiUrl = (path) => {
  if (!path) return API_BASE_URL;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Normalize path
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  // If path starts with /api, append the relative portion to API_BASE_URL
  if (normalizedPath.startsWith('/api')) {
    const subPath = normalizedPath.substring(4); // Remove '/api'
    return `${API_BASE_URL}${subPath}`;
  }

  return `${API_BASE_URL}${normalizedPath}`;
};
