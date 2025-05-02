import { useState, useEffect } from "react";

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");

  const [models, setModels] = useState({});
  const [selectedModel, setSelectedModel] = useState("");
  const [newModel, setNewModel] = useState("");
  const [newRepairName, setNewRepairName] = useState("");
  const [newRepairPrice, setNewRepairPrice] = useState("");
  const [editModelName, setEditModelName] = useState("");
  const [editRepairName, setEditRepairName] = useState("");
  const [editRepairNewName, setEditRepairNewName] = useState("");
  const [editRepairPrice, setEditRepairPrice] = useState("");

  const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
  const owner = "onur846";
  const repo = "fpfiyatpaneli";
  const path = "public/database.json";

  useEffect(() => {
    if (authenticated) {
      fetch("/database.json")
        .then((res) => res.json())
        .then((data) => setModels(data));
    }
  }, [authenticated]);

  const updateGitHubFile = async (updatedData) => {
    const getRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      headers: {
        Authorization: `token ${token}`,
      },
    });
    const file = await getRes.json();

    await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      method: "PUT",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Update database.json",
        content: btoa(unescape(encodeURIComponent(JSON.stringify(updatedData, null, 2)))),
        sha: file.sha,
      }),
    });

    setModels(updatedData);
  };

  const addModel = () => {
    if (!newModel.trim()) return;
    const updated = { ...models, [newModel]: {} };
    updateGitHubFile(updated);
    setNewModel("");
  };

  const renameModel = () => {
    if (!selectedModel || !editModelName.trim()) return;
    const updated = { ...models };
    updated[editModelName] = updated[selectedModel];
    delete updated[selectedModel];
    updateGitHubFile(updated);
    setSelectedModel(editModelName);
    setEditModelName("");
  };

  const addRepair = () => {
    if (!selectedModel || !newRepairName.trim() || !newRepairPrice) return;
    const updated = { ...models };
    const currentRepairs = updated[selectedModel];
    const newRepairs = { [newRepairName]: parseFloat(newRepairPrice), ...currentRepairs }; // yeni işlem en üste
    updated[selectedModel] = newRepairs;
    updateGitHubFile(updated);
    setNewRepairName("");
    setNewRepairPrice("");
  };

  const renameRepair = () => {
    if (!selectedModel || !editRepairName || !editRepairNewName) return;
    const updated = { ...models };
    const currentRepairs = updated[selectedModel];
    const entries = Object.entries(currentRepairs).map(([key, val]) => {
      if (key === editRepairName) return [editRepairNewName, val];
      return [key, val];
    });
    updated[selectedModel] = Object.fromEntries(entries);
    updateGitHubFile(updated);
    setEditRepairName("");
    setEditRepairNewName("");
  };

  const updateRepairPrice = () => {
    if (!selectedModel || !editRepairName || !editRepairPrice) return;
    const updated = { ...models };
    updated[selectedModel][editRepairName] = parseFloat(editRepairPrice);
    updateGitHubFile(updated);
    setEditRepairName("");
    setEditRepairPrice("");
  };

  if (!authenticated) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Admin Panel Girişi</h2>
        <input
          type="password"
          placeholder="Şifre: Fp9097"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginRight: 10 }}
        />
        <button onClick={() => {
          if (password === "Fp9097") {
            setAuthenticated(true);
          } else {
            alert("Şifre yanlış.");
          }
        }}>
          Giriş Yap
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin Panel (Şifreli)</h1>

      <h3>Model Seç</h3>
      <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}>
        <option value="">Model Seç</option>
        {Object.keys(models).map((m, i) => (
          <option key={i} value={m}>{m}</option>
        ))}
      </select>

      <h3>Yeni Model Ekle</h3>
      <input value={newModel} onChange={(e) => setNewModel(e.target.value)} placeholder="Yeni model adı" />
      <button onClick={addModel}>Model Ekle</button>

      <h3>Model İsmi Değiştir</h3>
      <input value={editModelName} onChange={(e) => setEditModelName(e.target.value)} placeholder="Yeni model adı" />
      <button onClick={renameModel}>Model Adını Güncelle</button>

      {selectedModel && (
        <>
          <h3>İşlem Ekle</h3>
          <input value={newRepairName} onChange={(e) => setNewRepairName(e.target.value)} placeholder="İşlem adı" />
          <input value={newRepairPrice} onChange={(e) => setNewRepairPrice(e.target.value)} placeholder="Fiyat" type="number" />
          <button onClick={addRepair}>Ekle</button>

          <h3>İşlem Adını Değiştir</h3>
          <select value={editRepairName} onChange={(e) => setEditRepairName(e.target.value)}>
            <option value="">İşlem Seç</option>
            {Object.keys(models[selectedModel]).map((r, i) => (
              <option key={i} value={r}>{r}</option>
            ))}
          </select>
          <input value={editRepairNewName} onChange={(e) => setEditRepairNewName(e.target.value)} placeholder="Yeni işlem adı" />
          <button onClick={renameRepair}>İşlem Adını Güncelle</button>

          <h3>İşlem Fiyatını Değiştir</h3>
          <select value={editRepairName} onChange={(e) => setEditRepairName(e.target.value)}>
            <option value="">İşlem Seç</option>
            {Object.keys(models[selectedModel]).map((r, i) => (
              <option key={i} value={r}>{r}</option>
            ))}
          </select>
          <input value={editRepairPrice} onChange={(e) => setEditRepairPrice(e.target.value)} placeholder="Yeni fiyat" type="number" />
          <button onClick={updateRepairPrice}>Fiyatı Güncelle</button>
        </>
      )}
    </div>
  );
}
