import { useState, useEffect } from 'react';

export default function Admin() {
  const [trCihaz, setTrCihaz] = useState({});
  const [anakart, setAnakart] = useState({});
  const [model, setModel] = useState('');
  const [fiyat, setFiyat] = useState('');
  const [mode, setMode] = useState('trCihaz');

  useEffect(() => {
    fetch('/database.json')
      .then(res => res.json())
      .then(data => {
        setTrCihaz(data.trCihazFiyatlari || {});
        setAnakart(data.anakartFiyatlari || {});
      });
  }, []);

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

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin Paneli - TR Cihazı & Anakart Fiyatları</h1>
      <div style={{ marginBottom: 20 }}>
        <select value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="trCihaz">TR Cihazı Fiyatı</option>
          <option value="anakart">Anakart Fiyatı</option>
        </select>
        <input
          placeholder="Model"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          style={{ marginLeft: 10 }}
        />
        <input
          placeholder="Fiyat"
          value={fiyat}
          onChange={(e) => setFiyat(e.target.value)}
          style={{ marginLeft: 10 }}
        />
        <button onClick={handleAdd} style={{ marginLeft: 10 }}>Ekle</button>
      </div>

      <div>
        <h2>TR Cihazı Fiyatları</h2>
        <ul>
          {Object.entries(trCihaz).map(([key, val]) => (
            <li key={key}>
              {key}: {val}₺ 
              <button onClick={() => handleDelete('trCihaz', key)} style={{ marginLeft: 10 }}>Sil</button>
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
              <button onClick={() => handleDelete('anakart', key)} style={{ marginLeft: 10 }}>Sil</button>
            </li>
          ))}
        </ul>
      </div>

      <button onClick={downloadJSON} style={{ marginTop: 20 }}>JSON İndir</button>
    </div>
  );
}
