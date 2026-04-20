/**
 * ToolsPage — Bonus tools: Weather App + QR Code Generator + Text Editor
 * Demonstrates DOM manipulation, API calls, and event handling
 */
import React, { useState, useRef, useCallback } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';

// ==================== WEATHER WIDGET ====================
const WeatherWidget = () => {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Async/await API call with error handling
  const fetchWeather = useCallback(async (e) => {
    e.preventDefault();
    if (!city.trim()) return;
    setLoading(true); setError(''); setWeather(null);

    try {
      // Using Open-Meteo (free, no API key needed) + Geocoding
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
      const geoData = await geoRes.json();

      if (!geoData.results?.length) throw new Error('City not found. Try another name.');

      const { latitude, longitude, name, country } = geoData.results[0];
      const wxRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=relativehumidity_2m,windspeed_10m`
      );
      const wxData = await wxRes.json();
      const cw = wxData.current_weather;

      // WMO weather codes to descriptions
      const wmoDesc = {
        0: 'Clear Sky', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
        45: 'Foggy', 48: 'Icy Fog', 51: 'Light Drizzle', 61: 'Light Rain',
        63: 'Moderate Rain', 65: 'Heavy Rain', 71: 'Light Snow', 80: 'Showers',
        95: 'Thunderstorm'
      };
      const wmoIcon = {
        0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️', 45: '🌫️', 48: '🌫️',
        51: '🌦️', 61: '🌧️', 63: '🌧️', 65: '🌧️', 71: '🌨️', 80: '🌦️', 95: '⛈️'
      };

      setWeather({
        city: `${name}, ${country}`,
        temp: Math.round(cw.temperature),
        windspeed: cw.windspeed,
        desc: wmoDesc[cw.weathercode] || 'Unknown',
        icon: wmoIcon[cw.weathercode] || '🌡️',
        isDay: cw.is_day === 1
      });
    } catch (err) {
      setError(err.message || 'Failed to fetch weather data.');
    } finally {
      setLoading(false);
    }
  }, [city]);

  return (
    <div className="glass-card h-100">
      <div className="d-flex align-items-center gap-2 mb-4">
        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(77,150,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🌦️</div>
        <div>
          <h6 style={{ fontWeight: 700, margin: 0 }}>Weather App</h6>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#8892b0' }}>Real-time weather via API</p>
        </div>
      </div>

      <form onSubmit={fetchWeather} className="d-flex gap-2 mb-4">
        <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="Enter city name..." className="form-control-custom flex-grow-1" id="weather-city-input" />
        <button type="submit" disabled={loading} className="btn-primary-custom" style={{ flexShrink: 0, padding: '0.65rem 1.2rem' }}>
          {loading ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-search"></i>}
        </button>
      </form>

      {error && <div style={{ color: '#ff6b6b', background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 10, padding: '0.75rem', fontSize: '0.85rem' }}><i className="bi bi-exclamation-circle me-2"></i>{error}</div>}

      {weather && (
        <div style={{ background: 'linear-gradient(135deg,rgba(77,150,255,0.15),rgba(108,99,255,0.1))', border: '1px solid rgba(77,150,255,0.3)', borderRadius: 16, padding: '1.5rem', textAlign: 'center', animation: 'fadeInUp 0.4s ease' }}>
          <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>{weather.icon}</div>
          <h4 style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: '3rem', color: '#4d96ff', margin: 0 }}>{weather.temp}°C</h4>
          <div style={{ fontSize: '1rem', color: '#f0f4ff', fontWeight: 600, margin: '0.5rem 0' }}>{weather.desc}</div>
          <div style={{ color: '#8892b0', fontSize: '0.9rem', marginBottom: '1rem' }}>{weather.city}</div>
          <div className="d-flex justify-content-center gap-4">
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#8892b0', fontSize: '0.75rem' }}>Wind</div>
              <div style={{ fontWeight: 600, color: '#f0f4ff' }}>{weather.windspeed} km/h</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#8892b0', fontSize: '0.75rem' }}>Time</div>
              <div style={{ fontWeight: 600, color: '#f0f4ff' }}>{weather.isDay ? '☀️ Day' : '🌙 Night'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== QR CODE GENERATOR ====================
const QRGenerator = () => {
  const [text, setText] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [generated, setGenerated] = useState(false);

  // DOM manipulation — generate QR using free API
  const generateQR = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const encoded = encodeURIComponent(text);
    // Using qrserver.com free API
    setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encoded}&bgcolor=141929&color=6c63ff&format=png`);
    setGenerated(true);
  };

  const downloadQR = () => {
    const a = document.createElement('a'); // DOM manipulation
    a.href = qrUrl;
    a.download = 'smartbank-qr.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="glass-card h-100">
      <div className="d-flex align-items-center gap-2 mb-4">
        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(0,212,170,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>📱</div>
        <div>
          <h6 style={{ fontWeight: 700, margin: 0 }}>QR Code Generator</h6>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#8892b0' }}>Generate QR for any text or URL</p>
        </div>
      </div>

      <form onSubmit={generateQR} className="mb-4">
        <textarea value={text} onChange={e => { setText(e.target.value); setGenerated(false); }}
          placeholder="Enter text, URL, UPI ID, account number..." rows={3}
          className="form-control-custom mb-3" id="qr-text-input" style={{ resize: 'none' }} />
        <button type="submit" className="btn-primary-custom w-100" disabled={!text.trim()} id="generate-qr-btn">
          <i className="bi bi-qr-code me-2"></i>Generate QR Code
        </button>
      </form>

      {generated && qrUrl && (
        <div style={{ textAlign: 'center', animation: 'fadeInUp 0.4s ease' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '1rem', display: 'inline-block', marginBottom: '1rem' }}>
            <img src={qrUrl} alt="Generated QR Code" width={200} height={200} style={{ display: 'block' }} />
          </div>
          <div style={{ fontSize: '0.8rem', color: '#8892b0', marginBottom: '1rem', wordBreak: 'break-all', maxHeight: 60, overflow: 'hidden' }}>
            {text}
          </div>
          <button onClick={downloadQR} className="btn-outline-custom" style={{ padding: '0.5rem 1.5rem', fontSize: '0.85rem' }}>
            <i className="bi bi-download me-2"></i>Download PNG
          </button>
        </div>
      )}
    </div>
  );
};

// ==================== SIMPLE TEXT EDITOR ====================
const TextEditor = () => {
  const editorRef = useRef(null);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [saved, setSaved] = useState(false);

  const exec = (cmd, value = null) => {
    document.execCommand(cmd, false, value); // DOM manipulation
    editorRef.current?.focus();
  };

  const handleInput = () => {
    const text = editorRef.current?.innerText || '';
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    setWordCount(words.length);
    setCharCount(text.length);
    setSaved(false);
  };

  const handleSave = () => {
    const content = editorRef.current?.innerHTML || '';
    localStorage.setItem('smartbank_note', content);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLoad = () => {
    const saved = localStorage.getItem('smartbank_note');
    if (saved && editorRef.current) {
      editorRef.current.innerHTML = saved;
      handleInput();
    }
  };

  const toolbarBtn = (icon, cmd, val) => (
    <button key={cmd} type="button" onMouseDown={e => { e.preventDefault(); exec(cmd, val); }}
      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '0.35rem 0.6rem', color: '#8892b0', cursor: 'pointer', transition: 'all 0.15s' }}
      onMouseOver={e => { e.currentTarget.style.background = 'rgba(108,99,255,0.2)'; e.currentTarget.style.color = '#6c63ff'; }}
      onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#8892b0'; }}>
      <i className={`bi ${icon}`}></i>
    </button>
  );

  return (
    <div className="glass-card">
      <div className="d-flex align-items-center gap-2 mb-4">
        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(240,147,251,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>📝</div>
        <div>
          <h6 style={{ fontWeight: 700, margin: 0 }}>Smart Text Editor</h6>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#8892b0' }}>Rich text editor with local save</p>
        </div>
        <div className="ms-auto d-flex gap-2">
          <button onClick={handleLoad} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '0.4rem 0.8rem', color: '#8892b0', cursor: 'pointer', fontSize: '0.8rem' }}>
            <i className="bi bi-folder me-1"></i>Load
          </button>
          <button onClick={handleSave} style={{ background: saved ? 'rgba(107,203,119,0.2)' : 'rgba(108,99,255,0.2)', border: `1px solid ${saved ? '#6bcb77' : '#6c63ff'}`, borderRadius: 8, padding: '0.4rem 0.8rem', color: saved ? '#6bcb77' : '#6c63ff', cursor: 'pointer', fontSize: '0.8rem', transition: 'all 0.3s' }}>
            <i className={`bi ${saved ? 'bi-check-lg' : 'bi-save'} me-1`}></i>{saved ? 'Saved!' : 'Save'}
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px 10px 0 0', border: '1px solid rgba(255,255,255,0.08)', borderBottom: 'none' }}>
        {toolbarBtn('bi-type-bold', 'bold')}
        {toolbarBtn('bi-type-italic', 'italic')}
        {toolbarBtn('bi-type-underline', 'underline')}
        {toolbarBtn('bi-type-strikethrough', 'strikethrough')}
        <div style={{ width: 1, background: 'rgba(255,255,255,0.1)', margin: '0 4px' }}></div>
        {toolbarBtn('bi-text-left', 'justifyLeft')}
        {toolbarBtn('bi-text-center', 'justifyCenter')}
        {toolbarBtn('bi-text-right', 'justifyRight')}
        <div style={{ width: 1, background: 'rgba(255,255,255,0.1)', margin: '0 4px' }}></div>
        {toolbarBtn('bi-list-ul', 'insertUnorderedList')}
        {toolbarBtn('bi-list-ol', 'insertOrderedList')}
        {toolbarBtn('bi-arrow-counterclockwise', 'undo')}
        {toolbarBtn('bi-arrow-clockwise', 'redo')}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        id="text-editor-content"
        style={{
          minHeight: 200, padding: '1rem',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '0 0 10px 10px',
          color: '#f0f4ff', fontSize: '0.95rem', lineHeight: 1.6,
          outline: 'none'
        }}
        data-placeholder="Start typing your notes here..."
      ></div>

      {/* Status bar */}
      <div className="d-flex justify-content-end gap-4 mt-2" style={{ fontSize: '0.75rem', color: '#4a5568' }}>
        <span>Words: <strong style={{ color: '#8892b0' }}>{wordCount}</strong></span>
        <span>Characters: <strong style={{ color: '#8892b0' }}>{charCount}</strong></span>
      </div>
    </div>
  );
};

// ==================== MAIN TOOLS PAGE ====================
const ToolsPage = () => (
  <DashboardLayout title="Tools">
    <div className="mb-4">
      <h5 style={{ fontWeight: 700, margin: 0 }}>Banking Tools & Utilities</h5>
      <p style={{ color: '#8892b0', fontSize: '0.85rem', margin: 0 }}>Handy tools to enhance your banking experience</p>
    </div>
    <div className="row g-4 mb-4">
      <div className="col-lg-6"><WeatherWidget /></div>
      <div className="col-lg-6"><QRGenerator /></div>
    </div>
    <TextEditor />
  </DashboardLayout>
);

export default ToolsPage;
