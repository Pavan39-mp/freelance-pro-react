// storageService.js
// This service simulates a backend API by managing data in localStorage.
// In the future, these methods can be replaced with fetch/axios calls to a real backend.

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const getStorageItem = (key, defaultValue) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage`, error);
    return defaultValue;
  }
};

const setStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing ${key} to localStorage`, error);
  }
};

// --- USER PROFILE ---
export const getUserProfile = async () => {
  // await delay(100); // Simulate network delay if desired
  return getStorageItem('freelancepro_user', {
    photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC6b82bvE-h7vwptu6l9zR1hPNZum9Zp-3ftMYDfp8LM1QfmmxfE0X0Xt5TZqzBqUSbaBZzrgLQbLZhkHHZyKjEIv8SOu3wn3i1gZrZ8R9SWDpV-5p4c2YtZJUqwAo6_ZmO-HWxCTj7TIDwiTwWcUGsPgl4iLWmV35WiUEV8QuwUJwZlqJNaVPi0yk5be-pMBV09dlXmzJfOq0EfM9Y4PRgtE9I16A8P4KMvKix0yR1lXmGxfK58iBTbe8dxKLYLePnpCEAtFpcX3s',
    fullName: 'Alex Rivera',
    email: 'alex@example.com',
    phone: '+1 (555) 123-4567',
    role: 'Senior Lead',
    title: 'Creative Labs',
    skills: 'UI/UX, React, Branding',
    location: 'San Francisco, CA',
    bio: 'Product Designer and Frontend Developer passionate about creating beautiful, functional digital experiences.',
    joinedDate: 'January 2024',
    plan: 'Pro Plan'
  });
};

export const saveUserProfile = async (user) => {
  setStorageItem('freelancepro_user', user);
  return user;
};

// --- CLIENTS ---
export const getClients = async () => {
  return getStorageItem('freelancepro_clients', []);
};

export const saveClients = async (clients) => {
  setStorageItem('freelancepro_clients', clients);
  return clients;
};

// --- PROJECTS ---
export const getProjects = async () => {
  return getStorageItem('freelancepro_projects', []);
};

export const saveProjects = async (projects) => {
  setStorageItem('freelancepro_projects', projects);
  return projects;
};

// --- TASKS ---
export const getTasks = async () => {
  return getStorageItem('freelancepro_tasks', []);
};

export const saveTasks = async (tasks) => {
  setStorageItem('freelancepro_tasks', tasks);
  return tasks;
};

// --- NOTIFICATIONS ---
export const getNotifications = async () => {
  return getStorageItem('freelancepro_notifications', []);
};

export const saveNotifications = async (notifications) => {
  setStorageItem('freelancepro_notifications', notifications);
  return notifications;
};

// --- ACTIVITIES ---
export const getActivities = async () => {
  return getStorageItem('freelancepro_activities', []);
};

export const saveActivities = async (activities) => {
  setStorageItem('freelancepro_activities', activities);
  return activities;
};

// --- MEETINGS ---
export const getMeetings = async () => {
  return getStorageItem('freelancepro_meetings', []);
};

export const saveMeetings = async (meetings) => {
  setStorageItem('freelancepro_meetings', meetings);
  return meetings;
};

// --- NOTES ---
export const getNotes = async () => {
  return getStorageItem('freelancepro_notes', []);
};

export const saveNotes = async (notes) => {
  setStorageItem('freelancepro_notes', notes);
  return notes;
};

// --- INVOICES ---
export const getInvoices = async () => {
  return getStorageItem('freelancepro_invoices', []);
};

export const saveInvoices = async (invoices) => {
  setStorageItem('freelancepro_invoices', invoices);
  return invoices;
};
