# Edge Case Checklist

Checklist มาตรฐานสำหรับใช้ในทุก mode ของ flow-discovery (ดัดแปลงจาก BMAD Edge Case Hunter)

ทุก subagent ต้องตรวจสอบ checklist นี้ — ถ้ายังไม่ได้ตรวจข้อใดให้ระบุเป็น "ต้องตรวจสอบเพิ่ม"

---

## Data Edge Cases
- [ ] ค่า null/undefined/empty ในทุก field
- [ ] ค่าที่ยาวเกิน limit (max length)
- [ ] ตัวอักษรพิเศษ / Unicode / emoji ในทุก input
- [ ] ตัวเลขติดลบ / ศูนย์ / max value / overflow
- [ ] วันที่ในอดีต / อนาคตไกล / leap year / timezone ต่างกัน
- [ ] ไฟล์ขนาด 0 / ขนาดใหญ่เกิน limit
- [ ] Duplicate data / ข้อมูลซ้ำ
- [ ] ข้อมูล format ผิด (email ไม่ถูกต้อง, เบอร์โทรมีตัวอักษร)
- [ ] HTML/Script injection ใน input fields

## State Edge Cases
- [ ] กดซ้ำ (double submit / double click)
- [ ] กด back แล้ว submit ใหม่
- [ ] เปิดหลาย tab ทำพร้อมกัน (same user, same action)
- [ ] Session หมดอายุระหว่างทำ
- [ ] Network ขาดแล้วกลับมา (offline/online toggle)
- [ ] Browser refresh ระหว่างทำ (F5 / Ctrl+R)
- [ ] ปิด browser แล้วเปิดใหม่ (state persistence)
- [ ] Deep link / bookmark ไปหน้าที่ต้อง login ก่อน

## Concurrency Edge Cases
- [ ] 2 คนแก้ข้อมูลเดียวกันพร้อมกัน (optimistic/pessimistic locking)
- [ ] Race condition ระหว่าง read/write
- [ ] Deadlock ระหว่าง transactions
- [ ] Message queue retry ทำให้ process ซ้ำ (idempotency)
- [ ] Concurrent API calls ที่ขัดแย้งกัน
- [ ] Background job ทำงานพร้อมกับ user action

## Business Logic Edge Cases
- [ ] ข้ามขั้นตอนที่ควรต้องทำ (skip step in wizard)
- [ ] ทำย้อนลำดับ (out-of-order operations)
- [ ] สิทธิ์เปลี่ยนระหว่างทำ (role changed mid-operation)
- [ ] Business rule ขัดแย้งกัน (conflicting rules)
- [ ] ข้อมูลอ้างอิงถูกลบระหว่างทำ (orphan reference / FK violation)
- [ ] ค่า boundary ของ business rule (exactly at limit)
- [ ] สถานะที่ไม่ควรเกิดแต่เกิดได้ (invalid state transition)

## Integration Edge Cases
- [ ] External API timeout
- [ ] External API return unexpected format / error code
- [ ] External API return partial data
- [ ] Database connection pool exhausted
- [ ] Disk full / memory full
- [ ] Queue/Kafka broker down
- [ ] DNS resolution failure
- [ ] SSL certificate expired
- [ ] Rate limiting hit (429 Too Many Requests)

## วิธีใช้

1. ทุก subagent ได้รับ checklist นี้เป็น input
2. วิเคราะห์จากมุมมองของตัวเอง (End User, Hacker, SRE, etc.)
3. สำหรับทุก checkbox ที่เกี่ยวข้อง → ระบุ finding ที่พบ
4. checkbox ที่ไม่เกี่ยวข้อง → ข้ามได้
5. checkbox ที่ไม่แน่ใจ → ระบุ "ต้องตรวจสอบเพิ่ม"
