const { relations } = require('drizzle-orm');
const { pgTable, serial, varchar, timestamp, text, integer, date, boolean, real } = require('drizzle-orm/pg-core');

// Users table
const users = pgTable('users', {
  id: varchar('id', { length: 256 }).primaryKey().notNull(),
  name: varchar('name', { length: 256 }).notNull(),
  email: varchar('email', { length: 256 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Activities table
const activities = pgTable('activities', {
  id: varchar('id', { length: 256 }).primaryKey().notNull(),
  userId: varchar('user_id', { length: 256 }).notNull().references(() => users.id),
  type: varchar('type', { length: 256 }).notNull(),
  duration: integer('duration').notNull(),
  date: date('date').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
});

// Goals table
const goals = pgTable('goals', {
  id: varchar('id', { length: 256 }).primaryKey().notNull(),
  userId: varchar('user_id', { length: 256 }).notNull().references(() => users.id),
  name: varchar('name', { length: 256 }).notNull(),
  target: real('target').notNull(),
  current: real('current').notNull(),
  unit: varchar('unit', { length: 50 }).notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  deadline: date('deadline'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
});

// Notifications table
const notifications = pgTable('notifications', {
  id: varchar('id', { length: 256 }).primaryKey().notNull(),
  userId: varchar('user_id', { length: 256 }).notNull().references(() => users.id),
  type: varchar('type', { length: 50 }).notNull(),
  title: varchar('title', { length: 256 }).notNull(),
  message: text('message').notNull(),
  read: boolean('read').default(false).notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull()
});

// Health Metrics table for storing daily metrics
const healthMetrics = pgTable('health_metrics', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 256 }).notNull().references(() => users.id),
  date: date('date').notNull(),
  steps: integer('steps').default(0),
  heartRate: integer('heart_rate'),
  calories: integer('calories').default(0),
  activeMinutes: integer('active_minutes').default(0),
  distance: varchar('distance', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
});

// User relations
const usersRelations = relations(users, ({ many }) => ({
  activities: many(activities),
  goals: many(goals),
  notifications: many(notifications)
}));

// Activity relations
const activitiesRelations = relations(activities, ({ one }) => ({
  user: one(users, {
    fields: [activities.userId],
    references: [users.id]
  })
}));

// Goals relations
const goalsRelations = relations(goals, ({ one }) => ({
  user: one(users, {
    fields: [goals.userId],
    references: [users.id]
  })
}));

// Notifications relations
const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id]
  })
}));

// Health Metrics relations
const healthMetricsRelations = relations(healthMetrics, ({ one }) => ({
  user: one(users, {
    fields: [healthMetrics.userId],
    references: [users.id]
  })
}));

module.exports = {
  users,
  activities,
  goals,
  notifications,
  healthMetrics,
  usersRelations,
  activitiesRelations,
  goalsRelations,
  notificationsRelations,
  healthMetricsRelations
};