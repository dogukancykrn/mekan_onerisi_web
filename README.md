# 🏢 Mekân Uygunluk Takip Sistemi

Uzaktan çalışanlar için mekân uygunluğunu gerçek zamanlı olarak izleyen modern bir web uygulaması.

## 🎯 Özellikler

- **Gerçek Zamanlı Veri Simülasyonu**: Gerçek sensörler olmadan, sensörlerden geliyormuş gibi akan örnek veriler
- **Çoklu Mekân İzleme**: Ofis, kafe, coworking space ve ev gibi farklı mekânları karşılaştırma
- **Uygunluk Skoru**: Her mekân için 0-100 arası uygunluk skoru hesaplama
- **Detaylı Sensör Verileri**:
  - 🌡️ Sıcaklık (°C)
  - 💧 Nem (%)
  - 💨 CO₂ Seviyesi (ppm)
  - 🔊 Gürültü (dB)
  - 💡 Aydınlatma (lux)
- **Görsel Grafikler**: Her sensör için geçmiş veri grafikleri
- **Responsive Tasarım**: Mobil, tablet ve masaüstü uyumlu

## 🚀 Kurulum

### Gereksinimler
- Node.js (v18 veya üzeri)
- npm veya yarn

### Adımlar

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

3. Tarayıcınızda açın:
```
http://localhost:5173
```

## 📊 Nasıl Çalışır?

### Sensör Simülasyonu
Uygulama, gerçek sensörler olmadan gerçekçi veri akışı sağlar:
- Her 3 saniyede bir yeni veri üretilir
- Günün saatine göre değişen değerler
- Mekân tipine özgü baz değerler
- Rastgele dalgalanmalar

### Uygunluk Skoru Hesaplama
Her parametre için ideal aralıklar tanımlanmıştır:
- **Sıcaklık**: 20-24°C (ideal: 22°C)
- **Nem**: 40-60% (ideal: 50%)
- **CO₂**: 400-800 ppm (ideal: 600 ppm)
- **Gürültü**: 30-50 dB (ideal: 40 dB)
- **Aydınlatma**: 300-500 lux (ideal: 400 lux)

Genel skor, ağırlıklı ortalama ile hesaplanır (CO₂ ve gürültü daha önemli).

### Skor Anlamları
- **80-100**: 🟢 Mükemmel çalışma ortamı
- **60-79**: 🟡 İyi çalışma ortamı
- **40-59**: 🟠 Orta kalite ortam
- **0-39**: 🔴 Zayıf çalışma ortamı

## 🛠️ Teknolojiler

- **React 18**: UI framework
- **TypeScript**: Type-safe kod
- **Vite**: Hızlı build tool
- **Recharts**: Veri görselleştirme
- **CSS3**: Modern styling

## 📁 Proje Yapısı

```
src/
├── components/          # React bileşenleri
│   ├── SpaceCard.tsx   # Mekân kartı
│   └── SensorChart.tsx # Sensör grafiği
├── hooks/              # Custom React hooks
│   └── useSpaceMonitoring.ts
├── services/           # İş mantığı
│   └── sensorSimulator.ts
├── App.tsx            # Ana uygulama
├── App.css            # Stiller
└── main.tsx           # Giriş noktası
```

## 🎨 Özelleştirme

### Yeni Mekân Ekleme
`src/hooks/useSpaceMonitoring.ts` dosyasında `SAMPLE_SPACES` dizisine ekleyin:

```typescript
{
  id: '5',
  name: 'Yeni Mekân',
  type: 'office', // veya 'cafe', 'coworking', 'home'
  description: 'Açıklama'
}
```

### İdeal Değerleri Değiştirme
`src/services/sensorSimulator.ts` dosyasında `IDEAL_RANGES` objesini düzenleyin.

## 📝 Lisans

Bu proje eğitim amaçlıdır ve özgürce kullanılabilir.

## 👨‍💻 Geliştirici

Uzaktan çalışanlar için mekân uygunluk takip sistemi.

---

**Not**: Bu uygulama simüle edilmiş veri kullanır. Gerçek sensör entegrasyonu için IoT cihazları ve API bağlantıları gereklidir.
