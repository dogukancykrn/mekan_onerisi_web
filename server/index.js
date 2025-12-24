const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'mekan-uygunluk-secret-key-2025';

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Vercel preview URL'lerini ve production'ı kabul et
    const allowedOrigins = [
      'http://localhost:5173',
      'https://mekan-onerisi-web-jxm9.vercel.app'
    ];
    
    // Vercel preview URL'leri: *.vercel.app
    if (!origin || 
        allowedOrigins.includes(origin) || 
        origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Render.com için in-memory SQLite (production) veya dosya tabanlı (local)
const dbPath = process.env.NODE_ENV === 'production' 
  ? ':memory:'  // Render.com'da RAM'de
  : path.join(__dirname, 'data', 'database.sqlite');  // Local'de dosyada

// Data klasörünü oluştur (sadece local için)
const fs = require('fs');
if (process.env.NODE_ENV !== 'production') {
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// SQLite Database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Veritabanı bağlantı hatası:', err);
  } else {
    console.log('✅ SQLite veritabanına bağlanıldı');
    initDatabase();
  }
});

// Veritabanı tablosunu oluştur
function initDatabase() {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Tablo oluşturma hatası:', err);
    } else {
      console.log('✅ Users tablosu hazır');
    }
  });
}

// JWT Token doğrulama middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token bulunamadı' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Geçersiz token' });
    }
    req.user = user;
    next();
  });
}

// ==================== AUTH ENDPOINTS ====================

// Kayıt Olma (Register)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validasyon
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Tüm alanları doldurun' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Şifre en az 6 karakter olmalı' });
    }

    // Email kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Geçerli bir email adresi girin' });
    }

    // Kullanıcı var mı kontrol et
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Veritabanı hatası' });
      }

      if (user) {
        return res.status(400).json({ error: 'Bu email zaten kayıtlı' });
      }

      // Şifreyi hashle
      const hashedPassword = await bcrypt.hash(password, 10);

      // Kullanıcıyı kaydet
      db.run(
        'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
        [email, hashedPassword, name],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Kayıt başarısız' });
          }

          // JWT token oluştur
          const token = jwt.sign(
            { id: this.lastID, email, name },
            JWT_SECRET,
            { expiresIn: '7d' }
          );

          res.status(201).json({
            message: 'Kayıt başarılı',
            token,
            user: { id: this.lastID, email, name }
          });
        }
      );
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Giriş Yapma (Login)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validasyon
    if (!email || !password) {
      return res.status(400).json({ error: 'Email ve şifre gerekli' });
    }

    // Kullanıcıyı bul
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Veritabanı hatası' });
      }

      if (!user) {
        return res.status(401).json({ error: 'Email veya şifre hatalı' });
      }

      // Şifre kontrolü
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Email veya şifre hatalı' });
      }

      // JWT token oluştur
      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Giriş başarılı',
        token,
        user: { id: user.id, email: user.email, name: user.name }
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Kullanıcı Bilgisi Getir (Token ile)
app.get('/api/auth/me', authenticateToken, (req, res) => {
  db.get('SELECT id, email, name, created_at FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Veritabanı hatası' });
    }

    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    res.json({ user });
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'API çalışıyor! 🚀' });
});

// Admin: Tüm kullanıcıları listele (şifreleri gösterme)
app.get('/api/admin/users', (req, res) => {
  db.all('SELECT id, email, name, created_at FROM users', [], (err, users) => {
    if (err) {
      return res.status(500).json({ error: 'Veritabanı hatası' });
    }
    res.json({ 
      count: users.length,
      users 
    });
  });
});

// ==================== SERVER START ====================

app.listen(PORT, () => {
  console.log(`\n🚀 Server çalışıyor: http://localhost:${PORT}`);
  console.log(`📊 API Endpoints:`);
  console.log(`   POST /api/auth/register - Kayıt ol`);
  console.log(`   POST /api/auth/login    - Giriş yap`);
  console.log(`   GET  /api/auth/me       - Kullanıcı bilgisi\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('\n👋 Veritabanı bağlantısı kapatıldı');
    process.exit(0);
  });
});
