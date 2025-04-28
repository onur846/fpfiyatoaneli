
import { useState, useEffect } from "react";

export default function Home() {
  const [database, setDatabase] = useState({});
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedRepairs, setSelectedRepairs] = useState(Array(10).fill(''));

  useEffect(() => {
    fetch('/database.json')
      .then(res => res.json())
      .then(data => setDatabase(data));
  }, []);

  const handleModelChange = (e) => {
    setSelectedModel(e.target.value);
    setSelectedRepairs(Array(10).fill('')); // Model değişince işlemleri sıfırla
  };

  const handleRepairChange = (index, value) => {
    const newRepairs = [...selectedRepairs];
    newRepairs[index] = value;
    setSelectedRepairs(newRepairs);
  };

  const getPrice = (repairName) => {
    if (selectedModel && repairName && database[selectedModel]) {
      return database[selectedModel][repairName] || 0;
    }
    return 0;
  };

  const totalPriceWithoutKDV = selectedRepairs.reduce((acc, repair) => acc + getPrice(repair), 0);
  const totalPriceWithKDV = (totalPriceWithoutKDV * 1.2).toFixed(2);

  return (
    <div style={{ padding: 20 }}>
      <h1>FPPRO Arıza Fiyat Paneli</h1>

      {/* Müsvette kutusu */}
      <textarea
        rows="3"
        placeholder="Teknisyen Notu - Sadece not almak için (işlevsiz)"
        style={{ width: '100%', marginBottom: 20 }}
      />

      {/* Model Seçimi */}
      <select value={selectedModel} onChange={handleModelChange} style={{ width: '100%', padding: 10, marginBottom: 20 }}>
        <option value="">Model Seçiniz</option>
        {Object.keys(database).map((model, idx) => (
          <option key={idx} value={model}>{model}</option>
        ))}
      </select>

      {/* İşlem Seçimi - 10 kutu */}
      {Array(10).fill().map((_, index) => (
        <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
          <select
            value={selectedRepairs[index]}
            onChange={(e) => handleRepairChange(index, e.target.value)}
            style={{ flex: 2, marginRight: 10, padding: 8 }}
            disabled={!selectedModel}
          >
            <option value="">İşlem Seçiniz</option>
            {selectedModel && database[selectedModel] && Object.keys(database[selectedModel]).map((repair, idx) => (
              <option key={idx} value={repair}>{repair}</option>
            ))}
          </select>
          <div style={{ flex: 1 }}>
            {selectedRepairs[index] && (
              <>
                <div>KDV Hariç: {getPrice(selectedRepairs[index])} ₺</div>
                <div>KDV Dahil: {(getPrice(selectedRepairs[index]) * 1.2).toFixed(2)} ₺</div>
              </>
            )}
          </div>
        </div>
      ))}

      {/* Toplamlar */}
      <div style={{ marginTop: 30, fontWeight: 'bold', fontSize: '18px' }}>
        <div>Toplam KDV Hariç: {totalPriceWithoutKDV} ₺</div>
        <div>Toplam KDV Dahil: {totalPriceWithKDV} ₺</div>
      </div>
    </div>
  );
}
