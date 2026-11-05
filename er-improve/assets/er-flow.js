/*
 * CHANGE-01 — ที่เก็บข้อมูลจำลองสำหรับทดลองใช้งานต่อเนื่อง (MOCKUP เท่านั้น — ศูนย์ดิจิทัลไม่ต้องนำไปใช้)
 * ระบบจริง: ส่วนนี้คือฐานข้อมูล KPHIS / HOSxP
 * เก็บใน localStorage ของเบราว์เซอร์ที่ใช้ทดลอง · ข้อมูลผู้ป่วยทั้งหมดเป็นข้อมูลสมมติ
 */
(function (root) {
    'use strict';
    var KEY = 'kphisER.flow.v1';
    var mem = null;

    function iso(minAgo) { return new Date(Date.now() - (minAgo || 0) * 60000).toISOString(); }
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function vnFrom(d) {
        d = new Date(d);
        return String((d.getFullYear() + 543) % 100) + pad(d.getMonth() + 1) + pad(d.getDate()) +
            pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds());
    }

    // ผู้ป่วยสมมติที่จะ "สแกน" เข้ามาเรื่อยๆ
    var POOL = [
        { name: 'นายเกรียงไกร ศรีสุข', sex: 'ชาย', age_y: 23, right: '(89) บัตรประกันสุขภาพถ้วนหน้า (ในเขต)', allergy: '' },
        { name: 'นางสมพร มีทรัพย์', sex: 'หญิง', age_y: 61, right: '(UC) บัตรทอง', allergy: 'ASPIRIN=ผื่น' },
        { name: 'นายอดิศร พึ่งบุญ', sex: 'ชาย', age_y: 38, right: '(SS) ประกันสังคม', allergy: '' },
        { name: 'ด.ญ.ปุณิกา ใจดี', sex: 'หญิง', age_y: 4, right: '(89) บัตรประกันสุขภาพถ้วนหน้า (ในเขต)', allergy: '' },
        { name: 'นายบุญมา คำแสน', sex: 'ชาย', age_y: 79, right: '(CS) ข้าราชการ', allergy: 'SULFA=ผื่น' },
        { name: 'นางสาวกนกวรรณ แก้วตา', sex: 'หญิง', age_y: 19, right: '(89) บัตรประกันสุขภาพถ้วนหน้า (ในเขต)', allergy: '' },
        { name: 'นายประยูร ทองมา', sex: 'ชาย', age_y: 55, right: '(UC) บัตรทอง', allergy: '' },
        { name: 'นางทองใบ สายสุด', sex: 'หญิง', age_y: 70, right: '(CS) ข้าราชการ', allergy: 'PENICILLIN=หายใจลำบาก' }
    ];

    function mk(p, minAgo, qn, hn) {
        var arrive = iso(minAgo);
        return {
            id: 'c' + qn, vn: vnFrom(arrive), hn: hn, qn: qn, name: p.name, sex: p.sex, age_y: p.age_y,
            right: p.right, allergy: p.allergy, arrive: arrive, status: 'wait_triage', triage: null, history: []
        };
    }

    function seed() {
        var c1 = mk({ name: 'นางสาวพรทิพย์ ใจงาม', sex: 'หญิง', age_y: 45, right: '(SS) ประกันสังคม', allergy: '' }, 6, 31, '000812345');
        var c2 = mk({ name: 'นายวิชัย แก้วมณี', sex: 'ชาย', age_y: 67, right: '(CS) ข้าราชการ', allergy: 'IBUPROFEN=หน้าบวม' }, 14, 29, '000534981');
        var c3 = mk({ name: 'ด.ช.ธนกร สมบูรณ์', sex: 'ชาย', age_y: 8, right: '(89) บัตรประกันสุขภาพถ้วนหน้า (ในเขต)', allergy: '' }, 3, 32, '000902117');

        var t1 = mk({ name: 'นายสมศักดิ์ ทองดี', sex: 'ชาย', age_y: 72, right: '(CS) ข้าราชการ', allergy: '' }, 35, 27, '000277310');
        t1.status = 'triaged'; t1.triagedAt = iso(28); t1.triagedBy = 'พว.ทดสอบ คัดกรอง';
        t1.triage = {
            cc: 'แขนขาซ้ายอ่อนแรง พูดไม่ชัด 1 ชม. ก่อนมา', type: 'nontrauma',
            bt: '36.8', pr: '96', sbp: '178', dbp: '96', rr: '20', spo2: '97', on_o2: false, dtx: '142', pain: '',
            gcs_e: '4', gcs_v: '5', gcs_m: '6', alcohol: 'no', smoke: 'quit',
            fasttrack: ['stroke45'], lkw: iso(95).slice(0, 16), resources: '2',
            level: 'E', suggested: 'E', news2: 1, sirs: 1
        };
        var t2 = mk({ name: 'นางลำดวน พรมมา', sex: 'หญิง', age_y: 54, right: '(UC) บัตรทอง', allergy: '' }, 50, 25, '000661204');
        t2.status = 'triaged'; t2.triagedAt = iso(44); t2.triagedBy = 'พว.ทดสอบ คัดกรอง';
        t2.triage = {
            cc: 'ไข้ หนาวสั่น ปัสสาวะแสบขัด 2 วัน', type: 'nontrauma',
            bt: '39.2', pr: '118', sbp: '96', dbp: '58', rr: '24', spo2: '95', on_o2: false, dtx: '', pain: '4',
            gcs_e: '4', gcs_v: '5', gcs_m: '6', alcohol: 'no', smoke: 'no',
            fasttrack: ['sepsis'], resources: '2', level: 'E', suggested: 'E', news2: 7, sirs: 3
        };
        var st = { v: 1, nextQn: 33, poolIdx: 0, cases: [t2, t1, c2, c1, c3], notifications: [] };
        t1.team = 2; t1.bed = '16'; t2.team = 1; t2.bed = '5';
        addBoardSeeds(st);
        return st;
    }

    // ---------- CHANGE-03: เคสบนกระดาน (อยู่ใน ER แล้ว) ----------
    function tri(level, cc, extra) {
        var t = { cc: cc, type: 'nontrauma', level: level, suggested: level, fasttrack: [], gcs_e: '4', gcs_v: '5', gcs_m: '6' };
        for (var k in (extra || {})) t[k] = extra[k];
        return t;
    }
    function ord(text, minAgo, acc, stat) { return { id: 'o' + Math.random().toString(36).slice(2, 8), text: text, stat: !!stat, at: iso(minAgo), by: '', acceptedAt: acc === null ? null : iso(acc) }; }
    function bc(p, o) {
        var c = mk(p, o.arrMin, o.qn, o.hn);
        c.status = o.status || 'triaged'; c.triagedAt = iso(o.arrMin - 4); c.triagedBy = 'พว.ทดสอบ คัดกรอง';
        c.triage = o.triage; c.team = o.team; c.bed = o.bed || ''; c.exam = o.exam || 'wait';
        c.dx = o.dx || ''; c.doctor = o.doctor || ''; c.lab = o.lab || { total: 0, reported: 0 }; c.xray = o.xray || '';
        c.orders = o.orders || [];
        if (o.endMin !== undefined) { c.endAt = iso(o.endMin); c.disposition = o.disp; }
        return c;
    }
    function addBoardSeeds(st) {
        var D1 = 'นพ.วิชัย รักษาดี', D2 = 'พญ.สุดา ใจเย็น', D3 = 'นพ.อนันต์ ช่วยชีวิต';
        var B = [
            bc({ name: 'นายสมชาย ตัวอย่างดี', sex: 'ชาย', age_y: 58, right: '(89) บัตรประกันสุขภาพถ้วนหน้า (ในเขต)', allergy: 'PENICILLIN=ผื่นคัน, IBUPROFEN=หน้าบวม' },
                { arrMin: 105, qn: 15, hn: '000123456', team: 1, bed: '1', exam: 'done', dx: 'Acute anterior wall STEMI', doctor: D1, lab: { total: 6, reported: 5 }, xray: 'done',
                  triage: tri('R', 'Chest pain 1 ชม. ก่อนมา, EKG ST elevation V1-V4', { fasttrack: ['acs'], bt: '36.9', pr: '104', sbp: '150', dbp: '92', rr: '24', spo2: '95' }),
                  orders: [ord('Heparin 1,000 unit/hr drip', 6, null, true), ord('Trop-I ซ้ำ 3 ชม.', 30, 25)] }),
            bc({ name: 'นางบุญมี สุขใจ', sex: 'หญิง', age_y: 72, right: '(CS) ข้าราชการ', allergy: '' },
                { arrMin: 70, qn: 18, hn: '000245781', team: 1, bed: '2', exam: 'reexam', dx: 'COPD with AE', doctor: D2, lab: { total: 3, reported: 3 }, xray: 'done',
                  triage: tri('R', 'Dyspnea, COPD AE, on O2 mask c bag 10 LPM', { bt: '37.8', pr: '122', sbp: '138', dbp: '80', rr: '32', spo2: '86', on_o2: true }),
                  orders: [ord('Berodual NB q 20 min x 3', 4, null, true), ord('ABG ซ้ำหลัง NB', 4, null, false)] }),
            bc({ name: 'เด็กชายภูมิ ทดลองใช้', sex: 'ชาย', age_y: 2, right: '(89) บัตรประกันสุขภาพถ้วนหน้า (ในเขต)', allergy: '' },
                { arrMin: 55, qn: 21, hn: '000331209', team: 2, bed: '12', exam: 'reexam', dx: 'Simple febrile seizure', doctor: D2, lab: { total: 2, reported: 1 },
                  triage: tri('E', 'ไข้สูง ชัก 1 ครั้ง ที่บ้าน', { bt: '39.6', pr: '150', rr: '36', spo2: '97' }), orders: [ord('Paracetamol syr 15 mg/kg', 20, 15)] }),
            bc({ name: 'นายประเสริฐ มีสุข', sex: 'ชาย', age_y: 34, right: '(SS) ประกันสังคม', allergy: '' },
                { arrMin: 40, qn: 24, hn: '000412378', team: 2, bed: '14', exam: 'done', dx: 'Laceration wound Rt. forearm 5 cm', doctor: D3, xray: 'done',
                  triage: tri('U', 'MVA, laceration wound Rt. forearm 5 cm\nบาดเจ็บ: แขนขวา', { type: 'trauma' }),
                  orders: [ord('Suture wound + TT 0.5 ml IM', 10, null, false)] }),
            bc({ name: 'นางสาวกานดา แสงดี', sex: 'หญิง', age_y: 25, right: '(UC) บัตรทอง', allergy: '' },
                { arrMin: 30, qn: 27, hn: '000527741', team: 3, bed: '21', exam: 'reexam', dx: 'R/O acute appendicitis', doctor: D3, lab: { total: 4, reported: 3 }, xray: 'wait',
                  triage: tri('U', 'Abdominal pain RLQ 1 วัน'), orders: [ord('NPO, IV 0.9% NSS 100 ml/hr', 25, 22)] }),
            bc({ name: 'นายสุรชัย ทองคำ', sex: 'ชาย', age_y: 66, right: '(CS) ข้าราชการ', allergy: '' },
                { arrMin: 150, qn: 9, hn: '000611002', team: 3, bed: '31', exam: 'done', dx: 'Hypoglycemia', doctor: D1, lab: { total: 1, reported: 1 },
                  triage: tri('L', 'Hypoglycemia, DTX 45 mg% → หลังให้ 50% glucose 50 ml DTX 120') }),
            bc({ name: 'นางมณี ศรีสวัสดิ์', sex: 'หญิง', age_y: 49, right: '(UC) บัตรทอง', allergy: '' },
                { arrMin: 18, qn: 30, hn: '000704455', team: 3, bed: '32', exam: 'wait', triage: tri('L', 'Vertigo, N/V') }),
            bc({ name: 'นายเอกชัย พรหมทา', sex: 'ชาย', age_y: 30, right: '(SS) ประกันสังคม', allergy: '' },
                { arrMin: 22, qn: 28, hn: '000713320', team: 3, bed: '', exam: 'wait', triage: tri('N', 'ไข้ เจ็บคอ 2 วัน') }),
            // จบเคสแล้วในเวร
            bc({ name: 'นางประไพ คงดี', sex: 'หญิง', age_y: 81, right: '(CS) ข้าราชการ', allergy: '' },
                { arrMin: 200, qn: 4, hn: '000188420', team: 1, bed: '2', exam: 'done', status: 'admit', disp: 'admit', endMin: 80, dx: 'Septic shock, pneumonia', doctor: D1, lab: { total: 7, reported: 7 }, xray: 'done',
                  triage: tri('R', 'หอบเหนื่อย ซึมลง', { fasttrack: ['sepsis'] }) }),
            bc({ name: 'นายธนา ใจซื่อ', sex: 'ชาย', age_y: 41, right: '(SS) ประกันสังคม', allergy: '' },
                { arrMin: 180, qn: 6, hn: '000390117', team: 2, bed: '14', exam: 'done', status: 'dc', disp: 'dc', endMin: 95, dx: 'Renal colic', doctor: D3, lab: { total: 2, reported: 2 }, xray: 'done',
                  triage: tri('U', 'ปวดเอวขวาร้าวลงขาหนีบ') }),
            bc({ name: 'ด.ญ.ใบเตย ศรีงาม', sex: 'หญิง', age_y: 6, right: '(89) บัตรประกันสุขภาพถ้วนหน้า (ในเขต)', allergy: '' },
                { arrMin: 130, qn: 11, hn: '000455092', team: 2, bed: '31', exam: 'done', status: 'dc', disp: 'dc', endMin: 40, dx: 'Acute gastroenteritis', doctor: D2, lab: { total: 0, reported: 0 },
                  triage: tri('L', 'ถ่ายเหลว 5 ครั้ง อาเจียน') })
        ];
        st.cases = st.cases.concat(B);
        st.v = 3;
        addCaseSeeds(st); orderFormat(st); st.v = 6;
    }
    // CHANGE-07: ตัวอย่างบันทึกการรักษาของเคส STEMI / COPD
    function addCaseSeeds(st) {
        st.cases.forEach(function (c) {
            if (c.hn === '000123456' && !(c.notes || []).length) {
                var b1 = iso(95), b2 = iso(70);
                c.orders = [
                    { id: 'o11', block: b1, at: b1, by: 'นพ.วิชัย รักษาดี', text: 'EKG 12 leads', stat: true, acceptedAt: iso(93), acceptedBy: 'พว.ศิริพร ดูแลดี' },
                    { id: 'o12', block: b1, at: b1, by: 'นพ.วิชัย รักษาดี', text: 'CBC, BUN, Cr, Elyte, Trop-I', stat: true, acceptedAt: iso(93), acceptedBy: 'พว.ศิริพร ดูแลดี' },
                    { id: 'o13', block: b1, at: b1, by: 'นพ.วิชัย รักษาดี', text: 'ASPIRIN 300 MG TAB 1 tab เคี้ยวทันที', stat: true, acceptedAt: iso(92), acceptedBy: 'พว.ศิริพร ดูแลดี' },
                    { id: 'o14', block: b1, at: b1, by: 'นพ.วิชัย รักษาดี', text: 'CLOPIDOGREL 75 MG TAB 4 tab oral ทันที (Loading)', stat: true, acceptedAt: iso(92), acceptedBy: 'พว.ศิริพร ดูแลดี' },
                    { id: 'o15', block: b1, at: b1, by: 'นพ.วิชัย รักษาดี', text: 'On cardiac monitor, O2 cannula 3 LPM keep SpO2 > 94%', stat: false, acceptedAt: iso(91), acceptedBy: 'พว.ศิริพร ดูแลดี' },
                    { id: 'o16', block: b2, at: b2, by: 'นพ.วิชัย รักษาดี', text: 'HEPARIN 4,000 unit IV bolus then 1,000 unit/hr drip', stat: true, acceptedAt: null },
                    { id: 'o17', block: b2, at: b2, by: 'นพ.วิชัย รักษาดี', text: 'Trop-I ซ้ำ 3 ชม.', stat: false, acceptedAt: iso(60), acceptedBy: 'พว.ศิริพร ดูแลดี' }
                ];
                c.notes = [
                    { id: 'n11', at: iso(96), by: 'นพ.วิชัย รักษาดี', role: 'doctor', text: 'S: ชายไทย 58 ปี เจ็บแน่นหน้าอกซ้าย ร้าวไปแขนซ้าย 1 ชม. ก่อนมา เหงื่อแตก ใจสั่น\nO: BP 150/92, PR 104, RR 24, SpO2 95% RA, EKG: ST elevation V1-V4\nA: Acute anterior wall STEMI\nP: ACS fast track, Aspirin + Clopidogrel, Heparin, consult Cardio Med., เตรียม refer PCI' },
                    { id: 'n12', at: iso(40), by: 'นพ.วิชัย รักษาดี', role: 'doctor', text: 'Trop-I 2.45 ng/ml (สูง), Cardio Med. รับ case แนะนำ refer ทำ Primary PCI\nญาติรับทราบและยินยอม refer' }
                ];
                c.nnotes = [
                    { id: 'v11', at: iso(90), by: 'พว.ศิริพร ดูแลดี', bt: '36.9', pr: '102', sbp: '148', dbp: '90', rr: '22', spo2: '97', pain: '8', note: 'On monitor, O2 cannula 3 LPM, ให้ ASA 300 mg เคี้ยว + Clopidogrel 300 mg แล้ว' },
                    { id: 'v12', at: iso(60), by: 'พว.ศิริพร ดูแลดี', bt: '37.0', pr: '96', sbp: '138', dbp: '84', rr: '20', spo2: '98', pain: '5', note: 'หลังได้ ISDN SL 1 เม็ด pain score ลดลงจาก 8 เป็น 5' }
                ];
            }
            if (c.hn === '000245781' && !(c.notes || []).length) {
                c.notes = [{ id: 'n21', at: iso(60), by: 'พญ.สุดา ใจเย็น', role: 'doctor', text: 'S: หอบเหนื่อยมากขึ้น 1 วัน ไอมีเสมหะเหลือง\nO: RR 32, SpO2 86% RA, wheezing both lungs\nA: COPD with AE\nP: Berodual NB, Dexamethasone, ABG, CXR, ประเมินซ้ำหลัง NB' }];
            }
        });
    }

    // CHANGE-09: order แบบต้นฉบับ — ยา = ชื่อยา (สีน้ำเงิน) + วิธีใช้บรรทัดล่าง
    function orderFormat(st) {
        var MED = {
            'ASPIRIN 300 MG TAB 1 tab เคี้ยวทันที': ['ASPIRIN 300 MG TAB', '1 tab เคี้ยวทันที'],
            'CLOPIDOGREL 75 MG TAB 4 tab oral ทันที (Loading)': ['CLOPIDOGREL 75 MG TAB', '4 tab oral ทันที (Loading)'],
            'HEPARIN 4,000 unit IV bolus then 1,000 unit/hr drip': ['HEPARIN 5,000 UNIT/ML INJ', '4,000 unit IV bolus then 1,000 unit/hr drip'],
            'Heparin 1,000 unit/hr drip': ['HEPARIN 5,000 UNIT/ML INJ', '1,000 unit/hr IV drip'],
            'Berodual NB q 20 min x 3': ['BERODUAL NB', '1 NB q 20 min x 3'],
            'Paracetamol syr 15 mg/kg': ['PARACETAMOL 120 MG/5 ML SYR', '15 mg/kg oral prn ไข้'],
            'NPO, IV 0.9% NSS 100 ml/hr': ['', '']
        };
        st.cases.forEach(function (c) {
            var add = [];
            (c.orders || []).forEach(function (o) {
                if (o.cat) return;
                var m = MED[o.text];
                if (o.text === 'NPO, IV 0.9% NSS 100 ml/hr') { o.cat = 'other'; o.text = 'NPO'; add.push({ id: o.id + 'b', block: o.block || o.at, at: o.at, by: o.by, cat: 'ivfluid', text: '0.9% NaCl 1000 ml rate 100 ml/hr', stat: false, acceptedAt: o.acceptedAt, acceptedBy: o.acceptedBy }); }
                else if (m) { o.cat = 'med'; o.text = m[0]; o.sig = m[1]; }
                else if (/EKG|CXR|Film/i.test(o.text)) o.cat = 'xray';
                else if (/CBC|Trop|BUN|ABG|Lactate/i.test(o.text)) o.cat = 'lab';
                else o.cat = 'other';
            });
            if (add.length) c.orders = c.orders.concat(add);
        });
    }

    // CHANGE-12: ทีมรักษาสลับ 1 → 2 → 1 ... อัตโนมัติ แยกนับแต่ละระดับ (ไม่ขึ้นกับเวร)
    var TEAMS = ['1', '2'];
    function peekTeam(level) { var st = mem || {}; var n = ((st.teamNext || {})[level || 'N']) || 0; return TEAMS[n % TEAMS.length]; }
    function takeTeam(level) {
        var st = mem; st.teamNext = st.teamNext || {}; var k = level || 'N', n = st.teamNext[k] || 0;
        st.teamNext[k] = n + 1; return TEAMS[n % TEAMS.length];
    }

    function ensure(c) {
        if (c.status === 'triaged') {
            if (!c.exam) c.exam = 'wait';
            if (c.team === undefined) c.team = '';
            if (c.bed === undefined) c.bed = '';
            if (!c.lab) c.lab = { total: 0, reported: 0 };
            if (c.xray === undefined) c.xray = '';
            if (!c.orders) c.orders = [];
            if (!c.doctor) c.doctor = '';
            if (!c.dx) c.dx = '';
        }
        // CHANGE-07: บันทึกการรักษา
        if (!c.notes) c.notes = [];       // progress note [{id, at, by, role, text}]
        if (!c.nnotes) c.nnotes = [];     // nurse note timeline [{id, at, by, bt, pr, sbp, dbp, rr, spo2, pain, note}]
        if (!c.orders) c.orders = [];
        c.orders.forEach(function (o) { if (!o.block) o.block = o.at; if (!o.by) o.by = c.doctor || 'แพทย์'; });
        return c;
    }

    function load() {
        if (mem) return mem;
        if (R.on && !R.ready) return { cases: [], notifications: [] };
        try { var s = localStorage.getItem(KEY); if (s) mem = JSON.parse(s); } catch (e) { }
        if (!mem || !mem.cases) { mem = seed(); save(); }
        if (!mem.v || mem.v < 2) { addBoardSeeds(mem); save(); }   // ข้อมูลทดลองจากรุ่นก่อน → เติมเคสกระดาน
        if (mem.v < 3) {   // CHANGE-04: เตียงเป็นตัวเลข (รูปแบบ ทีม/เตียง เช่น 1/36)
            var BM = {"Resus 1": "1", "Resus 2": "2", "Urgent 1": "12", "Urgent 2": "14", "Semi 1": "21", "Obs 1": "31", "Obs 2": "32"};
            mem.cases.forEach(function (c) { if (c.bed && BM[c.bed]) c.bed = BM[c.bed]; });
            mem.v = 3; save();
        }
        if (mem.v < 4) { addCaseSeeds(mem); mem.v = 4; save(); }   // CHANGE-07
        if (mem.v < 5) { orderFormat(mem); mem.v = 5; save(); }    // CHANGE-09
        if (mem.v < 6) {   // CHANGE-12: เคสที่ยังไม่มีทีม → จัดทีมอัตโนมัติตามลำดับเวลา triage
            mem.cases.filter(function (c) { return c.status !== 'wait_triage' && !c.team && c.triage; })
                .sort(function (a, b) { return new Date(a.triagedAt) - new Date(b.triagedAt); })
                .forEach(function (c) { c.team = takeTeam(c.triage.level); });
            mem.v = 6; save();
        }
        mem.cases.forEach(ensure);
        return mem;
    }
    function save() {
        if (R.on) return R.push();
        try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) { }
    }

    // ================= CHANGE-13: ฐานข้อมูลกลาง (Firebase Firestore, realtime) =================
    // ถ้ามี window.KPHIS_FIREBASE (assets/firebase-config.js) → ทุกเครื่องใช้ข้อมูลชุดเดียวกัน
    // ถ้าไม่มี → เก็บในเบราว์เซอร์เครื่องนี้ (localStorage) เหมือนเดิม
    var R = { on: false, ready: false, synced: {}, metaSynced: '', fs: null, error: null };
    var META_KEYS = ['v', 'nextQn', 'poolIdx', 'teamNext', 'notifications'];
    function clean(o) { return JSON.parse(JSON.stringify(o)); }
    function metaOf(st) { var m = {}; META_KEYS.forEach(function (k) { if (st[k] !== undefined) m[k] = st[k]; }); return m; }
    function assignInPlace(target, src) {
        Object.keys(target).forEach(function (k) { if (!(k in src)) delete target[k]; });
        Object.keys(src).forEach(function (k) { target[k] = src[k]; });
    }
    function fire() {
        try { root.dispatchEvent(new Event('erflow-remote')); } catch (e) { }
        try { root.dispatchEvent(new Event('storage')); } catch (e) { }
    }
    R.col = function (n) { return R.fs.collection((root.KPHIS_FIREBASE.prefix || 'kphis_er_demo') + '_' + n); };
    R.push = function () {
        if (!R.ready || !mem) return;
        var ids = {};
        mem.cases.forEach(function (c) {
            ids[c.id] = 1;
            var j = JSON.stringify(c);
            if (R.synced[c.id] !== j) { R.synced[c.id] = j; R.col('cases').doc(c.id).set(JSON.parse(j)).catch(R.fail); }
        });
        Object.keys(R.synced).forEach(function (id) { if (!ids[id]) { delete R.synced[id]; R.col('cases').doc(id).delete().catch(R.fail); } });
        var mj = JSON.stringify(metaOf(mem));
        if (mj !== R.metaSynced) { R.metaSynced = mj; R.col('meta').doc('state').set(JSON.parse(mj)).catch(R.fail); }
    };
    R.fail = function (e) { R.error = e; if (root.console) console.error('[ERFlow] Firestore', e); R.badge(); };
    R.badge = function () {
        var go = function () {
            var el = document.getElementById('erflow-net');
            if (!el) { el = document.createElement('div'); el.id = 'erflow-net'; document.body.appendChild(el); }
            el.style.cssText = 'position:fixed;left:10px;bottom:10px;z-index:2500;font-size:12px;padding:3px 8px;border-radius:4px;box-shadow:0 1px 3px rgba(0,0,0,.2);background:' + (R.error ? '#f8d7da;color:#842029' : R.on ? '#d1e7dd;color:#0f5132' : '#e9ecef;color:#495057');
            el.textContent = R.error ? '● ฐานข้อมูลกลางมีปัญหา — ' + (R.error.code || R.error.message || R.error) : R.on ? '● ออนไลน์ — ข้อมูลร่วมทุกเครื่อง · ข้อมูลสมมติเท่านั้น' : '● เครื่องนี้เท่านั้น (ไม่ได้เชื่อมฐานข้อมูลกลาง)';
        };
        if (document.body) go(); else document.addEventListener('DOMContentLoaded', go);
    };
    function remoteStart() {
        var cfg = root.KPHIS_FIREBASE;
        if (!cfg || !root.firebase || !cfg.apiKey) { R.badge(); return; }
        try {
            if (!root.firebase.apps.length) root.firebase.initializeApp(cfg);
            R.fs = root.firebase.firestore();
        } catch (e) { R.fail(e); return; }
        R.on = true;
        var hold = !!(root.jQuery && root.jQuery.holdReady);
        if (hold) root.jQuery.holdReady(true);   // รอข้อมูลชุดแรกก่อนหน้าเริ่มทำงาน
        var gotMeta = false, gotCases = false, meta = null, docs = {};
        var released = false;
        function release() { if (released) return; released = true; if (hold) root.jQuery.holdReady(false); }
        var timer = setTimeout(function () { if (!R.ready) { R.fail({ message: 'เชื่อมต่อไม่ได้ (หมดเวลา) — ใช้ข้อมูลเครื่องนี้แทน' }); R.on = false; mem = null; load(); release(); } }, 10000);
        function first() {
            if (!gotMeta || !gotCases || R.ready) return;
            clearTimeout(timer);
            if (!meta) {   // ฐานข้อมูลว่าง → ลงข้อมูลตัวอย่าง
                mem = seed(); mem.cases.forEach(ensure); R.ready = true; R.push();
            } else {
                mem = meta; mem.cases = Object.keys(docs).map(function (k) { return docs[k]; })
                    .sort(function (a, b) { return new Date(a.arrive) - new Date(b.arrive); });
                mem.cases.forEach(function (c) { R.synced[c.id] = JSON.stringify(c); ensure(c); });
                if (!mem.notifications) mem.notifications = [];
                R.metaSynced = JSON.stringify(metaOf(mem));
                R.ready = true;
            }
            R.badge(); release();
        }
        R.col('meta').doc('state').onSnapshot(function (snap) {
            var d = snap.exists ? snap.data() : null;
            if (!R.ready) { meta = d; gotMeta = true; return first(); }
            if (!d) return;
            var j = JSON.stringify(metaOf(d)); if (j === R.metaSynced) return;
            R.metaSynced = j; META_KEYS.forEach(function (k) { if (d[k] !== undefined) mem[k] = d[k]; }); fire();
        }, R.fail);
        R.col('cases').onSnapshot(function (qs) {
            if (!R.ready) { qs.docs.forEach(function (d) { docs[d.id] = d.data(); }); gotCases = true; return first(); }
            var changed = false;
            qs.docChanges().forEach(function (ch) {
                var id = ch.doc.id;
                if (ch.type === 'removed') {
                    if (R.synced[id] === undefined) return;
                    delete R.synced[id]; mem.cases = mem.cases.filter(function (c) { return c.id !== id; }); changed = true; return;
                }
                var data = ch.doc.data(), j = JSON.stringify(data);
                if (R.synced[id] === j) return;
                R.synced[id] = j; changed = true;
                var cur = mem.cases.filter(function (c) { return c.id === id; })[0];
                if (cur) assignInPlace(cur, data); else mem.cases.push(data);
                ensure(cur || data);
            });
            if (changed) fire();
        }, R.fail);
    }

    var ERFlow = {
        load: load,
        save: save,
        reset: function () { mem = seed(); mem.cases.forEach(ensure); save(); return mem; },
        refresh: function () { if (R.on) return load(); mem = null; return load(); },   // อ่านใหม่ (เมื่อแท็บอื่นแก้ข้อมูล)
        online: function () { return R.on && R.ready; },
        ensure: ensure,
        peekTeam: function (lv) { load(); return peekTeam(lv); },
        takeTeam: function (lv) { load(); var t = takeTeam(lv); save(); return t; },
        // เวร: ดึก 00-08 · เช้า 08-16 · บ่าย 16-24
        shiftOf: function (d) {
            d = new Date(d); var h = d.getHours(), s = new Date(d); s.setMinutes(0, 0, 0);
            var name = h < 8 ? 'ดึก' : h < 16 ? 'เช้า' : 'บ่าย'; s.setHours(h < 8 ? 0 : h < 16 ? 8 : 16);
            var e = new Date(s.getTime() + 8 * 3600000);
            return { name: name, start: s, end: e, key: s.toISOString() };
        },
        cases: function (status) { return load().cases.filter(function (c) { return !status || c.status === status; }); },
        get: function (id) { return load().cases.filter(function (c) { return c.id === id; })[0]; },
        // จำลองการสแกน barcode Visit → ได้เคสใหม่ที่รอ triage
        scan: function (vnTyped) {
            var st = load(), p = POOL[st.poolIdx % POOL.length];
            st.poolIdx++;
            var qn = st.nextQn++;
            var c = mk(p, 0, qn, '000' + String(700000 + qn * 137).slice(0, 6));
            if (vnTyped && /^\d{6,}$/.test(vnTyped)) c.vn = vnTyped;
            st.cases.push(c); save();
            return c;
        },
        notify: function (n) {
            var st = load(); n.at = new Date().toISOString(); n.id = 'n' + Date.now();
            st.notifications.unshift(n); save(); return n;
        },
        // ---------- ตัวช่วยแสดงผล ----------
        fmt: function (d) {
            if (!d) return '';
            d = new Date(d);
            return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + (d.getFullYear() + 543) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
        },
        hm: function (d) { d = new Date(d); return pad(d.getHours()) + ':' + pad(d.getMinutes()); },
        ME: (function () {   // CHANGE-13: ชื่อผู้ใช้ตั้งได้ที่หน้าแรก (เก็บในเครื่อง)
            var me = { doctor: 'นพ.ทดสอบ ระบบเดิม', nurse: 'พว.ทดสอบ ER', triage: 'พว.ทดสอบ คัดกรอง' };
            try { var n = JSON.parse(localStorage.getItem('kphisER.me') || '{}'); for (var k in n) if (n[k]) me[k] = n[k]; } catch (e) { }
            return me;
        })(),
        setMe: function (role, name) {
            try { var n = JSON.parse(localStorage.getItem('kphisER.me') || '{}'); n[role] = name; localStorage.setItem('kphisER.me', JSON.stringify(n)); } catch (e) { }
            ERFlow.ME[role] = name;
        },
        uid: function (p) { return (p || 'x') + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); },
        minsSince: function (d) { return Math.max(0, Math.round((Date.now() - new Date(d)) / 60000)); }
    };
    root.ERFlow = ERFlow;
    remoteStart();
})(window);
