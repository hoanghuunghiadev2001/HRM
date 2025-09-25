"use client";

export default function TestPage() {
  const handleDownload = async () => {
    const res = await fetch("/api/test");
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "output.docx";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-5">
      <button
        onClick={handleDownload}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Test Generate DOCX
      </button>
    </div>
  );
}
