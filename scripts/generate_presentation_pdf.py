"""
Generate a publication-quality PDF from PROJECT_PRESENTATION_FULL.md
Uses ReportLab with custom Himalayan Emerald styling, clean tables, callouts, and page numbers.
"""

import re
from pathlib import Path
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

BASE_DIR = Path(__file__).resolve().parent.parent
MD_PATH = BASE_DIR / "PROJECT_PRESENTATION_FULL.md"
PDF_PATH = BASE_DIR / "Discovery_Uttarakhand_Complete_Presentation.pdf"

# ── Color Palette ──
FOREST_GREEN = colors.HexColor("#0f3d2e")
EMERALD_GREEN = colors.HexColor("#059669")
MINT_LIGHT = colors.HexColor("#ecfdf5")
SLATE_DARK = colors.HexColor("#0f172a")
SLATE_BODY = colors.HexColor("#334155")
SLATE_LIGHT = colors.HexColor("#f8fafc")
BORDER_COLOR = colors.HexColor("#cbd5e1")
WARM_GOLD = colors.HexColor("#d97706")

class NumberedCanvas(canvas.Canvas):
    """Adds professional running headers, footers, and page numbers."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            # Suppress headers/footers on cover page
            return

        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(SLATE_BODY)

        # Header
        self.drawString(54, 800, "Discovery Uttarakhand — Hackathon Master Presentation Document")
        self.setStrokeColor(BORDER_COLOR)
        self.setLineWidth(0.5)
        self.line(54, 792, 541, 792)

        # Footer
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(541, 36, page_str)
        self.drawString(54, 36, "Confidential — Evaluator & Jury Presentation Copy v1.0")
        self.line(54, 48, 541, 48)

        self.restoreState()

def build_pdf():
    print(f"Reading markdown from: {MD_PATH}")
    with open(MD_PATH, "r", encoding="utf-8") as f:
        md_text = f.read()

    doc = SimpleDocTemplate(
        str(PDF_PATH),
        pagesize=A4,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom typography styles
    title_style = ParagraphStyle(
        'CoverTitle',
        fontName='Helvetica-Bold',
        fontSize=28,
        leading=34,
        textColor=FOREST_GREEN,
        spaceAfter=10
    )

    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        fontName='Helvetica',
        fontSize=14,
        leading=18,
        textColor=EMERALD_GREEN,
        spaceAfter=25
    )

    h1_style = ParagraphStyle(
        'Header1',
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=FOREST_GREEN,
        spaceBefore=18,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Header2',
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=EMERALD_GREEN,
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )

    h3_style = ParagraphStyle(
        'Header3',
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=SLATE_DARK,
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyDark',
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=SLATE_BODY,
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'BulletText',
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=SLATE_BODY,
        leftIndent=15,
        spaceAfter=3
    )

    code_style = ParagraphStyle(
        'CodeSnippet',
        fontName='Courier',
        fontSize=8,
        leading=11,
        textColor=SLATE_DARK,
        backColor=SLATE_LIGHT,
        borderPadding=6,
        spaceBefore=4,
        spaceAfter=6
    )

    table_cell = ParagraphStyle(
        'TableCell',
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=SLATE_BODY
    )

    table_header = ParagraphStyle(
        'TableHeader',
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white
    )

    story = []

    # ── COVER PAGE ──
    story.append(Spacer(1, 40))
    story.append(Paragraph("🏔️ DISCOVERY UTTARAKHAND", title_style))
    story.append(Paragraph("Next-Gen AI & Web3 Smart Tourism Platform for Uttarakhand", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=EMERALD_GREEN, spaceAfter=20))

    meta_text = """
    <b>Category:</b> AI Mountain Copilot + Web3 Escrow Tourism Platform<br/>
    <b>Target Region:</b> Uttarakhand, India (129+ Destinations, 86 Stays, 24 Overcrowding Alternatives)<br/>
    <b>Audience:</b> Hackathon Judges, Technical Evaluators, Industry Jury<br/>
    <b>Version:</b> Final Comprehensive Submission v1.0.7
    """
    story.append(Paragraph(meta_text, body_style))
    story.append(Spacer(1, 20))

    exec_summary = """
    <b>Executive Summary:</b><br/>
    Discovery Uttarakhand is an end-to-end intelligent mountain travel ecosystem purpose-built for the Himalayas. 
    It eliminates tourist fraud via blockchain escrow smart contracts, protects lives through live altitude telemetry and 
    emergency mountain SOS dispatch, supports local communities with direct host bookings, and delivers a 
    grounded multi-agent AI copilot with real-time Aoede 24kHz studio voice intelligence.
    """
    summary_table = Table([[Paragraph(exec_summary, body_style)]], colWidths=[487])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), MINT_LIGHT),
        ('BOX', (0, 0), (-1, -1), 1, EMERALD_GREEN),
        ('PADDING', (0, 0), (-1, -1), 12),
    ]))
    story.append(summary_table)
    story.append(PageBreak())

    # ── PARSE MARKDOWN SECTIONS ──
    lines = md_text.split('\n')
    i = 0
    in_code_block = False
    code_lines = []
    in_table = False
    table_rows = []

    while i < len(lines):
        line = lines[i].rstrip()

        # Handle Code Blocks
        if line.startswith('```'):
            if in_code_block:
                code_text = "<br/>".join(code_lines).replace(" ", "&nbsp;")
                story.append(Paragraph(code_text, code_style))
                code_lines = []
                in_code_block = False
            else:
                in_code_block = True
            i += 1
            continue

        if in_code_block:
            safe_line = line.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
            code_lines.append(safe_line)
            i += 1
            continue

        # Handle Tables
        if '|' in line and not line.startswith('#'):
            cells = [c.strip() for c in line.split('|')[1:-1]]
            if cells and not all(c == '' for c in cells):
                if not in_table:
                    in_table = True
                    table_rows = []
                if not re.match(r'^[\s\-:]+$', "".join(cells)):
                    table_rows.append(cells)
            i += 1
            continue
        elif in_table:
            in_table = False
            if table_rows:
                # Build ReportLab Table
                num_cols = max(len(r) for r in table_rows)
                col_w = 487.0 / num_cols
                formatted_data = []
                for r_idx, row in enumerate(table_rows):
                    row_cells = []
                    for c_idx in range(num_cols):
                        val = row[c_idx] if c_idx < len(row) else ''
                        st = table_header if r_idx == 0 else table_cell
                        row_cells.append(Paragraph(val, st))
                    formatted_data.append(row_cells)

                t = Table(formatted_data, colWidths=[col_w] * num_cols)
                t.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), FOREST_GREEN),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                    ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, SLATE_LIGHT]),
                    ('PADDING', (0, 0), (-1, -1), 5),
                ]))
                story.append(Spacer(1, 4))
                story.append(t)
                story.append(Spacer(1, 8))
            table_rows = []

        if not line.strip():
            i += 1
            continue

        # Headings
        if line.startswith('# '):
            clean_h = line[2:].strip()
            if "Discovery Uttarakhand" not in clean_h:
                story.append(Paragraph(clean_h, h1_style))
        elif line.startswith('## '):
            clean_h = line[3:].strip()
            story.append(Paragraph(clean_h, h1_style))
        elif line.startswith('### '):
            clean_h = line[4:].strip()
            story.append(Paragraph(clean_h, h2_style))
        elif line.startswith('#### '):
            clean_h = line[5:].strip()
            story.append(Paragraph(clean_h, h3_style))
        elif line.startswith('---'):
            story.append(HRFlowable(width="100%", thickness=0.5, color=BORDER_COLOR, spaceBefore=8, spaceAfter=8))
        elif line.startswith('- ') or line.startswith('* '):
            bullet_text = line[2:].strip()
            story.append(Paragraph(f"• {bullet_text}", bullet_style))
        elif re.match(r'^\d+\.\s', line):
            story.append(Paragraph(line, bullet_style))
        else:
            story.append(Paragraph(line, body_style))

        i += 1

    print("Compiling ReportLab PDF Document...")
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"✅ Master Presentation PDF generated successfully at: {PDF_PATH}")

if __name__ == "__main__":
    build_pdf()
