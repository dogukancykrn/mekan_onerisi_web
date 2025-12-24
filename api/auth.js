import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'mekan-uygunluk-secret-key-2025';

// In-memory database (Vercel serverless için)
const users = [];

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  // Set CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  const path = req.url.split('?')[0];

  try {
    // Register endpoint
    if (path === '/api/auth/register' && req.method === 'POST') {
      const { email, password, name } = req.body;

      // Validation
      if (!email || !password || !name) {
        return res.status(400).json({ error: 'Tüm alanlar gereklidir' });
      }

      // Check if user exists
      if (users.find(u => u.email === email)) {
        return res.status(400).json({ error: 'Bu email zaten kayıtlı' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = {
        id: users.length + 1,
        email,
        password: hashedPassword,
        name,
        created_at: new Date().toISOString()
      };

      users.push(user);

      // Generate token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(201).json({
        message: 'Kayıt başarılı',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      });
    }

    // Login endpoint
    if (path === '/api/auth/login' && req.method === 'POST') {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email ve şifre gereklidir' });
      }

      // Find user
      const user = users.find(u => u.email === email);
      if (!user) {
        return res.status(401).json({ error: 'Geçersiz email veya şifre' });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Geçersiz email veya şifre' });
      }

      // Generate token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(200).json({
        message: 'Giriş başarılı',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      });
    }

    // Get current user endpoint
    if (path === '/api/auth/me' && req.method === 'GET') {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        return res.status(401).json({ error: 'Token bulunamadı' });
      }

      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = users.find(u => u.id === decoded.id);

        if (!user) {
          return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
        }

        return res.status(200).json({
          id: user.id,
          email: user.email,
          name: user.name
        });
      } catch (error) {
        return res.status(401).json({ error: 'Geçersiz token' });
      }
    }

    // 404
    return res.status(404).json({ error: 'Endpoint bulunamadı' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
}
