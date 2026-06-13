const prisma = require('../services/db');

exports.getTrending = async (req, res) => {
  try {
    // Trending Projects: Highest (views + stars * 5)
    const trendingProjects = await prisma.project.findMany({
      where: { visibility: 'public' },
      take: 3,
      orderBy: [
        { stars: 'desc' },
        { views: 'desc' },
        { created_at: 'desc' }
      ],
      select: {
        id: true,
        title: true,
        field: true,
        banner_image: true,
        views: true,
        stars: true,
        owner: { select: { full_name: true, username: true, profile_image: true } }
      }
    });

    // Top 3 Students for mini-leaderboard
    const topStudentsData = await prisma.user.findMany({
      take: 20,
      select: {
        id: true,
        full_name: true,
        username: true,
        profile_image: true,
        _count: { select: { projects: true } }
      }
    });

    const topStudents = topStudentsData
      .sort((a, b) => b._count.projects - a._count.projects)
      .slice(0, 3);

    res.json({
      trendingProjects,
      hotIdeas: [], // Kept as empty array to avoid breaking frontend immediately
      topStudents: topStudents.map(s => ({
        ...s,
        xp: s._count.projects * 10
      }))
    });
  } catch (error) {
    console.error("Error fetching trending data:", error);
    res.status(500).json({ error: 'Failed to fetch trending data' });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    // Fetch top 50 users then sort by total contributions (projects)
    const users = await prisma.user.findMany({
      take: 50,
      select: {
        id: true,
        full_name: true,
        username: true,
        profile_image: true,
        field_of_study: true,
        country: true,
        _count: {
          select: { projects: true }
        }
      }
    });

    // Sort by calculated XP proxy: (projects * 2)
    const topStudents = users
      .sort((a, b) => {
        const scoreA = a._count.projects;
        const scoreB = b._count.projects;
        return scoreB - scoreA;
      })
      .slice(0, 10);

    // Top Projects: Most stars overall
    const topProjects = await prisma.project.findMany({
      where: { visibility: 'public' },
      take: 5,
      orderBy: [
        { stars: 'desc' },
        { created_at: 'desc' }
      ],
      select: {
        id: true,
        title: true,
        stars: true,
        field: true,
        owner: { select: { full_name: true, profile_image: true } }
      }
    });

    res.json({
      topStudents,
      topProjects
    });
  } catch (err) {
    console.error("Leaderboard fetch error:", err);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
};

exports.getStats = async (req, res) => {
  try {
    const activeStudents = await prisma.user.count({
      where: { role: { not: 'admin' } }
    });
    const projectsBuilt = await prisma.project.count({
      where: { visibility: 'public' }
    });
    const teamsFormed = await prisma.projectMember.count();

    const distinctUniversities = await prisma.user.findMany({
      where: {
        AND: [
          { university: { not: null } },
          { university: { not: "" } }
        ]
      },
      select: { university: true },
      distinct: ['university']
    });

    res.json({
      activeStudents,
      projectsBuilt,
      teamsFormed,
      universities: distinctUniversities.length
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};
