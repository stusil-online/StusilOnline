const prisma = require('../services/db');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: { projects: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    const mappedUsers = users.map(user => ({
      id: user.id,
      name: user.full_name || user.username,
      email: user.email,
      role: user.role === 'admin' ? 'Admin' : 'Student',
      status: 'Active',
      projectsCount: user._count.projects,
      joined: new Date(user.created_at).toLocaleDateString(),
      created_at: user.created_at,
      field_of_study: user.field_of_study
    }));

    res.json(mappedUsers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

exports.getAllProjects = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        owner: { select: { id: true, username: true, full_name: true } },
        members: {
          include: {
            user: { select: { id: true, username: true, full_name: true, email: true } }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
};

// ==================== DELETION HELPERS ====================
const deleteProjectHelper = async (projectId, tx = prisma) => {
  if (tx === prisma) {
    await prisma.$transaction(async (innerTx) => {
      await innerTx.application.deleteMany({ where: { project_id: projectId } });
      await innerTx.projectRole.deleteMany({ where: { project_id: projectId } });
      await innerTx.projectMessage.deleteMany({ where: { project_id: projectId } });
      await innerTx.projectMember.deleteMany({ where: { project_id: projectId } });
      await innerTx.project.delete({ where: { id: projectId } });
    });
  } else {
    await tx.application.deleteMany({ where: { project_id: projectId } });
    await tx.projectRole.deleteMany({ where: { project_id: projectId } });
    await tx.projectMessage.deleteMany({ where: { project_id: projectId } });
    await tx.projectMember.deleteMany({ where: { project_id: projectId } });
    await tx.project.delete({ where: { id: projectId } });
  }
};

const deleteUserHelper = async (userId) => {
  await prisma.$transaction(async (tx) => {
    // 1. Delete user project memberships
    await tx.projectMember.deleteMany({ where: { user_id: userId } });

    // 2. Delete user's owned projects (and all their cascading dependencies)
    const ownedProjects = await tx.project.findMany({ where: { owner_id: userId } });
    for (const proj of ownedProjects) {
      await deleteProjectHelper(proj.id, tx);
    }

    // 3. Delete user-submitted applications
    await tx.application.deleteMany({ where: { user_id: userId } });

    // 4. Delete messages sent or received by user
    await tx.message.deleteMany({
      where: {
        OR: [
          { sender_id: userId },
          { receiver_id: userId }
        ]
      }
    });

    // 5. Delete project group messages sent by user
    await tx.projectMessage.deleteMany({ where: { sender_id: userId } });

    // 6. Delete notifications sent to user
    await tx.notification.deleteMany({ where: { user_id: userId } });

    // 7. Finally, delete the user itself
    await tx.user.delete({ where: { id: userId } });
  });
};

// ==================== CONTROLLER EXPORTS ====================

exports.deleteUser = async (req, res) => {
  try {
    await deleteUserHelper(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    await deleteProjectHelper(req.params.id);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
};

exports.removeProjectMember = async (req, res) => {
  try {
    const { projectId, memberId } = req.params;
    // Don't allow removing the owner
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    const member = await prisma.projectMember.findUnique({ where: { id: memberId } });
    
    if (!project || !member) return res.status(404).json({ error: 'Not found' });
    if (member.user_id === project.owner_id) {
      return res.status(400).json({ error: 'Cannot remove the project owner. Delete the project instead.' });
    }

    // Find associated application to clean up
    const memberRecord = await prisma.projectMember.findUnique({ where: { id: memberId } });
    if (memberRecord) {
      const application = await prisma.application.findFirst({
        where: {
          project_id: projectId,
          user_id: memberRecord.user_id,
          status: 'accepted'
        }
      });

      if (application) {
        await prisma.application.delete({ where: { id: application.id } });
        await prisma.projectRole.update({
          where: { id: application.role_id },
          data: { is_filled: false }
        });
      }
    }

    await prisma.projectMember.delete({ where: { id: memberId } });
    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove member' });
  }
};
