import { useState, useEffect } from 'react';

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [trCihaz, setTrCihaz] = useState({});
  const [anakart, setAnakart] = useState({});
  const [model, setModel] = useState('');
  const [fiyat, setFiyat] = useState('');
  const [mode, setMode] = useState('trCihaz');

  const password = 'Fp9097'; // Admin şifresi

  useEffect(() => {
    if (authenticated) {
      fetch('/database.json')
        .then(res => res.json())
        .then(data => {
          setTrCihaz(data.trCihazFiyatlari || {});
          setAnakart(data.anakartFiyatlari || {});
        });
    }
  }, [authenticated]);

  const handleLogin = () => {
    if (passwordInput === password) {
      setAuthenticated(true);
    } else {
      alert('Yanlış şifre!');
    }
  };

  const handleAdd = () => {
    if (!model || !fiyat) {
      alert('Model ve fiyat girin!');
      return;
    }
    if (mode === 'trCihaz') {
      setTrCihaz(prev => ({ ...prev, [model]: parseFloat(fiyat) }));
    } else {
      setAnakart(prev => ({ ...prev, [model]: parseFloat(fiyat) }));
    }
    setModel('');
    setFiyat('');
  };

  const handleDelete = (mode, key) => {
    if (mode === 'trCihaz') {
      const temp = { ...trCihaz };
      delete temp[key];
      setTrCihaz(temp);
    } else {
      const temp = { ...anakart };
      delete temp[key];
      setAnakart(temp);
    }
  };

  const downloadJSON = () => {
    const data = {
      trCihazFiyatlari: trCihaz,
      anakartFiyatlari: anakart
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'database.json';
    link.click();
  };

  if (!authenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#3a5a80',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        color: 'white',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h1>Admin Girişi</h1>
        <input
          type="password"
          placeholder="Şifre"
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
          style={{
            padding: '10px',
            margin: '10px 0',
            borderRadius: '8px',
            border: 'none',
            fontSize: '16px'
          }}
        />
        <button
          onClick={handleLogin}
          style={{
            backgroundColor: '#5c8dbc',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Giriş Yap
        </button>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#3a5a80',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      padding: '20px'
    }}>
      <h1>Admin Paneli - Fiyat Yönetimi</h1>

      <div style={{ marginBottom: '20px' }}>
        <select value={mode} onChange={(e) => setMode(e.target.value)} style={{ marginRight: '10px', padding: '8px' }}>
          <option value="trCihaz">TR Cihazı Fiyatı</option>
          <option value="anakart">Anakart Fiyatı</option>
        </select>
        <input
          placeholder="Model"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          style={{ marginRight: '10px', padding: '8px' }}
        />
        <input
          placeholder="Fiyat"
          value={fiyat}
          onChange={(e) => setFiyat(e.target.value)}
          style={{ marginRight: '10px', padding: '8px' }}
        />
        <button
          onClick={handleAdd}
          style={{
            backgroundColor: '#5c8dbc',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Ekle
        </button>
      </div>

      <div>
        <h2>TR Cihazı Fiyatları</h2>
        <ul>
          {Object.entries(trCihaz).map(([key, val]) => (
            <li key={key}>
              {key}: {val}₺ 
              <button onClick={() => handleDelete('trCihaz', key)} style={{ marginLeft: '10px', padding: '5px', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '5px' }}>Sil</button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2>Anakart Fiyatları</h2>
        <ul>
          {Object.entries(anakart).map(([key, val]) => (
            <li key={key}>
              {key}: {val}₺ 
              <button onClick={() => handleDelete('anakart', key)} style={{ marginLeft: '10px', padding: '5px', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '5px' }}>Sil</button>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={downloadJSON}
        style={{
          marginTop: '30px',
          backgroundColor: '#4caf50',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '10px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        JSON İndir
      </button>
    </div>
  );
}
