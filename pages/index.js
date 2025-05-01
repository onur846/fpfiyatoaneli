import { useState, useEffect } from "react";

export default function Home() {
  const [data, setData] = useState({});
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedRepairs, setSelectedRepairs] = useState(Array(10).fill(""));

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
    const json = await res.json();
    setData(json);
  };

  const handleRepairChange = (index, value) => {
    const updated = [...selectedRepairs];
    updated[index] = value;
    setSelectedRepairs(updated);
  };

  const selectedPrices = selectedRepairs
    .map((repair) => data[selectedModel]?.[repair])
    .filter((p) => p !== undefined);

  const totalPrice = selectedPrices.reduce((acc, val) => acc + val, 0);
  const totalKdv = totalPrice * 1.2;

  return (
    <div style={{ padding: 20, backgroundColor: "#3a5a80", minHeight: "100vh", color: "#fff" }}>
      <img src="https://fpprotr.com/wp-content/uploads/2023/04/fppro-logo-symbol-white-nosubtitle.png" alt="Logo" style={{ width: 100, marginBottom: 20 }} />
      <h1>FPPRO Arıza Fiyat Paneli</h1>

      <div style={{ marginBottom: 20 }}>
        <label><strong>Model Seçiniz:</strong></label>
        <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}>
          <option value="">Model Seç</option>
          {Object.keys(data).map((model, idx) => (
            <option key={idx} value={model}>
              {model}
            </option>
          ))}
        </select>
      </div>

      {selectedModel && (
        <>
          {Array.from({ length: 10 }).map((_, idx) => (
            <div key={idx} style={{ marginBottom: 10 }}>
              <label>İşlem {idx + 1}:</label>
              <select
                value={selectedRepairs[idx]}
                onChange={(e) => handleRepairChange(idx, e.target.value)}
              >
                <option value="">İşlem Seç</option>
                {Object.keys(data[selectedModel] || {}).map((repair, i) => (
                  <option key={i} value={repair}>
                    {repair}
                  </option>
                ))}
              </select>
              {selectedRepairs[idx] && data[selectedModel]?.[selectedRepairs[idx]] && (
                <p>
                  <strong>
                    {data[selectedModel][selectedRepairs[idx]]}₺ (KDV Hariç) —{" "}
                    {(data[selectedModel][selectedRepairs[idx]] * 1.2).toFixed(2)}₺ (KDV Dahil)
                  </strong>
                </p>
              )}
            </div>
          ))}

          <hr />
          <h3>Toplam:</h3>
          <p>
            <strong>KDV Hariç:</strong> {totalPrice}₺
          </p>
          <p>
            <strong>KDV Dahil:</strong> {totalKdv.toFixed(2)}₺
          </p>
        </>
      )}
    </div>
  );
}
