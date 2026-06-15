import "../../style/pdf.css";
import React from "react";
import ax from '../../icons/a.png'
import ax2 from '../../icons/z2.png'
import f from '../../icons/f.jpg'
// آیکون بر اساس نوع فایل
const getFileIcon = (fileType, fileUrl) => {
  if (fileType === "application/pdf") {
    return (
      <a href={fileUrl} download>
        <div className="divAx">
          <img src={ax} alt="دانلود PDF" />
        </div>
      </a>
    );
  }

  if (fileType && (fileType.includes("zip") || fileType.includes("rar"))) {
    return (
      <a href={fileUrl} download>
        <div className="divAx">
          <img src={ax2} alt="دانلود فایل فشرده" />
        </div>
      </a>
    );
  }

  return (
    <a href={fileUrl} download>
      <div className="divAx">
        <img src={f} alt="دانلود فایل" />
      </div>
    </a>
  );
};

const getSafeFileName = (originalName, fileName, defaultName = "file") => {
  if (originalName && typeof originalName === "string" && originalName.trim() !== "") {
    return originalName;
  }
  if (fileName && typeof fileName === "string" && fileName.trim() !== "") {
    return fileName;
  }
  return defaultName;
};
const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 B";
  if (bytes == null || isNaN(bytes)) return "-";

  const units = ["B", "KB", "MB", "GB", "TB"];

  const i = Math.floor(Math.log(bytes) / Math.log(1024)); // واحد
  const size = bytes / Math.pow(1024, i);

  const formatted = size.toFixed(size < 10 ? 2 : 1); // مثل کدی که دادم
  return `${formatted} ${units[i]}`;
}
export default function FileDownloadItem({
  fileUrl,
  fileName,
  fileSize,
  fileSizeLabel,
  fileType,
  originalName,
  className = "",
  onClick,
}) {
  const handleDownload = () => {
    fetch(fileUrl)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = getSafeFileName(originalName, fileName, "file");
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      });
  };
  
  console.log("FileDownloadItem props:", { originalName, fileName });

  const safeFileName = getSafeFileName(originalName, fileName, "unknown_file");
  const icon = getFileIcon(fileType);

  return (
    <div style={{paddingBottom:'0px'}}
      className={`file-item ${className}`}
      role="button"
      tabIndex={0}
      title={safeFileName}
      onClick={handleDownload}
    >
      <span style={{ color: 'white', fontSize: '10px' }}>
        {fileSize != null ? formatFileSize(fileSize) : "ثثث"}
      </span>

      <div className="file-item__meta">
        <div className="file-item__name">{safeFileName}</div>
        {fileSizeLabel ? <div className="file-item__size">{fileSizeLabel}</div> : null}
      </div>
      {/* <div className="file-item__action">↓</div> */}
      <div className="file-item__icon" >{icon}</div>

    </div>
  );
}
