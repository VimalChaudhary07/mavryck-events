import express from 'express';
import db from './db';

const app = express();
app.use(express.json());

// Events endpoints
app.post('/api/events', (req, res) => {
  try {
    const stmt = db.prepare(`
      INSERT INTO events (name, email, phone, eventType, date, guestCount, requirements, status)
      VALUES (@name, @email, @phone, @eventType, @date, @guestCount, @requirements, @status)
    `);
    const result = stmt.run({
      ...req.body,
      status: 'pending'
    });
    res.json({ id: result.lastInsertRowid });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

app.get('/api/events', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM events ORDER BY created_at DESC');
    const events = stmt.all();
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Contact messages endpoints
app.post('/api/messages', (req, res) => {
  try {
    const stmt = db.prepare(`
      INSERT INTO contact_messages (name, email, message)
      VALUES (@name, @email, @message)
    `);
    const result = stmt.run(req.body);
    res.json({ id: result.lastInsertRowid });
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ error: 'Failed to save message' });
  }
});

app.get('/api/messages', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM contact_messages ORDER BY created_at DESC');
    const messages = stmt.all();
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Gallery endpoints
app.post('/api/gallery', (req, res) => {
  try {
    const stmt = db.prepare(`
      INSERT INTO gallery (title, image_url, category, description)
      VALUES (@title, @image_url, @category, @description)
    `);
    const result = stmt.run(req.body);
    res.json({ id: result.lastInsertRowid });
  } catch (error) {
    console.error('Error creating gallery item:', error);
    res.status(500).json({ error: 'Failed to add gallery item' });
  }
});

app.get('/api/gallery', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM gallery ORDER BY created_at DESC');
    const gallery = stmt.all();
    res.json(gallery);
  } catch (error) {
    console.error('Error fetching gallery:', error);
    res.status(500).json({ error: 'Failed to fetch gallery' });
  }
});

// Products endpoints
app.post('/api/products', (req, res) => {
  try {
    const stmt = db.prepare(`
      INSERT INTO products (name, description, price, image_url)
      VALUES (@name, @description, @price, @image_url)
    `);
    const result = stmt.run(req.body);
    res.json({ id: result.lastInsertRowid });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

app.get('/api/products', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM products ORDER BY created_at DESC');
    const products = stmt.all();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Testimonials endpoints
app.post('/api/testimonials', (req, res) => {
  try {
    const stmt = db.prepare(`
      INSERT INTO testimonials (name, role, content, rating, avatar_url)
      VALUES (@name, @role, @content, @rating, @avatar_url)
    `);
    const result = stmt.run(req.body);
    res.json({ id: result.lastInsertRowid });
  } catch (error) {
    console.error('Error creating testimonial:', error);
    res.status(500).json({ error: 'Failed to add testimonial' });
  }
});

app.get('/api/testimonials', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM testimonials ORDER BY created_at DESC');
    const testimonials = stmt.all();
    res.json(testimonials);
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});