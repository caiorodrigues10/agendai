import { v4 as uuidv4 } from 'uuid';
import { QueueItem, Service, ShopSettings, StaffMember, FeedPost, Appointment } from '../types';
import { DEFAULT_SERVICES, DEFAULT_SHOP_SETTINGS, MOCK_QUEUE_INITIAL } from '../constants';

/**
 * --- BACKEND ARCHITECTURE & SCHEMA DOCUMENTATION ---
 * 
 * 1. TECHNOLOGY STACK RECOMMENDATION:
 *    - Language: Node.js (Express/NestJS) or Go (Gin/Fiber).
 *    - Database: PostgreSQL (Relational integrity) or MongoDB (Flexible schema).
 *    - Auth: JWT (JSON Web Tokens) with hashed PINs (using bcrypt/argon2).
 * 
 * 2. DATABASE SCHEMA (SQL-like definition):
 * 
 *    Table: staff
 *      id (UUID, PK)
 *      name (VARCHAR)
 *      pin_hash (VARCHAR) -- NEVER store plain text PINs
 *      role (ENUM: 'admin', 'barber')
 *      created_at (TIMESTAMP)
 * 
 *    Table: services
 *      id (UUID, PK)
 *      name (VARCHAR)
 *      price (DECIMAL)
 *      avg_time_minutes (INT)
 *      icon_key (VARCHAR)
 *      is_active (BOOLEAN)
 * 
 *    Table: queue_items
 *      id (UUID, PK)
 *      customer_name (VARCHAR)
 *      whatsapp (VARCHAR)
 *      service_id (UUID, FK -> services.id)
 *      status (ENUM: 'waiting', 'in_chair', 'completed', 'cancelled')
 *      joined_at (TIMESTAMP)
 *      started_at (TIMESTAMP, nullable)
 *      completed_at (TIMESTAMP, nullable)
 *      completed_by_staff_id (UUID, FK -> staff.id, nullable)
 *      final_price (DECIMAL, nullable) -- Snapshot price at time of completion
 *      is_manual_entry (BOOLEAN)
 * 
 *    Table: appointments
 *      id (UUID, PK)
 *      customer_name (VARCHAR)
 *      whatsapp (VARCHAR)
 *      service_id (UUID, FK -> services.id)
 *      staff_id (UUID, FK -> staff.id, nullable)
 *      scheduled_date (DATE)
 *      scheduled_time (TIME)
 *      status (ENUM: 'confirmed', 'cancelled', 'completed')
 * 
 *    Table: feed_posts
 *      id (UUID, PK)
 *      type (ENUM: 'haircut', 'beard', 'announcement')
 *      title (VARCHAR, nullable)
 *      content (TEXT)
 *      image_url (TEXT, nullable)
 *      likes_count (INT)
 *      author_id (UUID, FK -> staff.id)
 *      created_at (TIMESTAMP)
 * 
 *    Table: settings
 *      shop_id (PK) -- Single row usually
 *      shop_name (VARCHAR)
 *      schedule_json (JSONB) -- Store complex weekly schedule
 *      logo_url (TEXT)
 * 
 * 3. API ENDPOINTS STRUCTURE (RESTful):
 * 
 *    GET    /api/v1/queue          -> List current queue
 *    POST   /api/v1/queue          -> Join queue (Body: {name, phone, serviceId})
 *    PATCH  /api/v1/queue/:id      -> Update status (Body: {status: 'in_chair'})
 *    
 *    GET    /api/v1/services       -> List services
 *    POST   /api/v1/services       -> Create service (Admin only)
 * 
 *    POST   /api/v1/auth/login     -> Exchange PIN for JWT
 *    
 *    GET    /api/v1/feed           -> Get posts
 *    POST   /api/v1/feed           -> Create post (Staff only)
 * 
 */

// Keys
const KEYS = {
  QUEUE: 'barberQueue',
  SERVICES: 'barberServices',
  SETTINGS: 'barberShopSettings',
  STAFF: 'barberStaff',
  FEED: 'barberFeed',
  APPOINTMENTS: 'barberAppointments'
};

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- MOCK BACKEND IMPLEMENTATION ---
export const api = {
  queue: {
    list: async (): Promise<QueueItem[]> => {
      await delay(100);
      const data = localStorage.getItem(KEYS.QUEUE);
      return data ? JSON.parse(data) : MOCK_QUEUE_INITIAL;
    },
    save: async (items: QueueItem[]): Promise<void> => {
      await delay(100);
      localStorage.setItem(KEYS.QUEUE, JSON.stringify(items));
    }
  },

  services: {
    list: async (): Promise<Service[]> => {
      await delay(50);
      const data = localStorage.getItem(KEYS.SERVICES);
      return data ? JSON.parse(data) : DEFAULT_SERVICES;
    },
    save: async (items: Service[]): Promise<void> => {
      await delay(100);
      localStorage.setItem(KEYS.SERVICES, JSON.stringify(items));
    }
  },

  settings: {
    get: async (): Promise<ShopSettings> => {
      await delay(50);
      const data = localStorage.getItem(KEYS.SETTINGS);
      if (data) {
        const parsed = JSON.parse(data);
        if (!parsed.schedule) return { ...DEFAULT_SHOP_SETTINGS, shopName: parsed.shopName };
        return parsed;
      }
      return DEFAULT_SHOP_SETTINGS;
    },
    save: async (settings: ShopSettings): Promise<void> => {
      await delay(200);
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    }
  },

  staff: {
    list: async (): Promise<StaffMember[]> => {
      await delay(50);
      const data = localStorage.getItem(KEYS.STAFF);
      if (data) return JSON.parse(data);
      // Removed default simple password, keeping admin but logic should be robust
      return [{ id: 'admin-01', name: 'Admin', pin: '1234', role: 'admin' }];
    },
    save: async (items: StaffMember[]): Promise<void> => {
      await delay(100);
      localStorage.setItem(KEYS.STAFF, JSON.stringify(items));
    }
  },

  feed: {
    list: async (): Promise<FeedPost[]> => {
      await delay(50);
      const data = localStorage.getItem(KEYS.FEED);
      return data ? JSON.parse(data) : [{
        id: 'mock-1',
        type: 'announcement',
        content: 'Bem-vindo ao novo app da barbearia!',
        createdAt: Date.now(),
        likes: 5,
        authorName: 'Admin'
      }];
    },
    save: async (items: FeedPost[]): Promise<void> => {
      await delay(100);
      localStorage.setItem(KEYS.FEED, JSON.stringify(items));
    }
  },

  appointments: {
    list: async (): Promise<Appointment[]> => {
      await delay(50);
      const data = localStorage.getItem(KEYS.APPOINTMENTS);
      return data ? JSON.parse(data) : [];
    },
    save: async (items: Appointment[]): Promise<void> => {
      await delay(100);
      localStorage.setItem(KEYS.APPOINTMENTS, JSON.stringify(items));
    }
  }
};