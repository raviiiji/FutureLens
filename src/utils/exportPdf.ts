import jsPDF from "jspdf";
import "jspdf-autotable";

interface Scenario {
  id: number;
  title: string;
  description: string;
  riskLevel: string;
  growthPotential: number;
  timeline: { year: string; milestone: string }[];
  actions: string[];
}

export function exportDecisionPdf(question: string, summary: string, scenarios: Scenario[]) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header gradient bar
  doc.setFillColor(45, 190, 171);
  doc.rect(0, 0, pageWidth, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("FutureLens — Decision Report", 14, 18);

  // Question
  doc.setTextColor(30, 30, 50);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  const questionLines = doc.splitTextToSize(question, pageWidth - 28);
  doc.text(questionLines, 14, 42);
  let y = 42 + questionLines.length * 7;

  // Summary
  if (summary) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 100);
    const summaryLines = doc.splitTextToSize(summary, pageWidth - 28);
    doc.text(summaryLines, 14, y + 4);
    y += summaryLines.length * 5 + 10;
  }

  // Scenarios
  scenarios.forEach((s, i) => {
    if (y > 250) { doc.addPage(); y = 20; }

    doc.setFillColor(240, 248, 255);
    doc.roundedRect(10, y, pageWidth - 20, 10, 2, 2, "F");
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(45, 190, 171);
    doc.text(`Scenario ${i + 1}: ${s.title}`, 14, y + 7);
    y += 14;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 80);
    const descLines = doc.splitTextToSize(s.description, pageWidth - 28);
    doc.text(descLines, 14, y);
    y += descLines.length * 4.5 + 4;

    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 100, 120);
    doc.text(`Risk: ${s.riskLevel}  |  Growth Potential: ${s.growthPotential}%`, 14, y);
    y += 8;

    // Timeline table
    if (s.timeline.length > 0) {
      (doc as any).autoTable({
        startY: y,
        head: [["Year", "Milestone"]],
        body: s.timeline.map((t) => [t.year, t.milestone]),
        margin: { left: 14, right: 14 },
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [45, 190, 171], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 250, 255] },
        theme: "grid",
      });
      y = (doc as any).lastAutoTable.finalY + 6;
    }

    // Actions
    if (s.actions?.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(45, 190, 171);
      doc.text("Recommended Actions:", 14, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 80);
      s.actions.forEach((a, ai) => {
        if (y > 275) { doc.addPage(); y = 20; }
        const actionLines = doc.splitTextToSize(`${ai + 1}. ${a}`, pageWidth - 32);
        doc.text(actionLines, 18, y);
        y += actionLines.length * 4 + 2;
      });
      y += 6;
    }
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text(`FutureLens Decision Report — Page ${i}/${pageCount} — Generated ${new Date().toLocaleDateString()}`, 14, doc.internal.pageSize.getHeight() - 8);
  }

  doc.save(`FutureLens-decision-${Date.now()}.pdf`);
}
