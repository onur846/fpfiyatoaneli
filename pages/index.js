import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Home() {
  const [note, setNote] = useState('');
  const [prices, setPrices] = useState([]);
  const [trAnakartData, setTrAnakartData] = useState({ trCihazFiyatlari: {}, anakartFiyatlari: {} });

  useEffect(() => {
    fetch('/database.json')
      .then(res => res.json())
      .then(data => setTrAnakartData(data));
  }, []);

  const calculate = async () => {
    const res = await axios.get('/api/fiyatlar');
    const fiyatlar = res.data;

    const noteLower = note.toLowerCase();
    const found = [];

    Object.entries(fiyatlar).forEach(([model, islemler]) => {
      Object.entries(islemler).forEach(([islem, fiyat]) => {
        if (noteLower.includes(model.toLowerCase()) && noteLower.includes(islem.toLowerCase())) {
          found.push({ model, islem, fiyat });
        }
      });
    });

    Object.entries(trAnakartData.trCihazFiyatlari).forEach(([model, fiyat]) => {
      if (noteLower.includes(model.toLowerCase()) && (noteLower.includes('full') || noteLower.includes('aşırı'))) {
        found.push({ model, islem: 'TR Cihazı Full Fiyatı', fiyat });
      }
    });

    Object.entries(trAnakartData.anakartFiyatlari).forEach(([model, fiyat]) => {
      if (noteLower.includes(model.toLowerCase()) && (noteLower.includes('anakart') || noteLower.includes('kart'))) {
        found.push({ model, islem: 'Anakart Onarım', fiyat });
      }
    });

    setPrices(found);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#3a5a80',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ marginBottom: '20px' }}>FPPRO Arıza Fiyat Paneli</h1>

      <textarea
        rows="6"
        placeholder="Teknisyen Notunu Yapıştırın..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
        style={{
          width: '100%',
          maxWidth: '600px',
          padding: '10px',
          borderRadius: '10px',
          border: 'none',
          marginBottom: '20px',
          fontSize: '16px'
        }}
      />

      <button
        onClick={calculate}
        style={{
          backgroundColor: '#5c8dbc',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '10px',
          cursor: 'pointer',
          fontSize: '18px',
          marginBottom: '30px'
        }}
      >
        Fiyatları Hesapla
      </button>

      {prices.length > 0 && (
        <table style={{
          width: '100%',
          maxWidth: '800px',
          borderCollapse: 'collapse',
          backgroundColor: 'white',
          color: 'black',
          borderRadius: '10px',
          overflow: 'hidden'
        }}>
          <thead style={{ backgroundColor: '#5c8dbc', color: 'white' }}>
            <tr>
              <th style={{ padding: '10px' }}>Model</th>
              <th style={{ padding: '10px' }}>İşlem</th>
              <th style={{ padding: '10px' }}>Fiyat (KDV Hariç)</th>
              <th style={{ padding: '10px' }}>Fiyat (KDV Dahil)</th>
            </tr>
          </thead>
          <tbody>
            {prices.map((p, i) => (
              <tr key={i}>
                <td style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>{p.model}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>{p.islem}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>{p.fiyat}₺</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>{(p.fiyat * 1.2).toFixed(2)}₺</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
