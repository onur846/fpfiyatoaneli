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
    <div style={{ padding: 20 }}>
      <h1>FPPRO Arıza Fiyat Paneli</h1>
      <textarea
        rows="5"
        placeholder="Teknisyen Notu Yapıştırın..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
        style={{ width: '100%', marginBottom: 10 }}
      />
      <button onClick={calculate} style={{ width: '100%', padding: 10, marginBottom: 20 }}>Fiyatları Hesapla</button>

      {prices.length > 0 && (
        <table border="1" style={{ width: '100%', textAlign: 'center' }}>
          <thead>
            <tr>
              <th>Model</th>
              <th>İşlem</th>
              <th>Fiyat (KDV Hariç)</th>
              <th>Fiyat (KDV Dahil)</th>
            </tr>
          </thead>
          <tbody>
            {prices.map((p, i) => (
              <tr key={i}>
                <td>{p.model}</td>
                <td>{p.islem}</td>
                <td>{p.fiyat}₺</td>
                <td>{(p.fiyat * 1.2).toFixed(2)}₺</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
