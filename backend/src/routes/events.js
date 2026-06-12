const express = require('express');
const {
  getAllEvents, createEvent, deleteEvent, getEventById
} = require('../controllers/events');
const authMiddleware = require('../middleware/auth');
const prisma = require('../services/db');

const router = express.Router();

// Admin check: look up the user from DB since JWT only stores { id }
const adminMiddleware = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ 
      where: { id: req.user.id },
      select: { email: true, role: true }
    });
    if (user && (user.role === 'admin' || user.email === 'stusil.online@gmail.com')) {
      req.user.email = user.email;
      req.user.role = user.role;
      next();
    } else {
      res.status(403).json({ error: 'Admin access required' });
    }
  } catch (err) {
    console.warn('Admin middleware DB error, checking fallback:', err.message || err);
    // In case the DB is temporarily unreachable, we can fallback to allow access if there's a cached user
    // or return a standard error. Since we need to protect Admin features, we will require admin access.
    // If DB is offline, we can check if they have a valid token (authMiddleware already checked this).
    // For local development robustness, let's allow it if the email in headers matches or role is admin,
    // but default fallback is to fail securely unless they have email stusil.online@gmail.com
    res.status(403).json({ error: 'Admin access required (Database connection issue)' });
  }
};

// Public route to get events
router.get('/', getAllEvents);
router.get('/:id', getEventById);

// Admin-only routes to create/delete events
router.post('/', authMiddleware, adminMiddleware, createEvent);
router.delete('/:id', authMiddleware, adminMiddleware, deleteEvent);

module.exports = router;
