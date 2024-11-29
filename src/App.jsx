import { useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
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
        "https://backend-bg5w7eag1-chaddys-projects.vercel.app/api/upload",
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
  const handleEditChange = (section, index, key, value) => {
    setOutput((prev) => {
      const updated = { ...prev };
      if (section === "solutionBOQ" || section === "optionalItems") {
        updated[section][index][key] = value;
      }
      return updated;
    });
  };

  const generatePDF = () => {
    const previewElement = document.querySelector(".content"); // Select the preview section
    if (!previewElement) return;

    const doc = new jsPDF("p", "mm", "a4"); // Portrait mode, mm units, A4 size

    // Use the `html` method to convert the content directly into the PDF
    doc.html(previewElement, {
      callback: function (doc) {
        doc.save("Preview.pdf"); // Save the PDF with selectable text
      },
      x: 10, // Horizontal offset
      y: 10, // Vertical offset
      html2canvas: {
        scale: 0.2, // Adjust scale for better rendering
        width: 200,
      },
    });
  };

  const renderEditableTable = (data, sectionName) => {
    return (
      <div>
        <h3>{sectionName}</h3>
        <table>
          <thead>
            <tr>
              {Object.keys(data[0]).map((key) => (
                <th key={key}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                {Object.keys(item).map((key) => (
                  <td key={key}>
                    <input
                      type="text"
                      value={item[key] || ""}
                      onChange={(e) =>
                        handleEditChange(
                          sectionName,
                          index,
                          key,
                          e.target.value
                        )
                      }
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

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
      {output && (
        <button className="create-pdf-button" onClick={generatePDF}>
          Create PDF
        </button>
      )}
    </div>
  );
}

export default App;
