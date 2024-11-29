import { useState } from "react";
import axios from "axios";
import Preview from "./components/Preview";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [output, setOutput] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileInput = (e) => {
    setFile(e.target.files[0]);
    setOutput(null);
    setError(null);
  };

  const handleInput = async () => {
    setLoading(true);
    setError(null);

    if (!file) {
      setError("Please select a file first.");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        "https://back-ten-gilt.vercel.app/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      let theData = response.data;

      if (theData) {
        setOutput(JSON.parse(theData));
      }
    } catch (err) {
      setError("Error uploading file. Please try again.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };
  console.log(output);

  return (
    <div className="main-container">
      <div className="title">
        <h1>SLT PDF Generator</h1>
      </div>
      <div className="input-field">
        <label htmlFor="file-input" className="file-label">
          Choose File
          <input
            id="file-input"
            className="file-input"
            onChange={handleFileInput}
            type="file"
            accept=".xlsx, .xls"
          />
        </label>
      </div>
      <button onClick={handleInput} disabled={loading}>
        {loading ? "Loading..." : "Generate Data"}
      </button>
      {error && <p className="error">{error}</p>}
      <section className="preview">
        {output ? (
          <Preview initialData={output} setOutput={setOutput} />
        ) : (
          <p className="content">No data available. Please upload a file.</p>
        )}
      </section>
    </div>
  );
}

export default App;
