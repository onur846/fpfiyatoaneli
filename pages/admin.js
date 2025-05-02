import { useState, useEffect } from "react";

const GITHUB_OWNER = "onur846";
const GITHUB_REPO = "fpfiyatpaneli";
const GITHUB_FILE_PATH = "public/database.json";
const GITHUB_TOKEN = "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";

export default function Admin() {
  const [models, setModels] = useState({});
  const [selectedModel, setSelectedModel] = useState("");
  const [newModel, setNewModel] = useState("");
  const [newRepair, setNewRepair] = useState("");
  const [newPrice, setNewPrice] = useState("");

  useEffect(() => {
    fetchRawJson();
  }, []);

  const fetchRawJson = async () => {
    const res = await fetch(`https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main/${GITHUB_FILE_PATH}`);
    const json = await res.json();
    setModels(json);
  };

  const updateGitHubFile = async (updatedData) => {
    const getShaRes = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`, {
      headers: { Authorization: `token ${GITHUB_TOKEN}` },
    });
    const { sha } = await getShaRes.json();

    const content = btoa(unescape(encodeURIComponent(JSON.stringify(updatedData, null, 2))));

    await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`, {
      method: "PUT",
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Admin panelden otomatik güncelleme",
        content,
        sha,
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

  const addRepair = () => {
    if (!selectedModel || !newRepair.trim() || !newPrice) return;
    const updated = {
      ...models,
      [selectedModel]: {
        ...models[selectedModel],
        [newRepair]: parseFloat(newPrice),
      },
    };
    updateGitHubFile(updated);
    setNewRepair("");
    setNewPrice("");
  };

  const deleteRepair = (repair) => {
    const updated = { ...models };
    delete updated[selectedModel][repair];
    updateGitHubFile(updated);
  };

  return (
    <div style={{ padding: 20, backgroundColor: "#3a5a80", color: "#fff", minHeight: "100vh" }}>
      <h1>FPPRO Admin Panel (GitHub)</h1>

      <div>
        <input placeholder="Yeni Model Adı" value={newModel} onChange={(e) => setNewModel(e.target.value)} />
        <button onClick={addModel}>Model Ekle</button>
      </div>

      <div>
        <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}>
          <option value="">Model Seç</option>
          {Object.keys(models).map((model, idx) => (
            <option key={idx} value={model}>{model}</option>
          ))}
        </select>
      </div>

      {selectedModel && (
        <>
          <div>
            <input placeholder="İşlem Adı" value={newRepair} onChange={(e) => setNewRepair(e.target.value)} />
            <input placeholder="Fiyat" type="number" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} />
            <button onClick={addRepair}>İşlem Ekle</button>
          </div>

          <div>
            <h3>{selectedModel} İşlemleri</h3>
            {Object.entries(models[selectedModel]).map(([repair, price], idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{repair}: {price}₺</span>
                <button onClick={() => deleteRepair(repair)} style={{ color: "white", backgroundColor: "red" }}>Sil</button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
