import express from 'express';
import db from './db.js';

const app = express();
app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Something went wrong!' });
});

// Events endpoints
app.post('/api/events', (req, res, next) => {
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
    next(error);
  }
});

app.get('/api/events', (req, res, next) => {
  try {
    const stmt = db.prepare('SELECT * FROM events ORDER BY created_at DESC');
    const events = stmt.all();
    res.json(events);
  } catch (error) {
    next(error);
  }
});

app.delete('/api/events/:id', (req, res, next) => {
  try {
    const stmt = db.prepare('DELETE FROM events WHERE id = ?');
    stmt.run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Contact messages endpoints
app.post('/api/messages', (req, res, next) => {
  try {
    const stmt = db.prepare(`
      INSERT INTO contact_messages (name, email, message)
      VALUES (@name, @email, @message)
    `);
    const result = stmt.run(req.body);
    res.json({ id: result.lastInsertRowid });
  } catch (error) {
    next(error);
  }
});

app.get('/api/messages', (req, res, next) => {
  try {
    const stmt = db.prepare('SELECT * FROM contact_messages ORDER BY created_at DESC');
    const messages = stmt.all();
    res.json(messages);
  } catch (error) {
    next(error);
  }
});

app.delete('/api/messages/:id', (req, res, next) => {
  try {
    const stmt = db.prepare('DELETE FROM contact_messages WHERE id = ?');
    stmt.run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Gallery endpoints
app.post('/api/gallery', (req, res, next) => {
  try {
    const stmt = db.prepare(`
      INSERT INTO gallery (title, image_url, category, description)
      VALUES (@title, @image_url, @category, @description)
    `);
    const result = stmt.run(req.body);
    res.json({ id: result.lastInsertRowid });
  } catch (error) {
    next(error);
  }
});

app.get('/api/gallery', (req, res, next) => {
  try {
    const stmt = db.prepare('SELECT * FROM gallery ORDER BY created_at DESC');
    const gallery = stmt.all();
    res.json(gallery);
  } catch (error) {
    next(error);
  }
});

app.delete('/api/gallery/:id', (req, res, next) => {
  try {
    const stmt = db.prepare('DELETE FROM gallery WHERE id = ?');
    stmt.run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Products endpoints
app.post('/api/products', (req, res, next) => {
  try {
    const stmt = db.prepare(`
      INSERT INTO products (name, description, price, image_url)
      VALUES (@name, @description, @price, @image_url)
    `);
    const result = stmt.run(req.body);
    res.json({ id: result.lastInsertRowid });
  } catch (error) {
    next(error);
  }
});

app.get('/api/products', (req, res, next) => {
  try {
    const stmt = db.prepare('SELECT * FROM products ORDER BY created_at DESC');
    const products = stmt.all();
    res.json(products);
  } catch (error) {
    next(error);
  }
});

app.delete('/api/products/:id', (req, res, next) => {
  try {
    const stmt = db.prepare('DELETE FROM products WHERE id = ?');
    stmt.run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Testimonials endpoints
app.post('/api/testimonials', (req, res, next) => {
  try {
    const stmt = db.prepare(`
      INSERT INTO testimonials (name, role, content, rating, avatar_url)
      VALUES (@name, @role, @content, @rating, @avatar_url)
    `);
    const result = stmt.run(req.body);
    res.json({ id: result.lastInsertRowid });
  } catch (error) {
    next(error);
  }
});

app.get('/api/testimonials', (req, res, next) => {
  try {
    const stmt = db.prepare('SELECT * FROM testimonials ORDER BY created_at DESC');
    const testimonials = stmt.all();
    res.json(testimonials);
  } catch (error) {
    next(error);
  }
});

app.delete('/api/testimonials/:id', (req, res, next) => {
  try {
    const stmt = db.prepare('DELETE FROM testimonials WHERE id = ?');
    stmt.run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});