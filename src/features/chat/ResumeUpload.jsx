import { useState } from "react";
import { useDispatch } from "react-redux";
import { uploadResume } from "./chatSlice";

import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import pdfjsWorker from "pdfjs-dist/legacy/build/pdf.worker?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default function ResumeUpload() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);

    try {
      const reader = new FileReader();
      reader.onload = async function () {
        const typedarray = new Uint8Array(this.result);
        const pdf = await pdfjsLib.getDocument(typedarray).promise;

        let textContent = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const text = await page.getTextContent();
          textContent += text.items.map((s) => s.str).join(" ") + " ";
        }

        // extract fields (basic regex)
        const nameMatch = textContent.match(/\b([A-Z][a-z]+(?: [A-Z][a-z]+)+)\b/); // first + last name
        const emailMatch = textContent.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/);
        const phoneMatch = textContent.match(/(\+?\d{1,3}[-.\s]?)?\d{10}\b/);
        console.log("emailMatch", emailMatch);
        console.log("phone match", phoneMatch);
        console.log("name match", nameMatch);
        const candidateData = {
          name: nameMatch ? nameMatch[0] : null,
          email: emailMatch ? emailMatch[0] : null,
          phone: phoneMatch ? phoneMatch[0] : null,
        };
        console.log("Extracted candidate data:", candidateData);
        dispatch(uploadResume(candidateData));
        setLoading(false);
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error("Resume parsing failed", err);
      setLoading(false);
    }
  };

  return (
    <div className="my-4">
      <label className="block mb-2 font-medium">Upload Resume (PDF only):</label>
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFile}
        className="block w-full text-sm text-gray-700 border border-gray-300 rounded-md cursor-pointer"
      />
      {loading && <p className="text-sm text-gray-500 mt-2">Parsing resume...</p>}
    </div>
  );
}



