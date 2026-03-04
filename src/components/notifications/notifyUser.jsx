import { base44 } from "@/api/base44Client";

/**
 * Create an in-app notification for a user.
 * @param {Object} opts
 * @param {string} opts.user_email
 * @param {string} opts.title
 * @param {string} opts.message
 * @param {"info"|"warning"|"error"|"success"} [opts.type]
 * @param {"network"|"billing"|"ticket"|"customer"|"system"} [opts.category]
 * @param {string} [opts.link_page]
 */
export async function notifyUser({ user_email, title, message, type = "info", category = "system", link_page }) {
  try {
    // Check if user has this category enabled
    const users = await base44.entities.User.filter({ email: user_email });
    const user = users[0];
    const prefs = user?.notification_preferences || {};
    const prefKey = `inapp_${category}`;
    // Default to true if pref not set
    if (prefs[prefKey] === false) return;

    await base44.entities.Notification.create({
      user_email,
      title,
      message,
      type,
      category,
      is_read: false,
      link_page: link_page || null,
    });
  } catch (e) {
    console.error("Failed to create notification:", e);
  }
}

/**
 * Broadcast a notification to all admin users.
 */
export async function notifyAdmins({ title, message, type = "info", category = "system", link_page }) {
  try {
    const users = await base44.entities.User.list();
    const admins = users.filter(u => u.role === "admin");
    await Promise.all(admins.map(u => notifyUser({ user_email: u.email, title, message, type, category, link_page })));
  } catch (e) {
    console.error("Failed to notify admins:", e);
  }
}