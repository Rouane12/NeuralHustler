from pathlib import Path
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.utils import ImageReader
import qrcode

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets/documents/Rouane-Mounssif-CV.pdf"
PHOTO = ROOT / "assets/images/rouane-mounssif.webp"
QR_TMP = ROOT / "assets/documents/.linkedin-qr.tmp.png"
LINKEDIN_URL = "https://www.linkedin.com/in/rouane-mounssif-538171243/"

W, H = A4
SIDEBAR = 159
NAVY = colors.HexColor("#102F49")
CYAN = colors.HexColor("#0396C9")
CYAN_LIGHT = colors.HexColor("#7FD7F2")
TEXT = colors.HexColor("#10202E")
MUTED = colors.HexColor("#4F5E6B")
LINE = colors.HexColor("#D3DEE5")
CARD = colors.HexColor("#F8FBFD")
CARD_LINE = colors.HexColor("#D7E1E7")
WHITE = colors.white

OUT.parent.mkdir(parents=True, exist_ok=True)
c = canvas.Canvas(str(OUT), pagesize=A4)
c.setTitle("Rouane Mounssif - Software Engineer Resume")

c.setFillColor(WHITE)
c.rect(0, 0, W, H, fill=1, stroke=0)
c.setFillColor(NAVY)
c.rect(0, 0, SIDEBAR, H, fill=1, stroke=0)

def txt(x, y, s, size=8, font="Helvetica", color=TEXT):
    c.setFillColor(color)
    c.setFont(font, size)
    c.drawString(x, y, s)

def line(x1, y1, x2, y2, color=LINE, width=0.7):
    c.setStrokeColor(color)
    c.setLineWidth(width)
    c.line(x1, y1, x2, y2)

def section_title(x, y, title, right=0, color=TEXT):
    label = title.upper()
    c.setFillColor(color)
    c.setFont("Helvetica-Bold", 9.5)
    c.drawString(x, y, label)
    tw = c.stringWidth(label, "Helvetica-Bold", 9.5)
    if right and right > x + tw + 10:
        line(
            x + tw + 10,
            y + 2,
            right,
            y + 2,
            colors.HexColor("#C9D6DE") if color == TEXT else colors.HexColor("#446078"),
        )

def para(x, y, w, text, size=7.3, leading=9.0, color=MUTED, bold=False):
    style = ParagraphStyle(
        "p",
        fontName="Helvetica-Bold" if bold else "Helvetica",
        fontSize=size,
        leading=leading,
        textColor=color,
        alignment=TA_LEFT,
        spaceAfter=0,
        spaceBefore=0,
    )
    p = Paragraph(text, style)
    _, h = p.wrap(w, 200)
    p.drawOn(c, x, y - h)
    return h

def bullet(x, y, text, size=7, color=WHITE, bullet_color=CYAN_LIGHT):
    c.setFillColor(bullet_color)
    c.circle(x + 2, y + 2.6, 1.1, fill=1, stroke=0)
    h = para(x + 9, y + 8, 130, text, size=size, leading=size + 2, color=color)
    return max(h, 10)

# Photo
if PHOTO.exists():
    c.setStrokeColor(colors.HexColor("#587087"))
    c.setLineWidth(2)
    c.roundRect(39, H - 108, 82, 82, 10, fill=0, stroke=1)
    c.drawImage(
        ImageReader(str(PHOTO)),
        42,
        H - 105,
        76,
        76,
        mask="auto",
        preserveAspectRatio=True,
        anchor="c",
    )

# Sidebar
sx = 15
y = H - 130
section_title(sx, y, "Contact", right=145, color=CYAN_LIGHT)
y -= 16
for label, value in [
    ("Phone", "+212 07 78411588"),
    ("Email", "rouane.mounssif12@gmail.com"),
    ("Location", "Casablanca, Morocco"),
    ("Portfolio", "neuralhustleacademy.com"),
]:
    txt(sx, y, label, 7.1, "Helvetica-Bold", WHITE)
    y -= 10
    h = para(sx, y + 7, 132, value, size=6.9, leading=8.5, color=WHITE)
    y -= h + 7

y -= 5
section_title(sx, y, "Technical Skills", right=145, color=CYAN_LIGHT)
y -= 16
skills = [
    ("Backend & APIs", "Python | FastAPI | REST APIs | SQLAlchemy | Node.js | PHP | Java | C++"),
    ("Data & Cloud", "PostgreSQL | MySQL | Oracle | Supabase | Firebase | Railway"),
    ("Frontend & Platforms", "React | HTML5 | CSS3 | Flutter | WordPress"),
    ("AI & Engineering Tools", "OpenAI API | Zapier | Git | GitHub | Docker | Linux | CI/CD | UML"),
]
for label, value in skills:
    txt(sx, y, label, 6.8, "Helvetica-Bold", WHITE)
    y -= 9
    h = para(sx, y + 6, 132, value, size=6.1, leading=7.4, color=WHITE)
    y -= h + 7

y -= 1
section_title(sx, y, "Languages", right=145, color=CYAN_LIGHT)
y -= 16
for item in [
    "Arabic - Native",
    "French - Native / Bilingual",
    "English - Advanced",
    "German - Beginner",
]:
    y -= bullet(sx, y, item, size=6.5)

y -= 4
section_title(sx, y, "Core Strengths", right=145, color=CYAN_LIGHT)
y -= 16
for item in [
    "Backend problem solving",
    "AI workflow integration",
    "Adaptability",
    "Teamwork",
    "Attention to detail",
]:
    y -= bullet(sx, y, item, size=6.5)

# LinkedIn QR
qr = qrcode.QRCode(version=None, box_size=5, border=2)
qr.add_data(LINKEDIN_URL)
qr.make(fit=True)
qr.make_image(fill_color="black", back_color="white").save(QR_TMP)
qx, qy, qw = 48, 24, 64
c.setStrokeColor(colors.HexColor("#49677F"))
c.setLineWidth(0.8)
c.roundRect(qx - 10, qy - 8, qw + 20, qw + 26, 7, fill=0, stroke=1)
txt(qx + 5, qy + qw + 9, "LINKEDIN", 6.3, "Helvetica-Bold", CYAN_LIGHT)
c.drawImage(str(QR_TMP), qx, qy, qw, qw, mask="auto")
txt(qx + 7, qy - 3, "Scan to connect", 5.2, "Helvetica", colors.HexColor("#CAD8E2"))

# Main content
mx, mr = 181, W - 22
mw = mr - mx
y = H - 38
txt(mx, y, "Rouane Mounssif", 20, "Helvetica-Bold", TEXT)
y -= 17
txt(mx, y, "SOFTWARE ENGINEER - AI WORKFLOW SPECIALIST", 9.2, "Helvetica-Bold", CYAN)
y -= 15
c.setStrokeColor(CYAN)
c.setLineWidth(2)
c.line(mx, y + 2, mx, y - 36)

summary = (
    "Software engineer and AI Workflow Specialist who researches problems, prototypes rapidly and turns ideas "
    "into practical apps, automations and digital products. Comfortable adapting across stacks and tools, choosing "
    "efficient approaches, integrating APIs and AI, and iterating from research and experimentation to reliable, "
    "convenient user-facing solutions."
)
h = para(mx + 10, y + 3, mw - 10, summary, size=7.1, leading=9.2, color=MUTED)
y -= h + 17

section_title(mx, y, "Professional Experience", right=mr, color=TEXT)
y -= 16
experiences = [
    (
        "Final-Year Software Engineering Internship",
        "DIAL TECHNOLOGIE - Casablanca",
        "2024",
        "Built a custom WordPress plugin and multiple Zapier automations, using AI-assisted workflows to streamline repetitive business tasks.",
    ),
    (
        "End-of-Year Software Project",
        "EMSI - Casablanca",
        "2023",
        "Developed an online shopping application using Flutter, PHP, Firebase and the BLoC pattern.",
    ),
    (
        "Data Management Internship",
        "DFI INTERNATIONAL - Casablanca",
        "2022",
        "Contributed to improving and streamlining data-management processes.",
    ),
]
for title, org, year, desc in experiences:
    txt(mx, y, title, 7.7, "Helvetica-Bold", TEXT)
    txt(mr - 16, y, year, 6.8, "Helvetica", MUTED)
    y -= 10
    txt(mx, y, org, 6.6, "Helvetica-Bold", CYAN)
    y -= 9
    h = para(mx, y + 7, mw - 5, desc, size=6.5, leading=8.0, color=MUTED)
    y -= h + 8

section_title(mx, y, "Selected Projects", right=mr, color=TEXT)
y -= 12
projects = [
    (
        "Wardrobe AI Backend",
        "FastAPI | OpenAI | Railway",
        "Client-facing API that analyzes fashion images, returns structured JSON and generates style-profile suggestions.",
    ),
    (
        "FlowForge",
        "FastAPI | PostgreSQL | SQLAlchemy",
        "Backend project with authentication, database migrations and clean REST API architecture.",
    ),
    (
        "PDFbright",
        "Micro-SaaS | PDF Diagnostics",
        "Product focused on diagnosing PDF problems clearly before guiding users toward the right repair workflow.",
    ),
    (
        "Neural Critic",
        "Supabase | CI/CD | SEO | Analytics",
        "Gaming publication with editorial tooling, reader features, automated publishing, search optimization and analytics.",
    ),
    (
        "TrafficVerdict",
        "Analytics | GA4 | OAuth | PostgreSQL",
        "Analytics product that connects traffic data sources and turns raw site metrics into clearer, actionable insights.",
    ),
    (
        "Terminalia",
        "Next.js | React | TypeScript | Interactive UI",
        "Browser-based cinematic terminal studio for building reusable fictional computer scenes, sequences and interactive environments.",
    ),
    (
        "FlowRun",
        "Workflow Product | Rapid Prototyping",
        "Explores simpler, faster ways to package multi-step tasks into a convenient product workflow, with an emphasis on usability, iteration and efficient implementation.",
    ),
]
colgap = 8
cardw = (mw - colgap) / 2
cardh = 47
for i, (name, tech, desc) in enumerate(projects[:6]):
    row, col = divmod(i, 2)
    cx = mx + col * (cardw + colgap)
    cy = y - row * (cardh + 7)
    c.setFillColor(CARD)
    c.setStrokeColor(CARD_LINE)
    c.setLineWidth(0.7)
    c.roundRect(cx, cy - cardh, cardw, cardh, 5, fill=1, stroke=1)
    txt(cx + 7, cy - 12, name, 6.9, "Helvetica-Bold", TEXT)
    txt(cx + 7, cy - 21, tech, 5.5, "Helvetica-Bold", CYAN)
    para(cx + 7, cy - 24, cardw - 14, desc, size=5.55, leading=6.8, color=MUTED)

y -= 3 * (cardh + 7)
name, tech, desc = projects[6]
fullh = 42
c.setFillColor(CARD)
c.setStrokeColor(CARD_LINE)
c.roundRect(mx, y - fullh, mw, fullh, 5, fill=1, stroke=1)
txt(mx + 7, y - 12, name, 6.9, "Helvetica-Bold", TEXT)
txt(mx + 7, y - 21, tech, 5.5, "Helvetica-Bold", CYAN)
para(mx + 7, y - 24, mw - 14, desc, size=5.55, leading=6.8, color=MUTED)
y -= fullh + 12

half = (mw - 14) / 2
section_title(mx, y, "Education", right=mx + half, color=TEXT)
section_title(mx + half + 14, y, "Certifications", right=mr, color=TEXT)
y -= 16

txt(mx, y, "Engineering Degree in Computer Science", 7.2, "Helvetica-Bold", TEXT)
txt(mx, y - 10, "EMSI - Casablanca - 2019-2024", 6.4, "Helvetica-Bold", CYAN)
txt(mx, y - 27, "High School Diploma - Physics & Chemistry", 7.0, "Helvetica-Bold", TEXT)
txt(mx, y - 37, "Lycee En-Nour 2 - Casablanca - 2017-2018", 6.2, "Helvetica-Bold", CYAN)

certs = (
    "React | Front-End UI Frameworks | DevOps | Cloud Computing | Node.js / Express / MongoDB | "
    "Oracle Database Administration | Java for Android | HTML5 / CSS3 | Python"
)
para(mx + half + 14, y + 2, half, certs, size=6.0, leading=8.1, color=MUTED)

c.showPage()
c.save()

if QR_TMP.exists():
    QR_TMP.unlink()

print(f"Built {OUT}")
