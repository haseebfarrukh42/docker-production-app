import React, { useState, useEffect } from 'react';

function App() {
  const [backendData, setBackendData] = useState(null);
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // These requests go through Nginx reverse proxy (Phase 4)
    Promise.all([
      fetch('/api/info').then(r => r.json()),
      fetch('/api/python/info').then(r => r.json())
    ])
    .then(([backend, api]) => {
      setBackendData(backend);
      setApiData(api);
      setLoading(false);
    })
    .catch(() => setLoading(false));
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🐳 Docker Production App</h1>
      <p style={styles.subtitle}>Multi-Container Architecture on AWS EC2</p>

      <div style={styles.grid}>
        <ServiceCard
          title="Frontend"
          status="running"
          tech="React → Nginx (Multi-Stage)"
          color="#61dafb"
        />
        <ServiceCard
          title="Backend"
          status={backendData ? 'connected' : 'connecting...'}
          tech="Node.js + Express"
          color="#68d391"
        />
        <ServiceCard
          title="API Service"
          status={apiData ? 'connected' : 'connecting...'}
          tech="Python + FastAPI"
          color="#f6ad55"
        />
      </div>

      {loading && <p style={styles.loading}>Connecting to services...</p>}

      {backendData && (
        <div style={styles.dataBox}>
          <h3>Backend Response</h3>
          <pre>{JSON.stringify(backendData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

function ServiceCard({ title, status, tech, color }) {
  return (
    <div style={{...styles.card, borderTop: `4px solid ${color}`}}>
      <h2 style={{ color }}>{title}</h2>
      <p>Status: <strong>{status}</strong></p>
      <p style={styles.tech}>{tech}</p>
    </div>
  );
}

const styles = {
  container: { fontFamily: 'Arial', maxWidth: '900px',
    margin: '0 auto', padding: '40px 20px',
    background: '#0d1117', minHeight: '100vh', color: '#e6edf3' },
  title: { textAlign: 'center', fontSize: '2.5rem', marginBottom: '10px' },
  subtitle: { textAlign: 'center', color: '#8b949e', marginBottom: '40px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px', marginBottom: '40px' },
  card: { background: '#161b22', padding: '24px',
    borderRadius: '8px', border: '1px solid #30363d' },
  tech: { color: '#8b949e', fontSize: '0.85rem' },
  loading: { textAlign: 'center', color: '#8b949e' },
  dataBox: { background: '#161b22', padding: '20px',
    borderRadius: '8px', border: '1px solid #30363d' }
};

export default App;
