import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

# 1. Generate Architecture Flow Diagram Image
def generate_flow_chart(output_image_path):
    fig, ax = plt.subplots(figsize=(10, 6.2), dpi=220)
    ax.set_facecolor('#0f172a')
    fig.patch.set_facecolor('#0f172a')
    ax.axis('off')

    # Draw Boxes
    def draw_box(x, y, w, h, title, subtitle, bg_color, border_color):
        rect = patches.FancyBboxPatch(
            (x, y), w, h,
            boxstyle="round,pad=0.03,rounding_size=0.15",
            facecolor=bg_color, edgecolor=border_color, linewidth=2
        )
        ax.add_patch(rect)
        ax.text(x + w / 2, y + h * 0.65, title, color='#ffffff', fontsize=11, fontweight='bold', ha='center', va='center')
        ax.text(x + w / 2, y + h * 0.32, subtitle, color='#cbd5e1', fontsize=8.5, ha='center', va='center')

    # Boxes
    draw_box(0.5, 4.3, 3.2, 1.3, "1. User Browser (Client)", "Next.js 16 + React 19 UI\nSmartCityMap & AIChatbot", "#1e293b", "#38bdf8")
    draw_box(4.5, 4.3, 3.2, 1.3, "2. Next.js API Routes", "App Router /api/chat\nSession & Auth Engine", "#1e293b", "#60a5fa")
    draw_box(8.5, 4.3, 3.2, 1.3, "3. Google Gemini AI", "gemini-flash-lite-latest\nNatural Language & Context", "#1e293b", "#34d399")

    draw_box(0.5, 1.4, 3.2, 1.3, "4. Interactive GIS Engine", "Leaflet.js + Google Tiles\nPOI Navigation & Directions", "#1e293b", "#f59e0b")
    draw_box(4.5, 1.4, 3.2, 1.3, "5. Local Storage Vault", "Persistent User Accounts\nSMART_CITY_ACCOUNTS_DB", "#1e293b", "#a855f7")
    draw_box(8.5, 1.4, 3.2, 1.3, "6. Spring Boot 4 Backend", "Java 23 / RestTemplate\nMunicipal Actuator & REST", "#1e293b", "#ec4899")

    # Arrows
    def draw_arrow(x1, y1, x2, y2, label=""):
        ax.annotate(
            label, xy=(x2, y2), xytext=(x1, y1),
            arrowprops=dict(facecolor='#38bdf8', edgecolor='#38bdf8', arrowstyle='->', lw=2.2),
            color='#94a3b8', fontsize=8, ha='center', va='bottom'
        )

    # Connections
    draw_arrow(3.7, 4.95, 4.5, 4.95, "POST /api/chat")
    draw_arrow(7.7, 4.95, 8.5, 4.95, "GenAI Prompt")
    draw_arrow(2.1, 4.3, 2.1, 2.7, "Render GIS")
    draw_arrow(2.1, 4.3, 5.0, 2.7, "Save User")
    draw_arrow(6.1, 4.3, 8.8, 2.7, "Proxy Fallback")

    plt.title("AI Smart City Portal - System Architecture & Data Flow", color='#f8fafc', fontsize=14, fontweight='bold', pad=15)
    plt.tight_layout()
    plt.savefig(output_image_path, bbox_inches='tight', facecolor=fig.get_facecolor(), edgecolor='none')
    plt.close()

def build_pdf(pdf_path, diagram_path, city_photo_path):
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=colors.HexColor('#0f172a'),
        alignment=1,
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor('#475569'),
        alignment=1,
        spaceAfter=15
    )

    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor('#1d4ed8'),
        spaceBefore=12,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor('#334155'),
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'BulletStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#1e293b'),
        leftIndent=12,
        spaceAfter=4
    )

    story = []

    # Title & Subtitle
    story.append(Paragraph("AI Smart City Portal", title_style))
    story.append(Paragraph("Comprehensive Technology Architecture, Web Flow & Component Report", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#2563eb'), spaceAfter=14))

    # Executive Summary
    story.append(Paragraph("1. Platform Overview & Executive Summary", section_heading))
    story.append(Paragraph(
        "The <b>AI Smart City Portal</b> is a next-generation civic technology platform engineered for major Indian metropolises (Pune, Mumbai, Delhi, Bengaluru, Hyderabad, Chennai). It unifies interactive geographic information systems (GIS), natural-language generative city assistance, citizen municipal documentation checklists, and persistent browser-based citizen account management into a single, cohesive user experience.",
        body_style
    ))

    # Architecture Flowchart Image
    story.append(Spacer(1, 4))
    story.append(Paragraph("2. System Architecture & High-Level Data Flow", section_heading))
    if os.path.exists(diagram_path):
        story.append(Image(diagram_path, width=7.2*inch, height=4.3*inch))
        story.append(Spacer(1, 6))

    # Technology Matrix Table
    story.append(Paragraph("3. Technology Stack Breakdown", section_heading))
    tech_data = [
        ["Layer / Component", "Technology Used", "Version", "Role & Responsibility"],
        ["Frontend UI", "Next.js (Turbopack) + React", "16.3 / 19.0", "Reactive client-side SPA, App Router, SSR"],
        ["Programming Language", "TypeScript", "5.x", "Type safety across city datasets, DTOs & state"],
        ["Mapping Engine", "Leaflet.js + Google Tiles", "1.9.4 / Live", "GIS multi-layer viewing, pins, & GPS routing"],
        ["AI Chat Engine", "Google Gemini Generative API", "Flash-Lite", "Contextual multi-turn natural language query responses"],
        ["Backend Service", "Spring Boot (REST API)", "4.1.1", "Enterprise Java microservice, Actuator & proxy"],
        ["Runtime & Compiler", "OpenJDK / Java", "23", "Virtual threads, high-concurrency Java backend"],
        ["Account Persistence", "HTML5 LocalStorage Vault", "Native", "Client-side encrypted user credential directory"]
    ]

    tech_table = Table(tech_data, colWidths=[1.4*inch, 2.2*inch, 1.0*inch, 2.6*inch])
    tech_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e293b')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 8.5),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
        ('TOPPADDING', (0, 0), (-1, 0), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f8fafc')),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(tech_table)

    story.append(PageBreak())

    # Page 2: Web Flow & Features
    story.append(Paragraph("4. End-to-End User Web Journey & Flow", section_heading))
    story.append(Paragraph("<b>Step 1: Landing & Metropolis Selection</b>", bullet_style))
    story.append(Paragraph("The user lands on the portal. The active node (e.g. Pune, Mumbai, Delhi) is chosen from the top header selector. Ambient weather, AQI metrics, and hospital ICU statuses dynamically update to match the chosen city.", body_style))

    story.append(Paragraph("<b>Step 2: Interactive GIS & Google Navigation</b>", bullet_style))
    story.append(Paragraph("Users explore hospitals, police beat stations, tourist heritage sites, and transit hubs on the live GIS map. Clicking on any marker displays full details and a direct <i>Directions in Google Maps</i> button which launches turns-by-turn routing from the user's current GPS location.", body_style))

    story.append(Paragraph("<b>Step 3: SmartCity Assistant Interaction</b>", bullet_style))
    story.append(Paragraph("Upon opening the chat assistant, users are presented with categorized prompt suggestions (Emergency Care, Sightseeing Itineraries, Transit Timetables, and Official Certificates). Submitting a query activates Google Gemini's generative engine with 8-turn conversation memory.", body_style))

    story.append(Paragraph("<b>Step 4: LocalStorage Account Creation & Session Vault</b>", bullet_style))
    story.append(Paragraph("Citizens can register an account (Name, Email, Password, Phone). The account is securely stored in browser localStorage. Refreshing or reopening the browser automatically restores the active citizen session.", body_style))

    story.append(Spacer(1, 8))

    # City Showcase Photo
    story.append(Paragraph("5. Visual Showcase & Field Photography", section_heading))
    if os.path.exists(city_photo_path):
        story.append(Paragraph("<b>Featured Landmark:</b> Shaniwar Wada Palace Fortification (Pune, Maharashtra)", bullet_style))
        story.append(Spacer(1, 4))
        story.append(Image(city_photo_path, width=7.2*inch, height=2.8*inch))

    story.append(Spacer(1, 14))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#cbd5e1'), spaceAfter=8))
    story.append(Paragraph("<b>Author & Engineering Lead:</b> Sahil Mahajan (@Sahil192210) &bull; Project Repository: git@github.com:Sahil192210/ai-smart-city-.git", ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8, textColor=colors.HexColor('#64748b'), alignment=1)))

    doc.build(story)

if __name__ == '__main__':
    root_dir = r"c:\Users\DELL\Documents\Ai smart city"
    diag_path = os.path.join(root_dir, "architecture_flowchart.png")
    pdf_path = os.path.join(root_dir, "AI_Smart_City_Technology_and_Architecture_Flow.pdf")
    photo_path = os.path.join(root_dir, "frontend", "public", "cities", "pune-shaniwar-wada.jpg")

    print("Generating flowchart image...")
    generate_flow_chart(diag_path)
    print("Flowchart created:", diag_path)

    print("Generating PDF document...")
    build_pdf(pdf_path, diag_path, photo_path)
    print("PDF created successfully:", pdf_path)
