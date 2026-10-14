import os
import sys
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Header (pages 2+)
        if self._pageNumber > 1:
            self.drawString(36, A4[1] - 25, "My Student Academia (MSA) — Exam & Viva Cheatsheet")
            self.drawRightString(A4[0] - 36, A4[1] - 25, "IEEE Std 830-1998 / CSE11117")
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.5)
            self.line(36, A4[1] - 28, A4[0] - 36, A4[1] - 28)
            
        # Footer (all pages)
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawString(36, 20, "Confidential — Academic & Technical Evaluation Reference")
        self.drawRightString(A4[0] - 36, 20, page_str)
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(36, 28, A4[0] - 36, 28)
        self.restoreState()

def build_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    # Custom Palette
    NAVY = colors.HexColor("#0F172A")
    SLATE = colors.HexColor("#334155")
    TEAL = colors.HexColor("#0D9488")
    TEAL_DARK = colors.HexColor("#0F766E")
    BLUE = colors.HexColor("#0284C7")
    BG_LIGHT = colors.HexColor("#F8FAFC")
    BORDER_COLOR = colors.HexColor("#E2E8F0")

    # Typography styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.white
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor("#94A3B8")
    )

    meta_style = ParagraphStyle(
        'MetaText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor("#CBD5E1")
    )

    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=NAVY,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    subheading = ParagraphStyle(
        'SubHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=TEAL_DARK,
        spaceBefore=4,
        spaceAfter=2,
        keepWithNext=True
    )

    body = ParagraphStyle(
        'BodyCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=SLATE
    )

    body_bold = ParagraphStyle(
        'BodyBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=NAVY
    )

    tbl_header = ParagraphStyle(
        'TblHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.white
    )

    tbl_cell = ParagraphStyle(
        'TblCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.2,
        leading=9.5,
        textColor=SLATE
    )

    tbl_cell_bold = ParagraphStyle(
        'TblCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.2,
        leading=9.5,
        textColor=NAVY
    )

    qa_q = ParagraphStyle(
        'QAQuestion',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10.5,
        textColor=NAVY
    )

    qa_a = ParagraphStyle(
        'QAAnswer',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=10,
        textColor=SLATE
    )

    story = []

    # 1. Header Banner
    header_content = [
        [
            Paragraph("🎓 My Student Academia (MSA)", title_style),
            Paragraph("<font color='#38BDF8'><b>EXAM & VIVA READY</b></font><br/><font size='6.5' color='#94A3B8'>Comprehensive Guide</font>", ParagraphStyle('RTag', parent=styles['Normal'], alignment=2, fontName='Helvetica-Bold', fontSize=8, leading=10, textColor=colors.white))
        ],
        [
            Paragraph("Next-Generation Academic Schedule & Course Registration System", subtitle_style),
            ""
        ],
        [
            Paragraph("<b>Subject:</b> Software Engineering (CSE11117) &nbsp;|&nbsp; <b>Standards:</b> IEEE Std 830-1998 (SRS) / 1016-2009 (SDD)<br/><b>Author:</b> Aditya Chatterjee &nbsp;|&nbsp; <b>Institution:</b> Dept of CSE, Adamas University (2025–2026)", meta_style),
            ""
        ]
    ]

    header_tbl = Table(header_content, colWidths=[380, 143])
    header_tbl.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), NAVY),
        ('SPAN', (0, 1), (1, 1)),
        ('SPAN', (0, 2), (1, 2)),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
        ('LINEBELOW', (0, 1), (-1, 1), 0.5, colors.HexColor("#334155")),
    ]))
    story.append(header_tbl)
    story.append(Spacer(1, 8))

    # 2. Project Scope & Elevator Summary
    story.append(Paragraph("1. Project Overview & Core Mission", section_heading))
    story.append(HRFlowable(width="100%", thickness=1.5, color=TEAL, spaceBefore=1, spaceAfter=5))
    
    scope_data = [
        [
            Paragraph("<b>Core Definition:</b> Full-stack, 3-tier web platform eliminating manual academic scheduling conflicts, prerequisite violations, and credit overload through atomic validation transactions.", body),
            Paragraph("<b>Key Innovations:</b><br/>&bull; ACID atomic seat booking & waitlisting<br/>&bull; Dynamic FIFO queue promotion on drops<br/>&bull; Sub-50ms landing & 120 FPS 3D WebGL UI<br/>&bull; Edge CDN deployment (Cloudflare / Firebase)", body)
        ]
    ]
    scope_tbl = Table(scope_data, colWidths=[270, 253])
    scope_tbl.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), BG_LIGHT),
        ('BOX', (0, 0), (-1, -1), 1, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(scope_tbl)
    story.append(Spacer(1, 6))

    # 3. SDLC Process Model Analysis
    story.append(Paragraph("2. Software Development Life Cycle (SDLC) Model", section_heading))
    story.append(HRFlowable(width="100%", thickness=1.5, color=TEAL, spaceBefore=1, spaceAfter=5))

    sdlc_rows = [
        [
            Paragraph("SDLC Model", tbl_header),
            Paragraph("Core Philosophy", tbl_header),
            Paragraph("Evaluation / Engineering Trade-offs", tbl_header),
            Paragraph("Suitability", tbl_header)
        ],
        [
            Paragraph("<b>Waterfall</b>", tbl_cell_bold),
            Paragraph("Linear-sequential phases (Reqs &rarr; Design &rarr; Code &rarr; Test).", tbl_cell),
            Paragraph("Rigid milestones; delays feedback until the end; unfeasible for iterative rule/schema changes.", tbl_cell),
            Paragraph("<font color='#DC2626'><b>Unsuitable</b></font>", tbl_cell)
        ],
        [
            Paragraph("<b>Spiral</b>", tbl_cell_bold),
            Paragraph("Risk-driven iterative cycles with formal risk assessment phases.", tbl_cell),
            Paragraph("Excellent for high-risk mission-critical systems; excessive administrative overhead for web applications.", tbl_cell),
            Paragraph("<font color='#D97706'><b>Sub-optimal</b></font>", tbl_cell)
        ],
        [
            Paragraph("<b>Agile Incremental</b>", tbl_cell_bold),
            Paragraph("Decomposes requirements into short sprints yielding working software.", tbl_cell),
            Paragraph("Rapid validation, continuous feedback, schema flexibility, parallel frontend & API iteration.", tbl_cell),
            Paragraph("<font color='#16A34A'><b>Selected (Optimal)</b></font>", tbl_cell)
        ]
    ]
    sdlc_tbl = Table(sdlc_rows, colWidths=[90, 140, 203, 90])
    sdlc_tbl.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('BOX', (0, 0), (-1, -1), 1, BORDER_COLOR),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(sdlc_tbl)
    
    sprint_text = Paragraph(
        "<b>Agile Sprint Plan:</b> "
        "<b>Sprint 1:</b> User Auth & Catalog Discovery &bull; "
        "<b>Sprint 2:</b> Registration Engine & Prerequisite Validation &bull; "
        "<b>Sprint 3:</b> Role Portals (Student/Instructor/Admin) &bull; "
        "<b>Sprint 4:</b> ACID Concurrency Verification, PWA Caching & Cloudflare Deployment.",
        body
    )
    story.append(Spacer(1, 3))
    story.append(sprint_text)
    story.append(Spacer(1, 6))

    # 4. Architecture & Data Flow (3-Tier & DFDs)
    story.append(Paragraph("3. 3-Tier Layered Architecture & Data Flow Diagrams (DFDs)", section_heading))
    story.append(HRFlowable(width="100%", thickness=1.5, color=TEAL, spaceBefore=1, spaceAfter=5))

    arch_rows = [
        [
            Paragraph("Layer / Tier", tbl_header),
            Paragraph("Technologies Used", tbl_header),
            Paragraph("Key Responsibilities & Components", tbl_header)
        ],
        [
            Paragraph("<b>Tier 1: Presentation</b>", tbl_cell_bold),
            Paragraph("React 18 SPA, TypeScript, Vite, Tailwind CSS, Three.js, GSAP 3", tbl_cell),
            Paragraph("Student Dashboard, Course Discovery Catalog, Instructor Portal, Admin Console.", tbl_cell)
        ],
        [
            Paragraph("<b>Tier 2: Application / API</b>", tbl_cell_bold),
            Paragraph("Node.js, Express.js REST API, TypeScript Controllers", tbl_cell),
            Paragraph("Identity Guard (JWT/Bcrypt), Credit Ceiling Guard (&le; 24), Prerequisite Graph Engine, Waitlist Manager.", tbl_cell)
        ],
        [
            Paragraph("<b>Tier 3: Persistence</b>", tbl_cell_bold),
            Paragraph("Prisma 5.x ORM, Relational SQLite (Dev) / PostgreSQL (Prod)", tbl_cell),
            Paragraph("ACID Transactions, User profiles, Departments, Courses, CourseSections, Enrollments, Waitlists.", tbl_cell)
        ]
    ]
    arch_tbl = Table(arch_rows, colWidths=[110, 160, 253])
    arch_tbl.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('BOX', (0, 0), (-1, -1), 1, BORDER_COLOR),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(arch_tbl)
    story.append(Spacer(1, 4))

    dfd_summary = Paragraph(
        "<b>DFD Levels Summary:</b><br/>"
        "&bull; <b>DFD Level 0 (Context):</b> External entities (<i>Student, Instructor, Admin</i>) exchange enrollments, grade updates, and curriculum definitions with Process 0.0.<br/>"
        "&bull; <b>DFD Level 1:</b> Central Process 1.0 coordinates data stores: <b>D1: USER_TABLE</b>, <b>D2: COURSE_TABLE</b>, <b>D3: SECTION_TABLE</b>, <b>D4: ENROLLMENT_TABLE</b>, <b>D5: WAITLIST_TABLE</b>.<br/>"
        "&bull; <b>DFD Level 2:</b> Sub-processes: <b>1.1</b> Authenticate & Verify &bull; <b>1.2</b> Catalog & Prereq Check &bull; <b>1.3</b> Capacity & Waitlist Assignment &bull; <b>1.4</b> Atomic Enrollment & Drop.",
        body
    )
    story.append(dfd_summary)
    story.append(Spacer(1, 6))

    # Page Break for clean 2-page flow
    story.append(PageBreak())

    # 5. Database Schema & Prisma Relational Models
    story.append(Paragraph("4. Relational Database Schema (Prisma Models)", section_heading))
    story.append(HRFlowable(width="100%", thickness=1.5, color=TEAL, spaceBefore=1, spaceAfter=5))

    schema_rows = [
        [
            Paragraph("Entity Model", tbl_header),
            Paragraph("Primary & Unique Attributes", tbl_header),
            Paragraph("Relationships & Foreign Keys", tbl_header),
            Paragraph("Constraints & Business Function", tbl_header)
        ],
        [
            Paragraph("<b>User</b>", tbl_cell_bold),
            Paragraph("<code>id (PK)</code>, <code>email (UQ)</code>, <code>studentId (UQ)</code>, <code>totalCredits</code>", tbl_cell),
            Paragraph("1:N with Enrollment, Waitlist, CourseSection", tbl_cell),
            Paragraph("Roles: <code>STUDENT</code>, <code>INSTRUCTOR</code>, <code>ADMIN</code>. Credit accumulator.", tbl_cell)
        ],
        [
            Paragraph("<b>Department</b>", tbl_cell_bold),
            Paragraph("<code>id (PK)</code>, <code>code (UQ)</code>, <code>name</code>", tbl_cell),
            Paragraph("1:N with Course", tbl_cell),
            Paragraph("Academic discipline segregation (CSE, ECE, MATH, BBA).", tbl_cell)
        ],
        [
            Paragraph("<b>Course</b>", tbl_cell_bold),
            Paragraph("<code>id (PK)</code>, <code>code (UQ)</code>, <code>title</code>, <code>credits (default 4)</code>", tbl_cell),
            Paragraph("M:N self via Prerequisite, 1:N Section", tbl_cell),
            Paragraph("Foreign key to Department. Base academic course record.", tbl_cell)
        ],
        [
            Paragraph("<b>Prerequisite</b>", tbl_cell_bold),
            Paragraph("<code>id (PK)</code>, <code>courseId</code>, <code>prereqCourseId</code>", tbl_cell),
            Paragraph("Bridge table for Course &harr; Course self-reference", tbl_cell),
            Paragraph("<code>@@unique([courseId, prereqCourseId])</code> with Cascade delete.", tbl_cell)
        ],
        [
            Paragraph("<b>CourseSection</b>", tbl_cell_bold),
            Paragraph("<code>id (PK)</code>, <code>sectionNumber</code>, <code>maxCapacity</code>, <code>room</code>", tbl_cell),
            Paragraph("FK to Course, Term, and Instructor User", tbl_cell),
            Paragraph("Represents concrete class offering. 1:N with ScheduleSlot, Enrollment.", tbl_cell)
        ],
        [
            Paragraph("<b>Enrollment</b>", tbl_cell_bold),
            Paragraph("<code>id (PK)</code>, <code>userId</code>, <code>sectionId</code>, <code>status</code>, <code>grade</code>", tbl_cell),
            Paragraph("FK to User and CourseSection", tbl_cell),
            Paragraph("<code>@@unique([userId, sectionId])</code>. Status: <code>ENROLLED</code>, <code>DROPPED</code>, <code>COMPLETED</code>.", tbl_cell)
        ],
        [
            Paragraph("<b>Waitlist</b>", tbl_cell_bold),
            Paragraph("<code>id (PK)</code>, <code>userId</code>, <code>sectionId</code>, <code>position</code>, <code>createdAt</code>", tbl_cell),
            Paragraph("FK to User and CourseSection", tbl_cell),
            Paragraph("<code>@@unique([userId, sectionId])</code>. Strict 1-based chronological FIFO queue.", tbl_cell)
        ]
    ]
    schema_tbl = Table(schema_rows, colWidths=[75, 145, 140, 163])
    schema_tbl.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('BOX', (0, 0), (-1, -1), 1, BORDER_COLOR),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(schema_tbl)
    story.append(Spacer(1, 6))

    # 6. Core Business Rules & Non-Functional Requirements
    story.append(Paragraph("5. Core Business Rules & Non-Functional Requirements (NFRs)", section_heading))
    story.append(HRFlowable(width="100%", thickness=1.5, color=TEAL, spaceBefore=1, spaceAfter=5))

    rules_data = [
        [
            Paragraph("<b>Core Business Rules:</b><br/>"
                      "&bull; <b>BR-01 (Credit Ceiling):</b> Strict limit of <b>&le; 24.0 credits</b> per semester.<br/>"
                      "&bull; <b>BR-02 (Prerequisites):</b> Requires completed prerequisite records with passing grade.<br/>"
                      "&bull; <b>BR-03 (Duplicate Prevention):</b> Blocks registering duplicate sections of same course.<br/>"
                      "&bull; <b>BR-04 (FIFO Queue Promotion):</b> Dropping a seat auto-promotes Position 1 waitlisted student.<br/>"
                      "&bull; <b>BR-05 (Term Window):</b> Mutations check <font face='Courier'>Term.registrationOpen === true</font>.", body),
            Paragraph("<b>NFRs & Security Standards:</b><br/>"
                      "&bull; <b>Performance:</b> Catalog queries &le; 100ms; mutations &le; 250ms; 1,000+ concurrent sessions.<br/>"
                      "&bull; <b>Password Security:</b> Salted Bcrypt hashing (work factor &ge; 10).<br/>"
                      "&bull; <b>Session Tokens:</b> Cryptographically signed JWT Bearer tokens (8h TTL).<br/>"
                      "&bull; <b>SQLi Defense:</b> Strongly-typed parameterized queries via Prisma ORM.<br/>"
                      "&bull; <b>Availability:</b> &ge; 99.9% uptime SLA during registration windows.", body)
        ]
    ]
    rules_tbl = Table(rules_data, colWidths=[260, 263])
    rules_tbl.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), BG_LIGHT),
        ('BOX', (0, 0), (-1, -1), 1, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(rules_tbl)
    story.append(Spacer(1, 6))

    # 7. Viva Q&A Ready Section
    story.append(Paragraph("6. Top High-Frequency Viva Questions & Model Answers", section_heading))
    story.append(HRFlowable(width="100%", thickness=1.5, color=TEAL, spaceBefore=1, spaceAfter=5))

    viva_list = [
        ("Q1: Why was the Agile Incremental model chosen over Waterfall?",
         "Waterfall delays testing until project completion and prevents dynamic adjustments. The <b>Agile Incremental model</b> decomposed development into 4 focused sprints (Auth &rarr; Engine &rarr; Portals &rarr; Cloud Integration), enabling test-driven validation of complex business rules and rapid stakeholder feedback."),
        ("Q2: How does the backend prevent race conditions and overbooking for the last seat?",
         "Enrollment execution is wrapped in an <b>atomic ACID transaction</b> using Prisma's <font face='Courier'>$transaction()</font>. The transaction locks the section record, verifies <font face='Courier'>enrolled &lt; maxCapacity</font>, increments the count, and inserts the enrollment record. If capacity is exhausted, the second transaction aborts cleanly and offers a FIFO waitlist slot."),
        ("Q3: How is the Prerequisite relationship structured in the database?",
         "It is implemented as a <b>self-referencing many-to-many relationship</b> on the <font face='Courier'>Course</font> entity via a junction table <font face='Courier'>Prerequisite(courseId, prereqCourseId)</font> backed by a composite unique constraint <font face='Courier'>@@unique([courseId, prereqCourseId])</font>."),
        ("Q4: How are 404 errors prevented on Cloudflare Pages and Firebase Hosting for SPA routes?",
         "Client-side routing (SPAs) requires web server rewrite fallbacks. We configured <font face='Courier'>_redirects</font> (<font face='Courier'>/* /index.html 200</font>) for Cloudflare Pages and <font face='Courier'>\"rewrites\": [{\"source\": \"**\", \"destination\": \"/index.html\"}]</font> in <font face='Courier'>firebase.json</font> so direct URL reloads route to the client app."),
        ("Q5: What is the algorithm for automated FIFO waitlist promotion?",
         "When an enrolled student drops a course, the system marks the enrollment as <font face='Courier'>DROPPED</font>, queries the <font face='Courier'>Waitlist</font> table for <font face='Courier'>position = 1</font>, verifies the candidate's credit ceiling (&le; 24 credits), creates an <font face='Courier'>ENROLLED</font> record, and decrements the rank of remaining waitlisted students by 1.")
    ]

    for q, a in viva_list:
        qa_block = [
            [Paragraph(f"<b>{q}</b>", qa_q)],
            [Paragraph(f"<b>Answer:</b> {a}", qa_a)]
        ]
        qa_tbl = Table(qa_block, colWidths=[523])
        qa_tbl.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#FFFFFF")),
            ('BOX', (0, 0), (-1, -1), 0.75, colors.HexColor("#CBD5E1")),
            ('LINELEFT', (0, 0), (0, -1), 2.5, TEAL),
            ('TOPPADDING', (0, 0), (-1, -1), 2.5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(qa_tbl)
        story.append(Spacer(1, 3))

    # Build Document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated PDF at: {filename}")

if __name__ == '__main__':
    target_path = r"C:\Users\adity\OneDrive\Desktop\My_Student_Academia_Exam_Viva_Cheatsheet.pdf"
    build_pdf(target_path)
