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
    const model = e.target.value;
    setSelectedModel(model);
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
    <div style={{ padding: '20px', backgroundColor: '#2471A3', minHeight: '100vh', color: 'white', fontFamily: 'Arial' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <img src="https://fpprotr.com/wp-content/uploads/2023/04/fppro-logo-symbol-white-nosubtitle.png" alt="FPPRO Logo" style={{ width: '80px' }} />
        <h1>FPPRO Arıza Fiyat Paneli</h1>
      </div>

      {/* Teknisyen Notu (işlevsiz müsvette) */}
      <textarea
        rows="3"
        placeholder="Teknisyen Notu - (İşlevsiz, sadece müsvette)"
        style={{ width: '100%', marginBottom: '20px', padding: '10px', borderRadius: '8px' }}
      />

      {/* Model Seçimi */}
      <select
        value={selectedModel}
        onChange={handleModelChange}
        style={{ width: '100%', marginBottom: '20px', padding: '10px', borderRadius: '8px' }}
      >
        <option value="">Model Seçiniz</option>
        {Object.keys(database).map((model, idx) => (
          <option key={idx} value={model}>{model}</option>
        ))}
      </select>

      {/* İşlem Seçimi - 10 adet */}
      {Array.from({ length: 10 }).map((_, idx) => (
        <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
          <select
            value={selectedRepairs[idx]}
            onChange={(e) => handleRepairChange(idx, e.target.value)}
            style={{ flex: 2, marginRight: '10px', padding: '8px', borderRadius: '8px' }}
            disabled={!selectedModel}
          >
            <option value="">İşlem Seçiniz</option>
            {selectedModel && database[selectedModel] && Object.keys(database[selectedModel]).map((repair, rIdx) => (
              <option key={rIdx} value={repair}>{repair}</option>
            ))}
          </select>
          <div style={{ flex: 1 }}>
            {selectedRepairs[idx] && (
              <>
                <div style={{ fontSize: '14px' }}>KDV Hariç: {getPrice(selectedRepairs[idx])} ₺</div>
                <div style={{ fontSize: '14px' }}>KDV Dahil: {(getPrice(selectedRepairs[idx]) * 1.2).toFixed(2)} ₺</div>
              </>
            )}
          </div>
        </div>
      ))}

      {/* Toplamlar */}
      <div style={{ marginTop: '30px', fontWeight: 'bold', fontSize: '18px', textAlign: 'center' }}>
        <div>Toplam KDV Hariç: {totalPriceWithoutKDV} ₺</div>
        <div>Toplam KDV Dahil: {totalPriceWithKDV} ₺</div>
      </div>
    </div>
  );
}
