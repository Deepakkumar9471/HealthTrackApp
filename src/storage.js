/**
 * Storage adapter for the database
 */
const { db } = require('./db');
const { v4: uuidv4 } = require('uuid');
const { eq, and, desc } = require('drizzle-orm');

// Import the necessary schema tables
let schema;
try {
  schema = require('../shared/schema');
} catch (error) {
  console.error('Error importing schema:', error);
  // Define placeholder if TypeScript schema is not available
  schema = {
    users: { id: 'id', userId: 'user_id' },
    activities: { id: 'id', userId: 'user_id' },
    goals: { id: 'id', userId: 'user_id' },
    notifications: { id: 'id', userId: 'user_id' },
    healthMetrics: { id: 'id', userId: 'user_id', date: 'date' }
  };
}

/**
 * Database Storage Adapter
 */
class DatabaseStorage {
  constructor() {
    this.db = db;
  }

  /**
   * Initialize the storage with seed data if needed
   */
  async initialize() {
    // Check if there's already a default user
    const defaultUser = await this.getUserById('default');
    
    if (!defaultUser) {
      // Create default user
      await this.createUser({
        id: 'default',
        name: 'Demo User',
        email: 'demo@example.com'
      });
      
      // Create sample data for the default user
      await this.createSampleData('default');
    }
  }
  
  /**
   * Create sample data for a user
   * @param {string} userId - User ID
   */
  async createSampleData(userId) {
    // Create sample activities
    const activities = [
      {
        id: uuidv4(),
        userId,
        type: 'Running',
        duration: 30,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Morning jog in the park'
      },
      {
        id: uuidv4(),
        userId,
        type: 'Cycling',
        duration: 45,
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Bike ride to work'
      },
      {
        id: uuidv4(),
        userId,
        type: 'Yoga',
        duration: 60,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Evening yoga session'
      }
    ];
    
    for (const activity of activities) {
      await this.createActivity(activity);
    }
    
    // Create sample goals
    const goals = [
      {
        id: uuidv4(),
        userId,
        name: 'Daily Steps',
        target: 10000,
        current: 7500,
        unit: 'steps',
        category: 'fitness',
        deadline: null
      },
      {
        id: uuidv4(),
        userId,
        name: 'Weekly Exercise',
        target: 150,
        current: 135,
        unit: 'minutes',
        category: 'fitness',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      {
        id: uuidv4(),
        userId,
        name: 'Improve Resting Heart Rate',
        target: 65,
        current: 68,
        unit: 'BPM',
        category: 'health',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    ];
    
    for (const goal of goals) {
      await this.createGoal(goal);
    }
    
    // Create sample notifications
    const notifications = [
      {
        id: uuidv4(),
        userId,
        type: 'achievement',
        title: 'Step Goal Progress',
        message: "You've reached 75% of your daily step goal!",
        read: false,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: uuidv4(),
        userId,
        type: 'reminder',
        title: 'Time to Move',
        message: "You've been inactive for an hour. Time to stand up and stretch!",
        read: true,
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000)
      }
    ];
    
    for (const notification of notifications) {
      await this.createNotification(notification);
    }
    
    // Create sample health metrics
    const today = new Date().toISOString().split('T')[0];
    await this.createOrUpdateHealthMetrics({
      userId,
      date: today,
      steps: 8638,
      heartRate: 72,
      calories: 2123,
      activeMinutes: 46,
      distance: '0.6'
    });
    
    // Create past week health metrics
    const pastDays = 7;
    for (let i = 1; i <= pastDays; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Generate somewhat random but reasonable health metrics
      const steps = Math.floor(5000 + Math.random() * 7000);
      const heartRate = Math.floor(60 + Math.random() * 20);
      const calories = Math.floor(1500 + Math.random() * 1000);
      const activeMinutes = Math.floor(30 + Math.random() * 60);
      const distance = (steps / 1500).toFixed(1);
      
      await this.createOrUpdateHealthMetrics({
        userId,
        date: dateStr,
        steps,
        heartRate,
        calories,
        activeMinutes,
        distance
      });
    }
  }

  /**
   * Get a user by ID
   * @param {string} id - User ID
   * @returns {Promise<object|null>} User object or null if not found
   */
  async getUserById(id) {
    try {
      const [user] = await this.db.select().from(schema.users).where(eq(schema.users.id, id));
      return user;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }

  /**
   * Create a new user
   * @param {object} userData - User data
   * @returns {Promise<object>} Created user
   */
  async createUser(userData) {
    try {
      const [user] = await this.db.insert(schema.users).values(userData).returning();
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Get activities for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of activities
   */
  async getActivities(userId) {
    try {
      return await this.db
        .select()
        .from(schema.activities)
        .where(eq(schema.activities.userId, userId))
        .orderBy(desc(schema.activities.date));
    } catch (error) {
      console.error('Error getting activities:', error);
      return [];
    }
  }

  /**
   * Get an activity by ID
   * @param {string} id - Activity ID
   * @returns {Promise<object|null>} Activity object or null if not found
   */
  async getActivityById(id) {
    try {
      const [activity] = await this.db
        .select()
        .from(schema.activities)
        .where(eq(schema.activities.id, id));
      return activity || null;
    } catch (error) {
      console.error('Error getting activity by ID:', error);
      return null;
    }
  }

  /**
   * Create a new activity
   * @param {object} activityData - Activity data
   * @returns {Promise<object>} Created activity
   */
  async createActivity(activityData) {
    try {
      const [activity] = await this.db
        .insert(schema.activities)
        .values(activityData)
        .returning();
      return activity;
    } catch (error) {
      console.error('Error creating activity:', error);
      throw error;
    }
  }

  /**
   * Update an activity
   * @param {string} id - Activity ID
   * @param {object} activityData - Updated activity data
   * @returns {Promise<object|null>} Updated activity or null if not found
   */
  async updateActivity(id, activityData) {
    try {
      const [activity] = await this.db
        .update(schema.activities)
        .set({ ...activityData, updatedAt: new Date() })
        .where(eq(schema.activities.id, id))
        .returning();
      return activity || null;
    } catch (error) {
      console.error('Error updating activity:', error);
      return null;
    }
  }

  /**
   * Delete an activity
   * @param {string} id - Activity ID
   * @returns {Promise<boolean>} True if deleted, false otherwise
   */
  async deleteActivity(id) {
    try {
      await this.db
        .delete(schema.activities)
        .where(eq(schema.activities.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting activity:', error);
      return false;
    }
  }

  /**
   * Get goals for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of goals
   */
  async getGoals(userId) {
    try {
      return await this.db
        .select()
        .from(schema.goals)
        .where(eq(schema.goals.userId, userId));
    } catch (error) {
      console.error('Error getting goals:', error);
      return [];
    }
  }

  /**
   * Get a goal by ID
   * @param {string} id - Goal ID
   * @returns {Promise<object|null>} Goal object or null if not found
   */
  async getGoalById(id) {
    try {
      const [goal] = await this.db
        .select()
        .from(schema.goals)
        .where(eq(schema.goals.id, id));
      return goal || null;
    } catch (error) {
      console.error('Error getting goal by ID:', error);
      return null;
    }
  }

  /**
   * Create a new goal
   * @param {object} goalData - Goal data
   * @returns {Promise<object>} Created goal
   */
  async createGoal(goalData) {
    try {
      const [goal] = await this.db
        .insert(schema.goals)
        .values(goalData)
        .returning();
      return goal;
    } catch (error) {
      console.error('Error creating goal:', error);
      throw error;
    }
  }

  /**
   * Update a goal
   * @param {string} id - Goal ID
   * @param {object} goalData - Updated goal data
   * @returns {Promise<object|null>} Updated goal or null if not found
   */
  async updateGoal(id, goalData) {
    try {
      const [goal] = await this.db
        .update(schema.goals)
        .set({ ...goalData, updatedAt: new Date() })
        .where(eq(schema.goals.id, id))
        .returning();
      return goal || null;
    } catch (error) {
      console.error('Error updating goal:', error);
      return null;
    }
  }

  /**
   * Update goal progress
   * @param {string} id - Goal ID
   * @param {number} current - Current progress value
   * @returns {Promise<object|null>} Updated goal or null if not found
   */
  async updateGoalProgress(id, current) {
    try {
      const [goal] = await this.db
        .update(schema.goals)
        .set({ current, updatedAt: new Date() })
        .where(eq(schema.goals.id, id))
        .returning();
      return goal || null;
    } catch (error) {
      console.error('Error updating goal progress:', error);
      return null;
    }
  }

  /**
   * Delete a goal
   * @param {string} id - Goal ID
   * @returns {Promise<boolean>} True if deleted, false otherwise
   */
  async deleteGoal(id) {
    try {
      await this.db
        .delete(schema.goals)
        .where(eq(schema.goals.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting goal:', error);
      return false;
    }
  }

  /**
   * Get notifications for a user
   * @param {string} userId - User ID
   * @param {object} options - Options for filtering notifications
   * @returns {Promise<Array>} Array of notifications
   */
  async getNotifications(userId, options = {}) {
    try {
      let query = this.db
        .select()
        .from(schema.notifications)
        .where(eq(schema.notifications.userId, userId))
        .orderBy(desc(schema.notifications.timestamp));
      
      if (options.unreadOnly) {
        query = query.where(eq(schema.notifications.read, false));
      }
      
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      return await query;
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }

  /**
   * Create a new notification
   * @param {object} notificationData - Notification data
   * @returns {Promise<object>} Created notification
   */
  async createNotification(notificationData) {
    try {
      const dataWithId = {
        id: notificationData.id || uuidv4(),
        ...notificationData
      };
      
      const [notification] = await this.db
        .insert(schema.notifications)
        .values(dataWithId)
        .returning();
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   * @param {string} id - Notification ID
   * @param {string} userId - User ID
   * @returns {Promise<object|null>} Updated notification or null if not found
   */
  async markNotificationAsRead(id, userId) {
    try {
      const [notification] = await this.db
        .update(schema.notifications)
        .set({ read: true })
        .where(
          and(
            eq(schema.notifications.id, id),
            eq(schema.notifications.userId, userId)
          )
        )
        .returning();
      return notification || null;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return null;
    }
  }

  /**
   * Mark all notifications as read for a user
   * @param {string} userId - User ID
   * @returns {Promise<number>} Number of notifications marked as read
   */
  async markAllNotificationsAsRead(userId) {
    try {
      const result = await this.db
        .update(schema.notifications)
        .set({ read: true })
        .where(
          and(
            eq(schema.notifications.userId, userId),
            eq(schema.notifications.read, false)
          )
        );
      return result.count || 0;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return 0;
    }
  }

  /**
   * Delete a notification
   * @param {string} id - Notification ID
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} True if deleted, false otherwise
   */
  async deleteNotification(id, userId) {
    try {
      await this.db
        .delete(schema.notifications)
        .where(
          and(
            eq(schema.notifications.id, id),
            eq(schema.notifications.userId, userId)
          )
        );
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  /**
   * Get daily health metrics for a user
   * @param {string} userId - User ID
   * @param {string} date - Date string (YYYY-MM-DD)
   * @returns {Promise<object|null>} Health metrics for the day or null if not found
   */
  async getDailyHealthMetrics(userId, date = new Date().toISOString().split('T')[0]) {
    try {
      const [metrics] = await this.db
        .select()
        .from(schema.healthMetrics)
        .where(
          and(
            eq(schema.healthMetrics.userId, userId),
            eq(schema.healthMetrics.date, date)
          )
        );
      return metrics || null;
    } catch (error) {
      console.error('Error getting daily health metrics:', error);
      return null;
    }
  }

  /**
   * Create or update health metrics for a day
   * @param {object} metricsData - Health metrics data
   * @returns {Promise<object>} Created or updated health metrics
   */
  async createOrUpdateHealthMetrics(metricsData) {
    try {
      // Check if metrics for this day already exist
      const existingMetrics = await this.getDailyHealthMetrics(metricsData.userId, metricsData.date);
      
      if (existingMetrics) {
        // Update existing metrics
        const [metrics] = await this.db
          .update(schema.healthMetrics)
          .set({ ...metricsData, updatedAt: new Date() })
          .where(
            and(
              eq(schema.healthMetrics.userId, metricsData.userId),
              eq(schema.healthMetrics.date, metricsData.date)
            )
          )
          .returning();
        return metrics;
      } else {
        // Create new metrics
        const [metrics] = await this.db
          .insert(schema.healthMetrics)
          .values(metricsData)
          .returning();
        return metrics;
      }
    } catch (error) {
      console.error('Error creating/updating health metrics:', error);
      throw error;
    }
  }

  /**
   * Get historical health metrics for a time range
   * @param {string} userId - User ID
   * @param {string} metricType - Type of metric (steps, heartRate, etc.)
   * @param {string} timeRange - Time range (day, week, month, year)
   * @returns {Promise<Array>} Array of metrics
   */
  async getHistoricalMetrics(userId, metricType, timeRange) {
    try {
      // Calculate the start date based on time range
      const endDate = new Date();
      let startDate = new Date();
      
      switch (timeRange) {
        case 'day':
          // Just return today's data broken down by hour (hardcoded for now)
          return []; // This would typically come from another table or be calculated
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(endDate.getDate() - 7); // Default to week
      }
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      const metrics = await this.db
        .select()
        .from(schema.healthMetrics)
        .where(
          and(
            eq(schema.healthMetrics.userId, userId),
            // Date range comparison would go here but requires a database-specific syntax
            // Using a simplified approach for now
          )
        )
        .orderBy(schema.healthMetrics.date);
      
      // Filter by date manually since we're not using a database-specific date range query
      const filteredMetrics = metrics.filter(m => {
        return m.date >= startDateStr && m.date <= endDateStr;
      });
      
      // Format the results based on the metric type
      return filteredMetrics.map(m => ({
        date: m.date,
        label: new Date(m.date).toLocaleDateString('en-US', { weekday: 'short' }),
        value: m[metricType] || 0
      }));
    } catch (error) {
      console.error('Error getting historical metrics:', error);
      return [];
    }
  }
}

// Create and initialize the storage
const storage = new DatabaseStorage();

// Export the storage instance
module.exports = storage;