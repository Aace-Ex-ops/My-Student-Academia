// High-Performance University-Grade PDF Generator
// Powered by jsPDF & Semantic Print CSS Engines

import { jsPDF } from "jspdf";
import { CourseDocument } from "./courseMaterialsData";

export function generateCourseDocumentPDF(docData: CourseDocument): void {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  let yPos = margin;

  // ✦ INSTITUTIONAL HEADER & BRAND ACCENT ✦
  pdf.setFillColor(11, 10, 9); // Primary Charcoal/Obsidian
  pdf.rect(0, 0, pageWidth, 28, "F");

  pdf.setFillColor(255, 109, 31); // Solar Orange
  pdf.rect(0, 28, pageWidth, 2, "F");

  pdf.setTextColor(250, 243, 225); // Cream White
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text("MY STUDENT ACADEMIA", margin, 13);

  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(255, 109, 31);
  pdf.text("OFFICIAL ACCREDITED COURSEWARE & STUDY COMPENDIUM", margin, 20);

  pdf.setTextColor(180, 180, 190);
  pdf.setFontSize(8);
  pdf.text(`${docData.term} • Verification ID: MSA-${docData.courseCode}-${Date.now().toString(36).toUpperCase()}`, pageWidth - margin, 20, { align: "right" });

  yPos = 42;

  // ✦ COURSE TITLE BLOCK ✦
  pdf.setTextColor(255, 109, 31);
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.text(`[ ${docData.courseCode} ] ${docData.typeLabel.toUpperCase()}`, margin, yPos);
  yPos += 7;

  pdf.setTextColor(20, 20, 24);
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  const splitTitle = pdf.splitTextToSize(docData.title, contentWidth);
  pdf.text(splitTitle, margin, yPos);
  yPos += splitTitle.length * 8 + 4;

  // Metadata Panel Box
  pdf.setFillColor(245, 245, 248);
  pdf.setDrawColor(220, 220, 230);
  pdf.roundedRect(margin, yPos, contentWidth, 22, 3, 3, "FD");

  pdf.setFontSize(9);
  pdf.setTextColor(80, 80, 90);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Course: ${docData.courseTitle}`, margin + 5, yPos + 7);
  pdf.text(`Instructor: ${docData.author} (${docData.authorTitle})`, margin + 5, yPos + 13);
  pdf.text(`Access: Enrolled Student Licensed Copy • ${docData.lastUpdated}`, margin + 5, yPos + 19);

  pdf.text(`Pages: ~${docData.totalPages}`, pageWidth - margin - 5, yPos + 7, { align: "right" });
  pdf.text(`Size: ${docData.fileSize}`, pageWidth - margin - 5, yPos + 13, { align: "right" });
  pdf.text(`Format: Official PDF`, pageWidth - margin - 5, yPos + 19, { align: "right" });

  yPos += 30;

  // Summary Block
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(30, 30, 35);
  pdf.text("Executive Course Summary & Objectives:", margin, yPos);
  yPos += 6;

  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(60, 60, 70);
  const splitSummary = pdf.splitTextToSize(docData.summary, contentWidth);
  pdf.text(splitSummary, margin, yPos);
  yPos += splitSummary.length * 5 + 8;

  // Topics Covered Tags
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(255, 109, 31);
  pdf.text("Key Topics: " + docData.topicsCovered.join("  •  "), margin, yPos);
  yPos += 10;

  // Horizontal Rule
  pdf.setDrawColor(210, 210, 220);
  pdf.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // ✦ CHAPTER CONTENTS ✦
  docData.chapters.forEach((chap) => {
    // Check if we need a new page
    if (yPos > pageHeight - 50) {
      pdf.addPage();
      yPos = margin + 10;
    }

    // Chapter Header Box
    pdf.setFillColor(235, 238, 245);
    pdf.roundedRect(margin, yPos, contentWidth, 10, 2, 2, "F");
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(20, 25, 45);
    pdf.text(`Chapter ${chap.chapterNumber}: ${chap.title}`, margin + 4, yPos + 7);
    yPos += 16;

    // Key Takeaways Callout
    if (chap.keyTakeaways && chap.keyTakeaways.length > 0) {
      pdf.setFillColor(255, 248, 240);
      pdf.setDrawColor(255, 180, 120);
      pdf.roundedRect(margin, yPos, contentWidth, chap.keyTakeaways.length * 6 + 10, 2, 2, "FD");

      pdf.setFontSize(8);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(190, 75, 15);
      pdf.text("KEY THEORETICAL TAKEAWAYS:", margin + 4, yPos + 5);

      let tkY = yPos + 10;
      chap.keyTakeaways.forEach((tk) => {
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(60, 40, 20);
        const splitTk = pdf.splitTextToSize(`• ${tk}`, contentWidth - 10);
        pdf.text(splitTk, margin + 6, tkY);
        tkY += splitTk.length * 5;
      });

      yPos = tkY + 6;
    }

    // Chapter Body Text
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(40, 40, 45);
    
    // Clean markdown headings/symbols for clean PDF reading
    const cleanContent = chap.content
      .replace(/###/g, "")
      .replace(/##/g, "")
      .replace(/\*\*/g, "")
      .replace(/\$/g, "");

    const splitContent = pdf.splitTextToSize(cleanContent, contentWidth);
    
    // Print lines with page break checking
    splitContent.forEach((line: string) => {
      if (yPos > pageHeight - 25) {
        pdf.addPage();
        yPos = margin + 10;
      }
      pdf.text(line, margin, yPos);
      yPos += 4.5;
    });

    yPos += 6;

    // Formulas or Code Snippet Block
    if (chap.formulasOrCode) {
      if (yPos > pageHeight - 50) {
        pdf.addPage();
        yPos = margin + 10;
      }

      const codeLines = pdf.splitTextToSize(chap.formulasOrCode, contentWidth - 8);
      const boxHeight = codeLines.length * 4 + 8;

      pdf.setFillColor(24, 24, 28);
      pdf.roundedRect(margin, yPos, contentWidth, boxHeight, 2, 2, "F");

      pdf.setFont("courier", "normal");
      pdf.setFontSize(7.5);
      pdf.setTextColor(240, 240, 245);
      pdf.text(codeLines, margin + 4, yPos + 6);

      yPos += boxHeight + 10;
    }
  });

  // ✦ FOOTER ON ALL PAGES ✦
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(140, 140, 150);
    pdf.text(
      `My Student Academia • ${docData.courseCode} ${docData.title} • Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: "center" }
    );
  }

  // Trigger browser download
  const safeFilename = `${docData.courseCode}_${docData.type}_MyStudentAcademia.pdf`.replace(/[^a-zA-Z0-9_.-]/g, "_");
  pdf.save(safeFilename);
}

// ✦ HIGH-RESOLUTION BROWSER PRINT ENGINE ✦
// Allows students to view and print via native browser vector PDF dialog
export function printCourseDocument(docData: CourseDocument): void {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to open the printable document.");
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${docData.courseCode} - ${docData.title}</title>
      <style>
        @page {
          size: A4;
          margin: 1.5cm;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #1a1a1a;
          line-height: 1.6;
          margin: 0;
          padding: 20px;
        }
        .header {
          border-bottom: 3px solid #FF6D1F;
          padding-bottom: 15px;
          margin-bottom: 25px;
        }
        .institution {
          font-size: 20px;
          font-weight: 900;
          color: #0B0A09;
          letter-spacing: 0.5px;
        }
        .sub-inst {
          font-size: 11px;
          font-weight: 700;
          color: #FF6D1F;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .doc-title {
          font-size: 24px;
          font-weight: 800;
          color: #111;
          margin: 15px 0 5px 0;
        }
        .meta-box {
          background: #f7f7f9;
          border: 1px solid #e2e2e8;
          border-radius: 8px;
          padding: 12px 16px;
          margin-bottom: 20px;
          font-size: 12px;
          display: flex;
          justify-content: space-between;
        }
        .chapter {
          margin-top: 30px;
          page-break-inside: avoid;
        }
        .chapter-title {
          font-size: 16px;
          font-weight: 800;
          color: #1a1a24;
          background: #edf0f7;
          padding: 8px 12px;
          border-radius: 6px;
          margin-bottom: 12px;
        }
        .takeaways {
          background: #fff8f0;
          border-left: 4px solid #FF6D1F;
          padding: 10px 15px;
          margin-bottom: 15px;
          font-size: 13px;
        }
        .takeaways strong {
          color: #c44d0a;
          display: block;
          margin-bottom: 4px;
        }
        .takeaways ul {
          margin: 0;
          padding-left: 20px;
        }
        .content {
          font-size: 13.5px;
          color: #2d3748;
          white-space: pre-line;
        }
        pre {
          background: #181820;
          color: #f1f1f1;
          padding: 12px;
          border-radius: 6px;
          font-size: 12px;
          font-family: Consolas, Monaco, monospace;
          overflow-x: auto;
          page-break-inside: avoid;
        }
        .footer {
          margin-top: 40px;
          border-top: 1px solid #ddd;
          padding-top: 10px;
          font-size: 10px;
          color: #888;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="institution">MY STUDENT ACADEMIA</div>
        <div class="sub-inst">Official Accredited Courseware • ${docData.term}</div>
        <h1 class="doc-title">${docData.courseCode}: ${docData.title}</h1>
        <div style="font-size: 13px; color: #555;">${docData.courseTitle} • Instructor: <strong>${docData.author}</strong> (${docData.authorTitle})</div>
      </div>

      <div class="meta-box">
        <div>
          <div>Document Type: <strong>${docData.typeLabel}</strong></div>
          <div>Verification: <strong>Active Enrolled Student Copy</strong></div>
        </div>
        <div style="text-align: right;">
          <div>Format: <strong>High-Res Vector PDF</strong></div>
          <div>Estimated Length: <strong>${docData.totalPages} Pages</strong></div>
        </div>
      </div>

      <div style="font-size: 13px; color: #444; margin-bottom: 20px;">
        <strong>Executive Summary:</strong> ${docData.summary}
      </div>

      ${docData.chapters
        .map(
          (c) => `
        <div class="chapter">
          <div class="chapter-title">Chapter ${c.chapterNumber}: ${c.title}</div>
          ${
            c.keyTakeaways && c.keyTakeaways.length > 0
              ? `
            <div class="takeaways">
              <strong>Key Takeaways:</strong>
              <ul>
                ${c.keyTakeaways.map((t) => `<li>${t}</li>`).join("")}
              </ul>
            </div>
          `
              : ""
          }
          <div class="content">${c.content}</div>
          ${c.formulasOrCode ? `<pre>${c.formulasOrCode}</pre>` : ""}
        </div>
      `
        )
        .join("")}

      <div class="footer">
        © 2026 My Student Academia Ecosystem • Confidential & Authorized for Enrolled Students Only.
      </div>

      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
