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
        <iframe
          src={`https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(
            `https://hrm-ten-pi.vercel.app/api/files/83`
          )}&embedded=true`}
          width="100%"
          height="600px"
          style={{
            border: "none",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        ></iframe>
      </button>
    </div>
  );
}
