# Internet Research Guide

คู่มือการค้นหาข้อมูลจาก internet เพื่อเสริม findings ให้สมจริง

---

## เครื่องมือ

| เครื่องมือ | ใช้ทำอะไร | เมื่อไหร่ |
|-----------|----------|----------|
| **Firecrawl** (หลัก) | Search, scrape เว็บ, อ่าน documentation | ทุกครั้งที่ต้องค้นหา |
| **Graph Brain** (เสริม) | Save research results ไว้ใช้ซ้ำ | หลังค้นเสร็จ + ก่อนค้นใหม่ (เช็คว่ามีแล้วหรือยัง) |

## 3 Layers ของ Research

### Layer 1: Problem Research — ค้นหาปัญหาจริงที่ users เจอ

**Search Queries Template:**
```
"common issues in [domain] systems"
"[domain] user complaints site:reddit.com"
"[domain] UX problems"
"[domain] app reviews negative"
"[platform type] accessibility issues"
"[domain] error patterns site:stackoverflow.com"
"[domain] checkout abandonment causes"  (ถ้าเป็น e-commerce)
"[domain] onboarding friction"
```

**แหล่งข้อมูล:**
- Reddit (r/webdev, r/userexperience, r/[domain])
- Stack Overflow (error patterns)
- App Store / Play Store reviews (ถ้าเป็น mobile)
- UX case studies (Nielsen Norman Group, Baymard Institute)
- Product Hunt (user feedback)

**Output Format:**
| # | ปัญหา | แหล่งที่มา | ความถี่ | เกี่ยวข้องกับระบบเรา |
|---|--------|-----------|---------|-------------------|

### Layer 2: Compliance & Regulation — กฎหมาย/มาตรฐาน

**Search Queries Template:**
```
"PDPA requirements for [domain]"
"[domain] data protection regulations Thailand"
"HIPAA requirements [domain]"  (healthcare)
"PCI-DSS requirements"  (payment)
"ธปท. regulations [domain]"  (finance)
"WCAG 2.1 requirements [platform type]"
"ISO 27001 [domain]"
"common compliance violations [domain]"
"[domain] legal requirements Thailand"
```

**แหล่งข้อมูล:**
- PDPC (สำนักงานคณะกรรมการคุ้มครองข้อมูลส่วนบุคคล)
- ธปท. (ธนาคารแห่งประเทศไทย)
- W3C / WCAG
- ISO standards
- กฎหมายเฉพาะทาง (พ.ร.บ. คอมพิวเตอร์, พ.ร.บ. ธุรกรรมอิเล็กทรอนิกส์)

**Output Format:**
| # | กฎหมาย/มาตรฐาน | ข้อกำหนดสำคัญ | ระบบเรา comply หรือยัง |
|---|----------------|-------------|---------------------|

### Layer 3: Competitive Analysis — คู่แข่ง/ระบบคล้ายกัน

**Search Queries Template:**
```
"[competitor name] features"
"[domain] best practices workflow"
"[domain] system comparison"
"best [domain] apps Thailand"
"[competitor] vs [competitor] features"
"[domain] industry benchmark"
"how does [competitor] handle [specific flow]"
```

**แหล่งข้อมูล:**
- คู่แข่ง websites / documentation
- G2, Capterra (software reviews)
- Industry reports
- Blog posts / case studies

**Output Format:**
| # | ระบบ | Feature ที่น่าสนใจ | ระบบเรามีหรือยัง |
|---|------|------------------|----------------|

## ตัวอย่าง Queries ตาม Domain

### E-Commerce
```
"e-commerce checkout abandonment reasons"
"shopping cart UX problems"
"PDPA requirements for e-commerce Thailand"
"Shopee features vs Lazada features"
```

### Healthcare
```
"healthcare app usability issues"
"patient portal common complaints"
"HIPAA common violations healthcare apps"
"ระบบนัดหมอออนไลน์ ปัญหา"
```

### Finance / Banking
```
"mobile banking UX issues"
"payment gateway error patterns"
"ธปท. regulations mobile payment"
"PromptPay integration issues"
```

### HR / Internal Systems
```
"HR system usability issues"
"leave management system problems"
"employee self-service portal complaints"
"พ.ร.บ. คุ้มครองแรงงาน requirements"
```

## Graph Brain Integration

**Save results หลังค้นเสร็จ:**
```
mcp__graph-brain__save-knowledge({
  title: "Research: [topic] — [layer]",
  content: "[research results summary]",
  tags: ["flow-discovery", "research", "[domain]", "[layer]"]
})
```

**Check ก่อนค้นใหม่:**
```
mcp__graph-brain__search-knowledge({
  query: "[topic] [domain]"
})
```
ถ้ามีผลลัพธ์อยู่แล้วและยังไม่เก่าเกินไป (< 30 วัน) → ใช้ผลลัพธ์เดิม
