const fs = require('fs');
const path = require('path');
const prisma = require('../services/db');

const fallbackFilePath = path.join(__dirname, '..', 'data', 'events.json');

// Helper to read events from fallback file
const readFallbackFile = () => {
  try {
    if (fs.existsSync(fallbackFilePath)) {
      const data = fs.readFileSync(fallbackFilePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to read fallback file:', err);
  }
  return [];
};

// Helper to write events to fallback file
const writeFallbackFile = (events) => {
  try {
    const dir = path.dirname(fallbackFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(fallbackFilePath, JSON.stringify(events, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Failed to write to fallback file:', err);
    return false;
  }
};

exports.getAllEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { created_at: 'desc' }
    });
    return res.json(events);
  } catch (error) {
    console.warn('Database error while fetching events, falling back to JSON file storage:', error.message || error);
    const events = readFallbackFile();
    // Sort by created_at desc (newest first)
    events.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return res.json(events);
  }
};

exports.createEvent = async (req, res) => {
  const { title, description, date, status, details } = req.body;
  if (!title || !description || !date) {
    return res.status(400).json({ error: 'Title, description, and date are required' });
  }

  const eventStatus = status || 'upcoming';
  const serializedDetails = typeof details === 'string' ? details : details ? JSON.stringify(details) : null;

  try {
    const newEvent = await prisma.event.create({
      data: {
        title,
        description,
        date,
        status: eventStatus,
        details: serializedDetails
      }
    });
    return res.status(201).json(newEvent);
  } catch (error) {
    console.warn('Database error while creating event, falling back to JSON file storage:', error.message || error);
    const events = readFallbackFile();
    const newEvent = {
      id: 'event_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now(),
      title,
      description,
      date,
      status: eventStatus,
      details: serializedDetails,
      created_at: new Date().toISOString()
    };
    events.push(newEvent);
    writeFallbackFile(events);
    return res.status(201).json(newEvent);
  }
};

exports.getEventById = async (req, res) => {
  const { id } = req.params;
  try {
    const event = await prisma.event.findUnique({
      where: { id }
    });
    if (!event) {
      // Try fallback file
      const events = readFallbackFile();
      const fallbackEvent = events.find(e => e.id === id);
      if (!fallbackEvent) {
        return res.status(404).json({ error: 'Event not found' });
      }
      return res.json(fallbackEvent);
    }
    return res.json(event);
  } catch (error) {
    console.warn('Database error while fetching single event, checking JSON fallback:', error.message || error);
    const events = readFallbackFile();
    const fallbackEvent = events.find(e => e.id === id);
    if (!fallbackEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }
    return res.json(fallbackEvent);
  }
};

exports.deleteEvent = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.event.delete({
      where: { id }
    });
    return res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.warn('Database error while deleting event, falling back to JSON file storage:', error.message || error);
    const events = readFallbackFile();
    const filteredEvents = events.filter(e => e.id !== id);
    
    // Check if anything was actually deleted in fallback
    if (events.length === filteredEvents.length) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    writeFallbackFile(filteredEvents);
    return res.json({ message: 'Event deleted successfully' });
  }
};
