"""
build_cv.py — Generate CV PDF from cv-data.js (source of truth).

Spec rules:
1. Identity header: name + role/domains left, contacts right.
2. Executive Summary: single paragraph from cvData.summary.
3. Core Competencies: top N (=MAX_COMPETENCIES) from array, in order.
4. Professional Experience:
   - Combine entries with same company.
   - Progression → senior title leads; "After role as X..." note.
   - Bullets ordered chronologically (earliest role first).
5. Education: preserve domain grouping.
6. Recognition: bullet list.
7. Publications: full citations; omit section if all pending.
8. Languages: single line with · separators.
9. Additional Training: bullet list.
10. Other: bullet list, omit if empty.

Theme color: #0F3D22 (current PDF dark green).
Font: Helvetica (ATS-safe). A4. 18mm margins.
"""

import json5, re, sys

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, ListFlowable, ListItem
)
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_RIGHT, TA_JUSTIFY

# ============================================================
# CONFIGURATION
# ============================================================

THEME_GREEN = HexColor("#0F3D22")
GRAY = HexColor("#5C6470")
LIGHT_GRAY = HexColor("#D0D0D0")
BODY_BLACK = HexColor("#1A1A1A")

BODY_FONT = "Helvetica"
BOLD_FONT = "Helvetica-Bold"
ITALIC_FONT = "Helvetica-Oblique"

PAGE_W, PAGE_H = A4
MARGIN = 18 * mm
CONTENT_W = PAGE_W - 2 * MARGIN

MAX_COMPETENCIES = 11

# ============================================================
# DATA LOADING
# ============================================================

def esc(s):
    """Escape HTML special chars for ReportLab Paragraph. ReportLab Paragraph
    parses XML-ish markup, so `&`, `<`, `>` in source text must be escaped
    before being passed in."""
    if s is None:
        return ""
    return (str(s)
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;"))

def load_cv_data(js_path):
    """Parse cv-data.js (JS object literal) into a Python dict."""
    with open(js_path, "r") as f:
        text = f.read()
    m = re.search(r"const\s+cvData\s*=\s*(\{.*\});", text, re.DOTALL)
    if not m:
        raise ValueError("Could not find `const cvData = {...};` in JS file")
    return json5.loads(m.group(1))

# ============================================================
# EXPERIENCE — SAME-COMPANY COMBINATION
# ============================================================

def _city_only(location):
    """Strip country code from 'Lisbon, PT' → 'Lisbon'."""
    return location.split(",")[0].strip()

def combine_company_entries(experience):
    """
    Merge entries that share the same company.
    Sort same-company entries by start year ascending.
    Senior (latest start) leads the title; earlier roles become an after-note.
    Bullets concatenated chronologically.
    """
    seen = set()
    grouped = {}
    for e in experience:
        grouped.setdefault(e["company"], []).append(e)

    result = []
    for e in experience:
        c = e["company"]
        if c in seen:
            continue
        seen.add(c)
        group = grouped[c]
        if len(group) == 1:
            result.append(group[0])
            continue

        sorted_g = sorted(group, key=lambda x: int(x["start"]))
        senior = sorted_g[-1]
        earlier = sorted_g[:-1]

        # Chronological location list, deduplicated preserving order
        locs = list(dict.fromkeys([x["location"] for x in sorted_g]))

        combined = {
            "role": senior["role"],
            "company": senior["company"],
            "start": sorted_g[0]["start"],
            "end": senior["end"],
            "location": " / ".join(locs),
            "context": senior.get("context", ""),
            "bullets": [b for x in sorted_g for b in x.get("bullets", [])],
        }
        if earlier:
            notes = []
            for x in earlier:
                notes.append(
                    f"{x['role']} in {_city_only(x['location'])} ({x['start']}–{x['end']})"
                )
            combined["after_note"] = "After role as " + "; ".join(notes) + "."
        result.append(combined)
    return result

# ============================================================
# STYLES
# ============================================================

def make_styles():
    return {
        "name": ParagraphStyle(
            "Name", fontName=BOLD_FONT, fontSize=18, textColor=THEME_GREEN,
            leading=22, spaceAfter=2
        ),
        "role": ParagraphStyle(
            "Role", fontName=BODY_FONT, fontSize=10.5, textColor=BODY_BLACK, leading=13
        ),
        "tagline": ParagraphStyle(
            "Tagline", fontName=ITALIC_FONT, fontSize=9.5, textColor=GRAY, leading=12
        ),
        "contact": ParagraphStyle(
            "Contact", fontName=BODY_FONT, fontSize=8.5, textColor=GRAY,
            leading=11.5, alignment=TA_RIGHT
        ),
        "section": ParagraphStyle(
            "Section", fontName=BOLD_FONT, fontSize=10.5, textColor=THEME_GREEN,
            leading=13, spaceBefore=18, spaceAfter=4, keepWithNext=1
        ),
        "body": ParagraphStyle(
            "Body", fontName=BODY_FONT, fontSize=9.5, textColor=BODY_BLACK,
            leading=12.5, alignment=TA_JUSTIFY
        ),
        "bullet": ParagraphStyle(
            "Bullet", fontName=BODY_FONT, fontSize=9.5, textColor=BODY_BLACK,
            leading=12.5
        ),
        "role_title": ParagraphStyle(
            "RoleTitle", fontName=BODY_FONT, fontSize=10, textColor=BODY_BLACK,
            leading=13, spaceBefore=8
        ),
        "dates": ParagraphStyle(
            "Dates", fontName=BODY_FONT, fontSize=9, textColor=GRAY,
            leading=13, alignment=TA_RIGHT, spaceBefore=8
        ),
        "context": ParagraphStyle(
            "Context", fontName=ITALIC_FONT, fontSize=9, textColor=GRAY,
            leading=11.5, spaceAfter=3
        ),
        "edu_domain": ParagraphStyle(
            "EduDomain", fontName=BOLD_FONT, fontSize=9.5, textColor=BODY_BLACK,
            leading=12.5, spaceBefore=6, spaceAfter=2
        ),
    }

# ============================================================
# RENDERING HELPERS
# ============================================================

def render_section_header(story, title, styles):
    story.append(Paragraph(title.upper(), styles["section"]))
    story.append(HRFlowable(
        width="100%", thickness=0.4, color=LIGHT_GRAY,
        spaceBefore=2, spaceAfter=5
    ))

def render_bullet_list(items, styles, fontsize=9.5):
    list_items = []
    for txt in items:
        list_items.append(ListItem(
            Paragraph(esc(txt), styles["bullet"]),
            leftIndent=10, value="•"
        ))
    return ListFlowable(
        list_items, bulletType="bullet",
        bulletColor=THEME_GREEN, bulletFontSize=fontsize - 1,
        leftIndent=12, bulletIndent=0
    )

# ============================================================
# BUILD STORY
# ============================================================

def build_story(data):
    S = make_styles()
    story = []

    # Identity header
    ident = data["identity"]
    role_text = ident["role"]
    if ident.get("subtitle"):
        role_text = f'{ident["role"]} · {ident["subtitle"]}'
    left = [
        Paragraph(esc(ident["name"].upper()), S["name"]),
        Paragraph(esc(role_text), S["role"]),
        Paragraph(esc(ident["domains"]), S["tagline"]),
    ]
    linkedin = ident["linkedin"].replace("https://", "").replace("http://", "")
    github = ident["github"].replace("https://", "").replace("http://", "")
    right = [
        Paragraph(esc(ident["location"]), S["contact"]),
        Paragraph(esc(ident["email"]), S["contact"]),
        Paragraph(esc(ident["phone"]), S["contact"]),
        Paragraph(esc(linkedin), S["contact"]),
        Paragraph(esc(github), S["contact"]),
    ]
    header = Table(
        [[left, right]],
        colWidths=[CONTENT_W * 0.58, CONTENT_W * 0.42]
    )
    header.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    story.append(header)
    story.append(Spacer(1, 6))

    # --- EXECUTIVE SUMMARY ---
    render_section_header(story, "Executive Summary", S)
    story.append(Paragraph(esc(data["summary"]), S["body"]))

    # --- CORE COMPETENCIES ---
    render_section_header(story, "Core Competencies", S)
    comps = data["competencies"][:MAX_COMPETENCIES]
    story.append(render_bullet_list(comps, S))

    # --- PROFESSIONAL EXPERIENCE ---
    render_section_header(story, "Professional Experience", S)
    processed = combine_company_entries(data["experience"])
    for i, exp in enumerate(processed):
        # More breathing room between positions
        if i > 0:
            story.append(Spacer(1, 10))
        # Role line: title + company on left, dates + location on right
        role_html = (
            f'<b><font color="#0F3D22">{esc(exp["role"])}</font></b>'
            f'  ·  <font color="#0F3D22">{esc(exp["company"])}</font>'
        )
        date_html = esc(f'{exp["start"]} – {exp["end"]}  ·  {exp["location"]}')
        role_tbl = Table(
            [[Paragraph(role_html, S["role_title"]),
              Paragraph(date_html, S["dates"])]],
            colWidths=[CONTENT_W * 0.62, CONTENT_W * 0.38]
        )
        role_tbl.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("TOPPADDING", (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ]))
        story.append(role_tbl)

        # Context line(s)
        if exp.get("context"):
            story.append(Paragraph(esc(exp["context"]), S["context"]))
        if exp.get("after_note"):
            story.append(Paragraph(esc(exp["after_note"]), S["context"]))

        # Bullets
        if exp.get("bullets"):
            story.append(render_bullet_list(exp["bullets"], S))

    # --- EDUCATION ---
    render_section_header(story, "Education", S)
    for ed in data["education"]:
        story.append(Paragraph(esc(ed["domain"]), S["edu_domain"]))
        story.append(render_bullet_list(ed["items"], S))

    # --- RECOGNITION ---
    render_section_header(story, "Recognition & Institutional Roles", S)
    story.append(render_bullet_list(data["recognition"], S))

    # --- PUBLICATIONS ---
    pubs = [p for p in data.get("publications", []) if not p.get("pending")]
    if pubs:
        render_section_header(story, "Publications", S)
        for p in pubs:
            cit = f'{esc(p["authors"])} ({p["year"]}). <i>{esc(p["title"])}</i>. {esc(p["venue"])}'
            if p.get("doi"):
                cit += f'. DOI: {esc(p["doi"])}'
            story.append(Paragraph(cit, S["body"]))
            story.append(Spacer(1, 3))

    # --- LANGUAGES ---
    render_section_header(story, "Languages", S)
    lang_line = " · ".join(f'{l["name"]} ({l["level"]})' for l in data["languages"])
    story.append(Paragraph(esc(lang_line), S["body"]))

    # --- ADDITIONAL TRAINING ---
    render_section_header(story, "Additional Training & Certifications", S)
    trn = [f'{t["course"]} — {t["institution"]}' for t in data["additionalTraining"]]
    story.append(render_bullet_list(trn, S))

    # --- OTHER ---
    other = data.get("other", [])
    if other:
        render_section_header(story, "Other", S)
        story.append(render_bullet_list(other, S))

    return story

# ============================================================
# MAIN
# ============================================================

def main(js_path, out_path):
    data = load_cv_data(js_path)
    doc = SimpleDocTemplate(
        out_path, pagesize=A4,
        leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=MARGIN, bottomMargin=MARGIN,
        title=f"CV — {data['identity']['name']}",
        author=data["identity"]["name"],
    )
    story = build_story(data)
    doc.build(story)
    print(f"✓ PDF generated: {out_path}")

if __name__ == "__main__":
    js_path = sys.argv[1] if len(sys.argv) > 1 else "cv-data-latest.js"
    out_path = sys.argv[2] if len(sys.argv) > 2 else "CV_generated.pdf"
    main(js_path, out_path)
