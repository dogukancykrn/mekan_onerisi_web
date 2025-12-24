# Railway Deployment Configuration

Bu backend Railway'de çalışacak şekilde yapılandırılmıştır.

## Environment Variables (Railway'de ayarlanacak):
- `PORT`: Railway otomatik ayarlar
- `JWT_SECRET`: Güvenli bir secret key
- `FRONTEND_URL`: Vercel'den alacağınız frontend URL
- `NODE_ENV`: production

## Database:
SQLite kullanıyoruz. Railway her deploy'da persistent volume sağlıyor.

## Start Command:
```
npm start
```

## Build Command:
Gerek yok (Node.js direkt çalışır)
