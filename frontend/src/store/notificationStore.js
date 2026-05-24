/**
 * src/store/notificationStore.js
 * Reactive client-side notifications manager for the placement system.
 */
import { create } from "zustand";

const useNotificationStore = create((set, get) => ({
  notifications: [
    {
      id: "notif-1",
      title: "Dual Placement Conflict",
      message: "You have multiple active offers. Please select your final job under 'My Offers'.",
      type: "warning",
      read: false,
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
      link: "/student/offers"
    },
    {
      id: "notif-2",
      title: "New Dream Drive Active",
      message: "Google is hiring for Software Engineer (22.0 LPA). You are eligible to apply as a dream company!",
      type: "info",
      read: false,
      timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
      link: "/student/dream"
    },
    {
      id: "notif-3",
      title: "Job Selection Registered",
      message: "Deloitte registered a selection offer for your application.",
      type: "success",
      read: true,
      timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
      link: "/student/offers"
    }
  ],

  // Add a new notification
  addNotification: (notification) => {
    const newNotif = {
      id: `notif-${Date.now()}`,
      read: false,
      timestamp: new Date().toISOString(),
      ...notification
    };
    set((state) => ({
      notifications: [newNotif, ...state.notifications]
    }));
  },

  // Mark all as read
  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true }))
    }));
  },

  // Mark single as read
  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) => 
        n.id === id ? { ...n, read: true } : n
      )
    }));
  },

  // Delete notification
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id)
    }));
  },

  // Clear all
  clearAll: () => {
    set({ notifications: [] });
  }
}));

export default useNotificationStore;
