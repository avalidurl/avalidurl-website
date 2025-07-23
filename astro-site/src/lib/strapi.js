import axios from 'axios';

const STRAPI_URL = import.meta.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = import.meta.env.STRAPI_TOKEN;

const strapiApi = axios.create({
  baseURL: `${STRAPI_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    ...(STRAPI_TOKEN && { Authorization: `Bearer ${STRAPI_TOKEN}` })
  }
});

// Blog Posts
export const getBlogPosts = async (params = {}) => {
  try {
    const response = await strapiApi.get('/blog-posts', {
      params: {
        populate: ['coverImage', 'author'],
        sort: 'publishedAt:desc',
        ...params
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return { data: [], meta: {} };
  }
};

export const getBlogPost = async (slug) => {
  try {
    const response = await strapiApi.get('/blog-posts', {
      params: {
        filters: { slug: { $eq: slug } },
        populate: ['coverImage', 'author', 'tags']
      }
    });
    return response.data?.data?.[0] || null;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
};

// Art Projects
export const getArtProjects = async (params = {}) => {
  try {
    const response = await strapiApi.get('/art-projects', {
      params: {
        populate: ['images', 'thumbnail'],
        sort: 'createdAt:desc',
        ...params
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching art projects:', error);
    return { data: [], meta: {} };
  }
};

export const getArtProject = async (slug) => {
  try {
    const response = await strapiApi.get('/art-projects', {
      params: {
        filters: { slug: { $eq: slug } },
        populate: ['images', 'thumbnail']
      }
    });
    return response.data?.data?.[0] || null;
  } catch (error) {
    console.error('Error fetching art project:', error);
    return null;
  }
};

// Pages
export const getPage = async (slug) => {
  try {
    const response = await strapiApi.get('/pages', {
      params: {
        filters: { slug: { $eq: slug } },
        populate: '*'
      }
    });
    return response.data?.data?.[0] || null;
  } catch (error) {
    console.error('Error fetching page:', error);
    return null;
  }
};

// Global Settings
export const getGlobalSettings = async () => {
  try {
    const response = await strapiApi.get('/global', {
      params: {
        populate: '*'
      }
    });
    return response.data?.data || {};
  } catch (error) {
    console.error('Error fetching global settings:', error);
    return {};
  }
};

// Helper function to get media URL
export const getStrapiMedia = (media) => {
  if (!media) return null;
  
  const { url } = media.data?.attributes || media.attributes || media;
  
  if (!url) return null;
  
  // If URL is already absolute, return as is
  if (url.startsWith('http')) return url;
  
  // Otherwise, prepend Strapi URL
  return `${STRAPI_URL}${url}`;
};

// Helper function to format date
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};