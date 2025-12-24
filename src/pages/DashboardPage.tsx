import { useAuth } from '../context/AuthContext';
import { useSpaceMonitoring } from '../hooks/useSpaceMonitoring';
import { SpaceCard } from '../components/SpaceCard';
import { SensorChart } from '../components/SensorChart';
import { useState, useEffect } from 'react';
import '../App.css';

export function DashboardPage() {
  const { user, logout } = useAuth();
  const { spaces, isMonitoring } = useSpaceMonitoring();
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    // PWA install prompt'u yakala
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('✅ Kullanıcı PWA yükledi');
    }
    
    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  const selectedSpace = spaces.find(s => s.id === selectedSpaceId);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div>
            <h1>🏢 Mekân Uygunluk Takip Sistemi</h1>
            <p className="subtitle">
              Uzaktan çalışma için en uygun mekânı bulun
              {isMonitoring && <span className="live-indicator">● Canlı</span>}
            </p>
          </div>
          <div className="user-section">
            {showInstallButton && (
              <button 
                className="install-button" 
                onClick={handleInstallClick}
                style={{
                  marginRight: '1rem',
                  padding: '0.5rem 1rem',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                📱 Telefona Yükle
              </button>
            )}
            <div className="user-info">
              <span className="user-name">👤 {user?.name}</span>
              <button className="logout-button" onClick={logout}>
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="app-main">
        <section className="spaces-section">
          <h2>Mekânlar</h2>
          <div className="spaces-grid">
            {spaces.map(space => (
              <div key={space.id} onClick={() => setSelectedSpaceId(space.id)}>
                <SpaceCard space={space} />
              </div>
            ))}
          </div>
        </section>

        {selectedSpace && (
          <section className="charts-section">
            <div className="charts-header">
              <h2>Detaylı Sensör Verileri</h2>
              <button 
                className="close-button"
                onClick={() => setSelectedSpaceId(null)}
              >
                ✕ Kapat
              </button>
            </div>
            
            <div className="charts-grid">
              <SensorChart space={selectedSpace} sensorType="temperature" />
              <SensorChart space={selectedSpace} sensorType="humidity" />
              <SensorChart space={selectedSpace} sensorType="co2" />
              <SensorChart space={selectedSpace} sensorType="noise" />
              <SensorChart space={selectedSpace} sensorType="light" />
            </div>
          </section>
        )}

        <section className="info-section">
          <div className="info-card">
            <h3>📊 Nasıl Çalışır?</h3>
            <ul>
              <li>Her mekândan gerçek zamanlı sensör verileri simüle edilir</li>
              <li>Sıcaklık, nem, CO₂, gürültü ve aydınlatma değerleri izlenir</li>
              <li>Her parametre ideal aralıklar ile karşılaştırılır</li>
              <li>Genel uygunluk skoru 0-100 arasında hesaplanır</li>
            </ul>
          </div>

          <div className="info-card">
            <h3>✅ İdeal Değerler</h3>
            <ul>
              <li><strong>Sıcaklık:</strong> 20-24°C (ideal: 22°C)</li>
              <li><strong>Nem:</strong> 40-60% (ideal: 50%)</li>
              <li><strong>CO₂:</strong> 400-800 ppm (ideal: 600 ppm)</li>
              <li><strong>Gürültü:</strong> 30-50 dB (ideal: 40 dB)</li>
              <li><strong>Aydınlatma:</strong> 300-500 lux (ideal: 400 lux)</li>
            </ul>
          </div>

          <div className="info-card">
            <h3>🎯 Skor Anlamları</h3>
            <ul>
              <li><span className="score-indicator excellent">●</span> <strong>80-100:</strong> Mükemmel çalışma ortamı</li>
              <li><span className="score-indicator good">●</span> <strong>60-79:</strong> İyi çalışma ortamı</li>
              <li><span className="score-indicator medium">●</span> <strong>40-59:</strong> Orta kalite ortam</li>
              <li><span className="score-indicator poor">●</span> <strong>0-39:</strong> Zayıf çalışma ortamı</li>
            </ul>
          </div>
        </section>
      </main>

      <footer className="app-footer">
        <p>© 2025 Mekân Uygunluk Takip Sistemi | Sensör verileri simüle edilmiştir</p>
      </footer>
    </div>
  );
}
