const prisma = require('../services/db');

exports.getConnections = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    // Find all other users in the database excluding self and admins
    const otherUsers = await prisma.user.findMany({
      where: {
        id: { not: currentUserId },
        role: { not: 'admin' }
      },
      select: {
        id: true,
        full_name: true,
        username: true
      }
    });

    res.json({
      connectedUsers: otherUsers
    });
  } catch (error) {
    console.error("Error fetching connections:", error);
    res.status(500).json({ error: 'Failed to fetch connections' });
  }
};
