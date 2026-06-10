const express = require('express');
const {
  getAllUsers, getAllProjects, deleteUser, deleteProject, removeProjectMember
} = require('../controllers/admin');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

const prisma = require('../controllers/../services/db');

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
    console.error('Admin middleware error:', err);
    res.status(500).json({ error: 'Server error checking admin access' });
  }
};

router.use(authMiddleware, adminMiddleware);

router.get('/users', getAllUsers);
router.get('/projects', getAllProjects);
router.delete('/users/:id', deleteUser);
router.delete('/projects/:id', deleteProject);
router.delete('/projects/:projectId/members/:memberId', removeProjectMember);

module.exports = router;
