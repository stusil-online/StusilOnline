const prisma = require('../services/db');

const categories = ['scholarship', 'internship', 'competition', 'fellowship', 'grant', 'program', 'other'];
const studentLevels = ['high_school', 'undergraduate', 'graduate', 'any'];

const parseOpportunity = (input, { partial = false } = {}) => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { error: 'Request body must be an object' };
  }
  const data = {};
  const fields = ['title', 'deadline', 'category', 'link', 'eligibility_notes', 'student_level', 'is_remote', 'is_global'];

  for (const field of fields) {
    if (input[field] !== undefined) data[field] = input[field];
  }

  if (!partial || data.title !== undefined) {
    if (typeof data.title !== 'string' || !data.title.trim() || data.title.trim().length > 200) {
      return { error: 'Title is required and must be 200 characters or fewer' };
    }
    data.title = data.title.trim();
  }

  if (!partial || data.deadline !== undefined) {
    if (typeof data.deadline !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data.deadline)) {
      return { error: 'Deadline must be a valid date in YYYY-MM-DD format' };
    }
    const deadline = new Date(`${data.deadline}T23:59:59.999Z`);
    if (Number.isNaN(deadline.getTime()) || deadline.toISOString().slice(0, 10) !== data.deadline) {
      return { error: 'Deadline must be a valid calendar date' };
    }
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    if (deadline < today) return { error: 'Deadline cannot be in the past' };
    data.deadline = deadline;
  }

  if (!partial || data.category !== undefined) {
    if (!categories.includes(data.category)) return { error: 'Choose a valid opportunity category' };
  }

  if (!partial || data.link !== undefined) {
    if (typeof data.link !== 'string' || data.link.length > 2048) {
      return { error: 'Link is required and must be 2048 characters or fewer' };
    }
    try {
      const url = new URL(data.link);
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
    } catch {
      return { error: 'Link must be a valid HTTP or HTTPS URL' };
    }
  }

  if (data.eligibility_notes !== undefined && data.eligibility_notes !== null && typeof data.eligibility_notes !== 'string') {
    return { error: 'Eligibility notes must be text' };
  }
  if (typeof data.eligibility_notes === 'string') {
    if (data.eligibility_notes.length > 5000) return { error: 'Eligibility notes must be 5000 characters or fewer' };
    data.eligibility_notes = data.eligibility_notes.trim() || null;
  }

  if (!partial || data.student_level !== undefined) {
    if (!studentLevels.includes(data.student_level)) return { error: 'Choose a valid student level' };
  }

  for (const field of ['is_remote', 'is_global']) {
    if (data[field] !== undefined && typeof data[field] !== 'boolean') {
      return { error: `${field} must be true or false` };
    }
  }

  return { data };
};

const getFilters = (query) => {
  const where = {};
  if (query.category) {
    if (!categories.includes(query.category)) return { error: 'Invalid category filter' };
    where.category = query.category;
  }
  if (query.level && query.level !== 'any') {
    if (!studentLevels.includes(query.level)) return { error: 'Invalid student level filter' };
    where.OR = [{ student_level: query.level }, { student_level: 'any' }];
  }
  for (const field of ['remote', 'global']) {
    if (query[field] !== undefined) {
      if (query[field] !== 'true' && query[field] !== 'false') return { error: `Invalid ${field} filter` };
      where[field === 'remote' ? 'is_remote' : 'is_global'] = query[field] === 'true';
    }
  }
  return { where };
};

exports.getOpenOpportunities = async (req, res) => {
  const { where, error } = getFilters(req.query);
  if (error) return res.status(400).json({ error });

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  try {
    const opportunities = await prisma.opportunity.findMany({
      where: { ...where, deadline: { gte: today } },
      orderBy: { deadline: 'asc' }
    });
    return res.json(opportunities);
  } catch (error) {
    console.error('Failed to fetch opportunities:', error);
    return res.status(500).json({ error: 'Unable to load opportunities' });
  }
};

exports.getAdminOpportunities = async (req, res) => {
  try {
    const opportunities = await prisma.opportunity.findMany({ orderBy: { deadline: 'asc' } });
    return res.json(opportunities);
  } catch (error) {
    console.error('Failed to fetch admin opportunities:', error);
    return res.status(500).json({ error: 'Unable to load opportunities' });
  }
};

exports.createOpportunity = async (req, res) => {
  const { data, error } = parseOpportunity(req.body);
  if (error) return res.status(400).json({ error });
  data.is_remote ??= false;
  data.is_global ??= false;

  try {
    const opportunity = await prisma.opportunity.create({ data });
    return res.status(201).json(opportunity);
  } catch (error) {
    console.error('Failed to create opportunity:', error);
    return res.status(500).json({ error: 'Unable to create opportunity' });
  }
};

exports.updateOpportunity = async (req, res) => {
  const { data, error } = parseOpportunity(req.body, { partial: true });
  if (error) return res.status(400).json({ error });
  if (Object.keys(data).length === 0) return res.status(400).json({ error: 'At least one field is required' });

  try {
    const opportunity = await prisma.opportunity.update({ where: { id: req.params.id }, data });
    return res.json(opportunity);
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Opportunity not found' });
    console.error('Failed to update opportunity:', error);
    return res.status(500).json({ error: 'Unable to update opportunity' });
  }
};