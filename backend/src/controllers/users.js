const prisma = require('../services/db');
const fs = require('fs');
const path = require('path');

const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        full_name: true,
        field_of_study: true,
        skill_level: true,
        profile_image: true,
        bio: true,
        discord_username: true,
        created_at: true,
      },
      orderBy: { created_at: 'desc' }
    });

    const filteredUsers = users.filter(u => u.id !== req.user.id);
    return res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ error: "Server error fetching users" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { bio, full_name, university, field_of_study, links, country, discord_username } = req.body;
    const updateData = {};
    if (bio !== undefined) updateData.bio = bio;
    if (full_name !== undefined) updateData.full_name = full_name;
    if (university !== undefined) updateData.university = university;
    if (field_of_study !== undefined) updateData.field_of_study = field_of_study;
    if (country !== undefined) updateData.country = country;
    if (discord_username !== undefined) updateData.discord_username = discord_username;
    if (links !== undefined) updateData.links = typeof links === 'string' ? links : JSON.stringify(links);

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true, username: true, email: true, full_name: true,
        university: true, field_of_study: true, bio: true, profile_image: true, links: true,
        discord_username: true,
      }
    });


    res.json(user);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.body.profile_image) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    // Store base64 image data URL directly in database
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { profile_image: req.body.profile_image },
      select: {
        id: true, username: true, full_name: true, profile_image: true,
      }
    });

    res.json(user);
  } catch (error) {
    console.error("Error uploading profile photo:", error);
    res.status(500).json({ error: "Failed to upload profile photo" });
  }
};

const getPortfolio = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        full_name: true,
        field_of_study: true,
        skill_level: true,
        profile_image: true,
        bio: true,
        discord_username: true,
        country: true,
        university: true,
        links: true,
      }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const ownedProjects = await prisma.project.findMany({
      where: { owner_id: user.id }
    });

    const memberProjects = await prisma.projectMember.findMany({
      where: { user_id: user.id },
      include: { project: true }
    });

    const projects = [
      ...ownedProjects.map(p => ({ ...p, isOwner: true })),
      ...memberProjects.map(m => ({ ...m.project, isOwner: false, roleTitle: m.role }))
    ];

    const uniqueProjectsMap = new Map();
    projects.forEach(p => {
      if (!uniqueProjectsMap.has(p.id)) {
        uniqueProjectsMap.set(p.id, p);
      }
    });
    const uniqueProjects = Array.from(uniqueProjectsMap.values());

    return res.status(200).json({
      user,
      portfolio: {
        bio: user.bio,
        skills: "[]",
        links: user.links
      },
      projects: uniqueProjects
    });
  } catch (error) {
    console.error("Error fetching portfolio:", error);
    return res.status(500).json({ error: "Failed to fetch portfolio" });
  }
};

module.exports = {
  getAllUsers,
  updateProfile,
  uploadProfilePhoto,
  getPortfolio,
};
