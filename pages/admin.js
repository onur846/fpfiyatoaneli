import { useState, useEffect } from "react";

export default function Admin() {
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [database, setDatabase] = useState({});
  const [newModel, setNewModel] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [newRepair, setNewRepair] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [selectedRepair, setSelectedRepair] = useState("");
  const [updatedPrice, setUpdatedPrice] = useState("");

  useEffect(() => {
    fetch('/database.json')
      .then(res => res.json())
      .then(data => setDatabase(data));
  }, []);

  const handleLogin = () => {
    if (password === "Fp9097") {
      setIsLoggedIn(true);
    } else {
      alert("Yanlış şifre!");
    }
  };

  const addModel = () => {
    if (!newModel.trim()) return;
    if (database[newModel]) {
      alert("Bu model zaten var!");
      return;
    }
    setDatabase(prev => ({ ...prev, [newModel]: {} }));
    setNewModel("");
  };

  const deleteModel = () => {
    if (!selectedModel) return;
    const updated = { ...database };
    delete updated[selectedModel];
    setDatabase(updated);
    setSelectedModel("");
  };

  const addRepair = () => {
    if (!selectedModel || !newRepair.trim() || !newPrice) return;
    setDatabase(prev => ({
      ...prev,
      [selectedModel]: {
        ...prev[selectedModel],
        [newRepair]: parseFloat(newPrice)
      }
    }));
    setNewRepair("");
    setNewPrice("");
  };

  const updateRepairPrice = () => {
    if (!selectedModel || !selectedRepair || !updatedPrice) return;
    setDatabase(prev => ({
      ...prev,
      [selectedModel]: {
        ...prev[selectedModel],
        [selectedRepair]: parseFloat(updatedPrice)
      }
    }));
    setSelectedRepair("");
    setUpdatedPrice("");
  };

  const deleteRepair = () => {
    if (!selectedModel || !selectedRepair) return;
    const updated = { ...database };
    delete updated[selectedModel][selectedRepair];
    setDatabase(updated);
    setSelectedRepair("");
  };

  const downloadJSON = () => {
    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(database, null, 2)], { type: "application/json" });
    element.href = URL.createObjectURL(file);
    element.download = "database.json";
    document.body.appendChild(element);
    element.click();
  };

  if (!isLoggedIn) {
    return (
      <div style={{ padding: 20 }}>
        <h1>Admin Girişi</h1>
        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: 10, marginBottom: 10 }}
        />
        <button onClick={handleLogin} style={{ padding: 10 }}>Giriş Yap</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>FPPRO Admin Panel</h1>

      <hr />

      {/* Yeni Model Ekle */}
      <h3>Yeni Model Ekle</h3>
      <input
        type="text"
        placeholder="Model Adı"
        value={newModel}
        onChange={(e) => setNewModel(e.target.value)}
        style={{ padding: 8, marginRight: 10 }}
      />
      <button onClick={addModel} style={{ padding: 8 }}>Model Ekle</button>

      <hr />

      {/* Mevcut Model Seç */}
      <h3>Model Seçimi</h3>
      <select
        value={selectedModel}
        onChange={(e) => setSelectedModel(e.target.value)}
        style={{ width: '100%', padding: 10 }}
      >
        <option value="">Model Seçiniz</option>
        {Object.keys(database).map((model, idx) => (
          <option key={idx} value={model}>{model}</option>
        ))}
      </select>

      {selectedModel && (
        <>
          {/* İşlem Ekle */}
          <h3>İşlem Ekle</h3>
          <input
            type="text"
            placeholder="İşlem Adı"
            value={newRepair}
            onChange={(e) => setNewRepair(e.target.value)}
            style={{ padding: 8, marginRight: 10 }}
          />
          <input
            type="number"
            placeholder="Fiyat (KDV Hariç)"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            style={{ padding: 8, marginRight: 10 }}
          />
          <button onClick={addRepair} style={{ padding: 8 }}>İşlem Ekle</button>

          {/* İşlem Seç */}
          <h3>İşlem Seç</h3>
          <select
            value={selectedRepair}
            onChange={(e) => setSelectedRepair(e.target.value)}
            style={{ width: '100%', padding: 10, marginTop: 10 }}
          >
            <option value="">İşlem Seçiniz</option>
            {database[selectedModel] && Object.keys(database[selectedModel]).map((repair, idx) => (
              <option key={idx} value={repair}>{repair}</option>
            ))}
          </select>

          {/* Fiyat Güncelle */}
          <h3>İşlem Fiyatı Güncelle</h3>
          <input
            type="number"
            placeholder="Yeni Fiyat (KDV Hariç)"
            value={updatedPrice}
            onChange={(e) => setUpdatedPrice(e.target.value)}
            style={{ padding: 8, marginRight: 10 }}
          />
          <button onClick={updateRepairPrice} style={{ padding: 8 }}>Fiyat Güncelle</button>

          {/* İşlem Sil */}
          <h3>İşlem Sil</h3>
          <button onClick={deleteRepair} style={{ padding: 8, backgroundColor: 'red', color: 'white' }}>İşlem Sil</button>

          {/* Model Sil */}
          <h3>Model Sil</h3>
          <button onClick={deleteModel} style={{ padding: 8, backgroundColor: 'darkred', color: 'white' }}>Model Sil</button>
        </>
      )}

      <hr />

      {/* JSON İndir */}
      <h3>Database.json İndir</h3>
      <button onClick={downloadJSON} style={{ padding: 10, backgroundColor: '#5c8dbc', color: 'white' }}>
        İndir
      </button>
    </div>
  );
}
