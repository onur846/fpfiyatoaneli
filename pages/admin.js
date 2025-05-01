import { useState, useEffect } from "react";

export default function Admin() {
  const [models, setModels] = useState({});
  const [newModel, setNewModel] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [newRepair, setNewRepair] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [editModelName, setEditModelName] = useState("");
  const [editRepairName, setEditRepairName] = useState("");
  const [editRepairPrice, setEditRepairPrice] = useState("");

  useEffect(() => {
    fetchData();

    const socket = new WebSocket("wss://fpfiyatpaneli-production.up.railway.app/websocket");
    socket.onmessage = (event) => {
      if (event.data === "update") {
        fetchData();
      }
    };

    return () => socket.close();
  }, []);

  const fetchData = async () => {
    const res = await fetch("https://fpfiyatpaneli-production.up.railway.app/data");
    const data = await res.json();
    setModels(data);
  };

  const sendUpdate = async (data) => {
    await fetch("https://fpfiyatpaneli-production.up.railway.app/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  };

  const addModel = () => {
    if (!newModel.trim()) return;
    sendUpdate({ type: "addModel", model: newModel.trim() });
    setNewModel("");
  };

  const renameModel = () => {
    if (!selectedModel || !editModelName.trim()) return;
    sendUpdate({ type: "renameModel", oldModel: selectedModel, newModel: editModelName.trim() });
    setEditModelName("");
  };

  const deleteModel = () => {
    if (!selectedModel) return;
    sendUpdate({ type: "deleteModel", model: selectedModel });
    setSelectedModel("");
  };

  const addRepair = () => {
    if (!selectedModel || !newRepair.trim() || !newPrice) return;
    sendUpdate({ type: "addRepair", model: selectedModel, repair: newRepair.trim(), price: parseFloat(newPrice) });
    setNewRepair("");
    setNewPrice("");
  };

  const renameRepair = () => {
    if (!selectedModel || !editRepairName.trim()) return;
    sendUpdate({ type: "renameRepair", model: selectedModel, oldRepair: editRepairName.split("=>")[0], newRepair: editRepairName.split("=>")[1] });
    setEditRepairName("");
  };

  const updateRepairPrice = () => {
    if (!selectedModel || !editRepairPrice.trim()) return;
    const [repairName, price] = editRepairPrice.split("=>");
    sendUpdate({ type: "updateRepairPrice", model: selectedModel, repair: repairName, price: parseFloat(price) });
    setEditRepairPrice("");
  };

  const deleteRepair = (repairName) => {
    sendUpdate({ type: "deleteRepair", model: selectedModel, repair: repairName });
  };

  return (
    <div style={{ padding: 20, backgroundColor: "#3a5a80", minHeight: "100vh", color: "#fff" }}>
      <h1>FPPRO Admin Panel</h1>

      <div style={{ marginBottom: 20 }}>
        <h3>Yeni Model Ekle</h3>
        <input placeholder="Model adı" value={newModel} onChange={(e) => setNewModel(e.target.value)} />
        <button onClick={addModel}>Model Ekle</button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <h3>Model Seç</h3>
        <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}>
          <option value="">Model Seçiniz</option>
          {Object.keys(models).map((model, idx) => (
            <option key={idx} value={model}>
              {model}
            </option>
          ))}
        </select>
      </div>

      {selectedModel && (
        <>
          <div style={{ marginBottom: 20 }}>
            <h3>Model Adı Düzenle</h3>
            <input placeholder="Yeni model adı" value={editModelName} onChange={(e) => setEditModelName(e.target.value)} />
            <button onClick={renameModel}>Model Adını Değiştir</button>
          </div>

          <div style={{ marginBottom: 20 }}>
            <button onClick={deleteModel} style={{ backgroundColor: "red", color: "white" }}>
              Modeli Sil
            </button>
          </div>

          <div style={{ marginBottom: 20 }}>
            <h3>İşlem Ekle</h3>
            <input placeholder="İşlem adı" value={newRepair} onChange={(e) => setNewRepair(e.target.value)} />
            <input placeholder="Fiyat" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} />
            <button onClick={addRepair}>İşlem Ekle</button>
          </div>

          <div style={{ marginBottom: 20 }}>
            <h3>İşlem Adı Değiştir (EskiAd=>YeniAd)</h3>
            <input placeholder="Örn: Pil Değişimi=>Batarya Değişimi" value={editRepairName} onChange={(e) => setEditRepairName(e.target.value)} />
            <button onClick={renameRepair}>İşlem Adını Değiştir</button>
          </div>

          <div style={{ marginBottom: 20 }}>
            <h3>İşlem Fiyatı Değiştir (İşlemAdı=>YeniFiyat)</h3>
            <input placeholder="Örn: Pil Değişimi=>2500" value={editRepairPrice} onChange={(e) => setEditRepairPrice(e.target.value)} />
            <button onClick={updateRepairPrice}>İşlem Fiyatını Değiştir</button>
          </div>

          <div style={{ marginBottom: 20 }}>
            <h3>İşlemler</h3>
            {Object.keys(models[selectedModel]).map((repair, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span>
                  {repair} — {models[selectedModel][repair]}₺
                </span>
                <button onClick={() => deleteRepair(repair)} style={{ backgroundColor: "red", color: "white" }}>
                  Sil
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
