import { useEffect, useState } from "react";

export default function Admin() {
  const [models, setModels] = useState({});
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedRepair, setSelectedRepair] = useState("");
  const [newModel, setNewModel] = useState("");
  const [newRepair, setNewRepair] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [editModelName, setEditModelName] = useState("");
  const [editRepairName, setEditRepairName] = useState("");
  const [editRepairPrice, setEditRepairPrice] = useState("");
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
  const REPO_OWNER = "onur846";
  const REPO_NAME = "fpfiyatpaneli";
  const FILE_PATH = "public/database.json";

  useEffect(() => {
    if (authenticated) fetchData();
  }, [authenticated]);

  const fetchData = async () => {
    const res = await fetch("/database.json");
    const data = await res.json();
    setModels(data);
  };

  const updateFile = async (updatedData) => {
    const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`);
    const json = await res.json();
    const sha = json.sha;

    await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Update database.json via admin panel",
        content: btoa(unescape(encodeURIComponent(JSON.stringify(updatedData, null, 2)))),
        sha,
      }),
    });
  };

  const handleLogin = () => {
    if (password === "Fp9097") {
      setAuthenticated(true);
    } else {
      alert("Şifre hatalı.");
    }
  };

  const handleAddModel = () => {
    if (!newModel.trim()) return;
    const updated = { ...models, [newModel.trim()]: {} };
    setModels(updated);
    updateFile(updated);
    setNewModel("");
  };

  const handleRenameModel = () => {
    if (!selectedModel || !editModelName.trim()) return;
    const updated = { ...models };
    updated[editModelName] = updated[selectedModel];
    delete updated[selectedModel];
    setModels(updated);
    updateFile(updated);
    setSelectedModel(editModelName);
    setEditModelName("");
  };

  const handleAddRepair = () => {
    if (!selectedModel || !newRepair.trim() || !newPrice) return;
    const updated = { ...models };
    updated[selectedModel][newRepair.trim()] = parseFloat(newPrice);
    setModels(updated);
    updateFile(updated);
    setNewRepair("");
    setNewPrice("");
  };

  const handleRenameRepair = () => {
    if (!selectedModel || !selectedRepair || !editRepairName.trim()) return;
    const updated = { ...models };
    updated[selectedModel][editRepairName.trim()] = updated[selectedModel][selectedRepair];
    delete updated[selectedModel][selectedRepair];
    setModels(updated);
    updateFile(updated);
    setEditRepairName("");
  };

  const handleUpdateRepairPrice = () => {
    if (!selectedModel || !selectedRepair || !editRepairPrice.trim()) return;
    const updated = { ...models };
    updated[selectedModel][selectedRepair] = parseFloat(editRepairPrice);
    setModels(updated);
    updateFile(updated);
    setEditRepairPrice("");
  };

  if (!authenticated) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Admin Girişi</h2>
        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Giriş Yap</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin Panel</h2>

      <div>
        <input value={newModel} onChange={(e) => setNewModel(e.target.value)} placeholder="Yeni model ismi" />
        <button onClick={handleAddModel}>Model Ekle</button>
      </div>

      <div>
        <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}>
          <option value="">Model Seç</option>
          {Object.keys(models).map((model) => (
            <option key={model}>{model}</option>
          ))}
        </select>

        {selectedModel && (
          <>
            <input
              value={editModelName}
              onChange={(e) => setEditModelName(e.target.value)}
              placeholder="Yeni model adı"
            />
            <button onClick={handleRenameModel}>Model Adını Güncelle</button>

            <div>
              <input
                value={newRepair}
                onChange={(e) => setNewRepair(e.target.value)}
                placeholder="Yeni işlem"
              />
              <input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="Fiyat"
              />
              <button onClick={handleAddRepair}>İşlem Ekle</button>
            </div>

            <div>
              <select value={selectedRepair} onChange={(e) => setSelectedRepair(e.target.value)}>
                <option value="">İşlem Seç</option>
                {Object.keys(models[selectedModel] || {}).map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>

              <input
                value={editRepairName}
                onChange={(e) => setEditRepairName(e.target.value)}
                placeholder="Yeni işlem adı"
              />
              <button onClick={handleRenameRepair}>İşlem Adını Güncelle</button>

              <input
                value={editRepairPrice}
                onChange={(e) => setEditRepairPrice(e.target.value)}
                placeholder="Yeni fiyat"
                type="number"
              />
              <button onClick={handleUpdateRepairPrice}>İşlem Fiyatını Güncelle</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
