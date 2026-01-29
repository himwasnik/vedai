const fs = require('fs');
const path = require('path');

// Database file paths
const DB_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DB_DIR, 'users.json');
const CHATS_FILE = path.join(DB_DIR, 'chats.json');
const ORDERS_FILE = path.join(DB_DIR, 'orders.json');
const CART_FILE = path.join(DB_DIR, 'cart.json');

// Create data directory if it doesn't exist
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Initialize database files if they don't exist
function initDatabase() {
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(CHATS_FILE)) {
    fs.writeFileSync(CHATS_FILE, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(CART_FILE)) {
    fs.writeFileSync(CART_FILE, JSON.stringify([], null, 2));
  }
}

// Read from database
function readDB(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    return [];
  }
}

// Write to database
function writeDB(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing to database:', error);
    return false;
  }
}

// User operations
const users = {
  getAll: () => readDB(USERS_FILE),

  getById: (id) => {
    const allUsers = readDB(USERS_FILE);
    return allUsers.find(u => u.id === id);
  },

  getByEmail: (email) => {
    const allUsers = readDB(USERS_FILE);
    return allUsers.find(u => u.email === email);
  },

  create: (userData) => {
    const allUsers = readDB(USERS_FILE);
    const newUser = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...userData
    };
    allUsers.push(newUser);
    writeDB(USERS_FILE, allUsers);
    return newUser;
  },

  update: (id, userData) => {
    const allUsers = readDB(USERS_FILE);
    const index = allUsers.findIndex(u => u.id === id);
    if (index !== -1) {
      allUsers[index] = { ...allUsers[index], ...userData, updatedAt: new Date().toISOString() };
      writeDB(USERS_FILE, allUsers);
      return allUsers[index];
    }
    return null;
  }
};

// Chat operations
const chats = {
  getAll: () => readDB(CHATS_FILE),

  getByUserId: (userId) => {
    const allChats = readDB(CHATS_FILE);
    return allChats.filter(c => c.userId === userId);
  },

  create: (chatData) => {
    const allChats = readDB(CHATS_FILE);
    const newChat = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...chatData
    };
    allChats.push(newChat);
    writeDB(CHATS_FILE, allChats);
    return newChat;
  },

  addMessage: (chatId, message) => {
    const allChats = readDB(CHATS_FILE);
    const chat = allChats.find(c => c.id === chatId);
    if (chat) {
      if (!chat.messages) chat.messages = [];
      chat.messages.push({
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...message
      });
      writeDB(CHATS_FILE, allChats);
      return chat;
    }
    return null;
  }
};

// Cart operations
const cart = {
  getAll: () => readDB(CART_FILE),

  getByUserId: (userId) => {
    const allCarts = readDB(CART_FILE);
    return allCarts.filter(c => c.userId === userId);
  },

  add: (userId, productId, quantity = 1) => {
    const allCarts = readDB(CART_FILE);
    const existingItem = allCarts.find(c => c.userId === userId && c.productId === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.updatedAt = new Date().toISOString();
    } else {
      allCarts.push({
        id: Date.now().toString(),
        userId,
        productId,
        quantity,
        createdAt: new Date().toISOString()
      });
    }

    writeDB(CART_FILE, allCarts);
    return allCarts;
  },

  remove: (userId, productId) => {
    const allCarts = readDB(CART_FILE);
    const filtered = allCarts.filter(c => !(c.userId === userId && c.productId === productId));
    writeDB(CART_FILE, filtered);
    return filtered;
  },

  clear: (userId) => {
    const allCarts = readDB(CART_FILE);
    const filtered = allCarts.filter(c => c.userId !== userId);
    writeDB(CART_FILE, filtered);
    return filtered;
  }
};

// Order operations
const orders = {
  getAll: () => readDB(ORDERS_FILE),

  getByUserId: (userId) => {
    const allOrders = readDB(ORDERS_FILE);
    return allOrders.filter(o => o.userId === userId);
  },

  getById: (id) => {
    const allOrders = readDB(ORDERS_FILE);
    return allOrders.find(o => o.id === id);
  },

  create: (orderData) => {
    const allOrders = readDB(ORDERS_FILE);
    const newOrder = {
      id: `ORD-${Date.now()}`,
      orderNumber: `#${Date.now().toString().slice(-6)}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      ...orderData
    };
    allOrders.push(newOrder);
    writeDB(ORDERS_FILE, allOrders);
    return newOrder;
  },

  updateStatus: (id, status) => {
    const allOrders = readDB(ORDERS_FILE);
    const order = allOrders.find(o => o.id === id);
    if (order) {
      order.status = status;
      order.updatedAt = new Date().toISOString();
      writeDB(ORDERS_FILE, allOrders);
      return order;
    }
    return null;
  }
};

// Initialize database on module load
initDatabase();

module.exports = {
  users,
  chats,
  cart,
  orders,
  // Backup/Export functions
  backup: () => {
    const backup = {
      users: users.getAll(),
      chats: chats.getAll(),
      cart: cart.getAll(),
      orders: orders.getAll(),
      timestamp: new Date().toISOString()
    };
    const backupFile = path.join(DB_DIR, `backup-${Date.now()}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
    console.log(`✅ Database backed up to: ${backupFile}`);
    return backupFile;
  },

  // Import data
  import: (backupData) => {
    if (backupData.users) writeDB(USERS_FILE, backupData.users);
    if (backupData.chats) writeDB(CHATS_FILE, backupData.chats);
    if (backupData.cart) writeDB(CART_FILE, backupData.cart);
    if (backupData.orders) writeDB(ORDERS_FILE, backupData.orders);
    console.log('✅ Database imported successfully');
  }
};
