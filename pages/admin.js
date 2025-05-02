import { useState, useEffect } from "react";

const GITHUB_REPO = "onur846/fpfiyatpaneli"; // kendi repo adın
const FILE_PATH = "public/database.json";
const GITHUB_TOKEN = "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"; // kendi tokenin
const ADMIN_PASSWORD = "Fp9097";

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");

  const [data, setData] = useState({});
  const [selectedModel, setSelectedModel] = useState("");
  const [newModel, setNewModel] = useState("");
  const [newRepair, setNewRepair] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [renameModelName, setRenameModelName] = useState("");
  const [renameRepairText, setRenameRepairText] = useState("");

  useEffect(() => {
    if (!authenticated) return;
    fetch(`https://raw.githubusercontent.com/${GITHUB_REPO}/main/${FILE_PATH}`)
      .then((res) => res.json())
      .then((json) => setData(json));
  }, [authenticated]);

  const commitToGitHub = async (newData) => {
    const apiUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`;
    const getFile = await fetch(apiUrl, {
      headers: { Authorization: `token ${GITHUB_TOKEN}` },
    });
    const fileInfo = await getFile.json();

    await fetch(apiUrl, {
      method: "PUT",
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Admin panel güncelleme",
        content: btoa(unescape(encodeURIComponent(JSON.stringify(newData, null, 2)))),
        sha: fileInfo.sha,
      }),
    });
    alert("Güncelleme GitHub'a yüklendi.");
  };

  const addModel = () => {
    if (!newModel.trim()) return;
    const updated = { ...data, [newModel]: {} };
    setData(updated);
    commitToGitHub(updated);
    setNewModel("");
  };

  const addRepair = () => {
    if (!selectedModel || !newRepair.trim() || !newPrice) return;
    const updated = {
      ...data,
      [selectedModel]: {
        ...data[selectedModel],
        [newRepair]: parseFloat(newPrice),
      },
    };
    setData(updated);
    commitToGitHub(updated);
    setNewRepair("");
    setNewPrice("");
  };

  const renameModel = () => {
    if (!selectedModel || !renameModelName.trim()) return;
    const updated = { ...data };
    updated[renameModelName] = updated[selectedModel];
    delete updated[selectedModel];
    setData(updated);
    commitToGitHub(updated);
    setRenameModelName("");
    setSelectedModel(renameModelName);
  };

  const renameRepair = () => {
    const [oldName, newName] = renameRepairText.split("=>").map((s) => s.trim());
    if (!selectedModel || !oldName || !newName) return;
    const updated = { ...data };
    if (updated[selectedModel][oldName]) {
      updated[selectedModel][newName] = updated[selectedModel][oldName];
      delete updated[selectedModel][oldName];
      setData(updated);
      commitToGitHub(updated);
      setRenameRepairText("");
    }
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
        <button onClick={() => setAuthenticated(password === ADMIN_PASSWORD)}>Giriş Yap</button>
        {password && password !== ADMIN_PASSWORD && <p style={{ color: "red" }}>Şifre yanlış</p>}
      </div>
    );
  }

  return (
    <div style={{ padding: 20, backgroundColor: "#2d3e50", minHeight: "100vh", color: "#fff" }}>
      <h1>FPPRO Admin Panel</h1>

      <div>
        <input placeholder="Yeni model" value={newModel} onChange={(e) => setNewModel(e.target.value)} />
        <button onClick={addModel}>Model Ekle</button>
      </div>

      <div style={{ marginTop: 20 }}>
        <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}>
          <option value="">Model Seç</option>
          {Object.keys(data).map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
      </div>

      {selectedModel && (
        <>
          <div style={{ marginTop: 10 }}>
            <input
              placeholder="Model adını değiştir"
              value={renameModelName}
              onChange={(e) => setRenameModelName(e.target.value)}
            />
            <button onClick={renameModel}>Model Adı Değiştir</button>
          </div>

          <div style={{ marginTop: 10 }}>
            <input
              placeholder="İşlem adı => Yeni ad"
              value={renameRepairText}
              onChange={(e) => setRenameRepairText(e.target.value)}
            />
            <button onClick={renameRepair}>İşlem Adı Değiştir</button>
          </div>

          <div style={{ marginTop: 10 }}>
            <input
              placeholder="Yeni işlem"
              value={newRepair}
              onChange={(e) => setNewRepair(e.target.value)}
            />
            <input
              placeholder="Fiyat"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              type="number"
            />
            <button onClick={addRepair}>İşlem Ekle</button>
          </div>

          <div style={{ marginTop: 20 }}>
            <h3>{selectedModel} İşlemleri</h3>
            <ul>
              {Object.entries(data[selectedModel] || {}).map(([repair, price]) => (
                <li key={repair}>
                  {repair} — {price}₺
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
