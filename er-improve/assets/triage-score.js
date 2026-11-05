/*
 * CHANGE-01 — คะแนนและข้อเสนอระดับ Triage (ใช้ได้ทั้ง mockup และระบบจริง — ไม่ผูกกับหน้าจอ)
 * - NEWS2 (Royal College of Physicians 2017, SpO2 scale 1) — ใช้กับอายุ ≥ 16 ปี
 * - SIRS (ที่ triage ยังไม่มี WBC จึงนับ 3 ข้อ: T, HR, RR)
 * - ข้อเสนอระดับ R/E/U/L/N ตามหลัก MOPH ED Triage (ดัดแปลงจาก ESI)
 *   ** เกณฑ์ทั้งหมดอยู่ใน CONFIG ด้านล่าง — เมื่อได้เกณฑ์ของ รพ. ให้แก้ที่นี่ที่เดียว **
 * ผลลัพธ์เป็น "ข้อเสนอ" เท่านั้น ผู้ triage เป็นผู้ตัดสินระดับ
 */
(function (root) {
    'use strict';

    var CONFIG = {
        // ---- R : ต้องช่วยชีวิตทันที ----
        R: {
            spo2_lt: 90, sbp_lt: 80, gcs_le: 8,
            rr_lt: 8, rr_gt: 35, pr_lt: 40, pr_gt: 150
        },
        // ---- E : เสี่ยงสูง / danger zone (ผู้ใหญ่ อายุ > 8 ปี) ----
        E: {
            spo2_lt: 94, sbp_lt: 90, sbp_ge: 220, gcs_lt: 15,
            rr_gt: 24, pr_gt: 120, pr_lt: 50,
            bt_ge: 39.5, bt_lt: 35.0,
            dtx_lt: 60, dtx_gt: 400,
            pain_ge: 7, news2_ge: 5, sirs_ge: 2
        },
        // ---- E : danger zone เด็ก (ESI v4) ----
        PED: [
            { maxAgeY: 0.25, hr: 180, rr: 50 },
            { maxAgeY: 3, hr: 160, rr: 40 },
            { maxAgeY: 8, hr: 140, rr: 30 }
        ],
        ped_spo2_lt: 92
    };

    var LEVELS = {
        R: { code: 'R', th: 'Resuscitation', color: '#dc3545', text: '#fff', order: 1 },
        E: { code: 'E', th: 'Emergency', color: '#e83e8c', text: '#fff', order: 2 },
        U: { code: 'U', th: 'Urgency', color: '#ffc107', text: '#212529', order: 3 },
        L: { code: 'L', th: 'Less urgency', color: '#28a745', text: '#fff', order: 4 },
        N: { code: 'N', th: 'Non urgency', color: '#ffffff', text: '#212529', order: 5 }
    };

    function num(v) { if (v === '' || v === null || v === undefined) return null; var n = parseFloat(v); return isNaN(n) ? null : n; }
    function gcsTotal(v) {
        var e = num(v.gcs_e), vv = num(v.gcs_v), m = num(v.gcs_m);
        return (e === null || vv === null || m === null) ? null : e + vv + m;
    }

    // ---------------- NEWS2 ----------------
    function news2(v) {
        var rr = num(v.rr), spo2 = num(v.spo2), sbp = num(v.sbp), pr = num(v.pr), bt = num(v.bt), gcs = gcsTotal(v);
        var parts = [];
        function add(label, val, s) { parts.push({ label: label, value: val, score: s }); }
        add('RR', rr, rr === null ? null : rr <= 8 ? 3 : rr <= 11 ? 1 : rr <= 20 ? 0 : rr <= 24 ? 2 : 3);
        add('SpO2', spo2, spo2 === null ? null : spo2 <= 91 ? 3 : spo2 <= 93 ? 2 : spo2 <= 95 ? 1 : 0);
        add('O2', v.on_o2 ? 'O2' : 'Air', v.on_o2 ? 2 : 0);
        add('SBP', sbp, sbp === null ? null : sbp <= 90 ? 3 : sbp <= 100 ? 2 : sbp <= 110 ? 1 : sbp <= 219 ? 0 : 3);
        add('PR', pr, pr === null ? null : pr <= 40 ? 3 : pr <= 50 ? 1 : pr <= 90 ? 0 : pr <= 110 ? 1 : pr <= 130 ? 2 : 3);
        add('สติ', gcs === null ? null : (gcs < 15 ? 'ไม่ Alert' : 'Alert'), gcs === null ? null : (gcs < 15 ? 3 : 0));
        add('BT', bt, bt === null ? null : bt <= 35.0 ? 3 : bt <= 36.0 ? 1 : bt <= 38.0 ? 0 : bt <= 39.0 ? 1 : 2);
        var complete = parts.every(function (p) { return p.score !== null; });
        var total = parts.reduce(function (a, p) { return a + (p.score || 0); }, 0);
        var anyThree = parts.some(function (p) { return p.score === 3; });
        var risk = total >= 7 ? 'high' : total >= 5 ? 'medium' : anyThree ? 'low-medium' : 'low';
        var riskTh = { high: 'เสี่ยงสูง', medium: 'เสี่ยงปานกลาง', 'low-medium': 'เสี่ยงต่ำ-ปานกลาง (มีค่าใดค่าหนึ่ง = 3)', low: 'เสี่ยงต่ำ' }[risk];
        var adult = num(v.age_y) === null || num(v.age_y) >= 16;
        return { total: total, parts: parts, complete: complete, anyThree: anyThree, risk: risk, riskTh: riskTh, valid: adult };
    }

    // ---------------- SIRS ----------------
    function sirs(v) {
        var bt = num(v.bt), pr = num(v.pr), rr = num(v.rr);
        var items = [
            { label: 'T > 38 หรือ < 36 °C', met: bt === null ? null : (bt > 38 || bt < 36) },
            { label: 'HR > 90', met: pr === null ? null : pr > 90 },
            { label: 'RR > 20', met: rr === null ? null : rr > 20 },
            { label: 'WBC > 12,000 / < 4,000', met: null, pending: true }
        ];
        var count = items.filter(function (i) { return i.met === true; }).length;
        return { count: count, items: items, positive: count >= 2 };
    }

    // ---------------- ข้อเสนอระดับ ----------------
    function suggest(v, ctx) {
        ctx = ctx || {};
        var C = CONFIG, reasons = [];
        var spo2 = num(v.spo2), sbp = num(v.sbp), rr = num(v.rr), pr = num(v.pr), bt = num(v.bt),
            dtx = num(v.dtx), pain = num(v.pain), age = num(v.age_y), gcs = gcsTotal(v);
        function r(level, text) { reasons.push({ level: level, text: text }); }

        // R
        (ctx.critical || []).forEach(function (c) { r('R', c); });
        if (spo2 !== null && spo2 < C.R.spo2_lt) r('R', 'SpO2 ' + spo2 + '% (< ' + C.R.spo2_lt + ')');
        if (sbp !== null && sbp < C.R.sbp_lt) r('R', 'SBP ' + sbp + ' (< ' + C.R.sbp_lt + ')');
        if (gcs !== null && gcs <= C.R.gcs_le) r('R', 'GCS ' + gcs + ' (≤ ' + C.R.gcs_le + ')');
        if (rr !== null && (rr < C.R.rr_lt || rr > C.R.rr_gt)) r('R', 'RR ' + rr);
        if (pr !== null && (pr < C.R.pr_lt || pr > C.R.pr_gt)) r('R', 'PR ' + pr);

        // E
        var ped = age !== null && age <= 8;
        if (ped) {
            var band = C.PED.filter(function (b) { return age <= b.maxAgeY; })[0];
            if (pr !== null && pr > band.hr) r('E', 'เด็ก: HR ' + pr + ' (> ' + band.hr + ')');
            if (rr !== null && rr > band.rr) r('E', 'เด็ก: RR ' + rr + ' (> ' + band.rr + ')');
            if (spo2 !== null && spo2 < C.ped_spo2_lt && spo2 >= C.R.spo2_lt) r('E', 'เด็ก: SpO2 ' + spo2 + '%');
        } else {
            if (spo2 !== null && spo2 >= C.R.spo2_lt && spo2 < C.E.spo2_lt) r('E', 'SpO2 ' + spo2 + '%');
            if (rr !== null && rr > C.E.rr_gt && rr <= C.R.rr_gt) r('E', 'RR ' + rr + ' (> ' + C.E.rr_gt + ')');
            if (pr !== null && ((pr > C.E.pr_gt && pr <= C.R.pr_gt) || (pr < C.E.pr_lt && pr >= C.R.pr_lt))) r('E', 'PR ' + pr);
        }
        if (sbp !== null && sbp >= C.R.sbp_lt && sbp < C.E.sbp_lt) r('E', 'SBP ' + sbp + ' (< ' + C.E.sbp_lt + ')');
        if (sbp !== null && sbp >= C.E.sbp_ge) r('E', 'SBP ' + sbp + ' (≥ ' + C.E.sbp_ge + ')');
        if (gcs !== null && gcs > C.R.gcs_le && gcs < C.E.gcs_lt) r('E', 'GCS ' + gcs + ' (ซึม/สับสน)');
        if (bt !== null && (bt >= C.E.bt_ge || bt < C.E.bt_lt)) r('E', 'BT ' + bt);
        if (dtx !== null && (dtx < C.E.dtx_lt || dtx > C.E.dtx_gt)) r('E', 'DTX ' + dtx);
        if (pain !== null && pain >= C.E.pain_ge) r('E', 'Pain score ' + pain + '/10');
        if (ctx.news2 && ctx.news2.valid && ctx.news2.complete && (ctx.news2.total >= C.E.news2_ge || ctx.news2.anyThree))
            r('E', 'NEWS2 = ' + ctx.news2.total + (ctx.news2.anyThree ? ' (มีค่า 3)' : ''));
        if (ctx.sirs && ctx.sirs.count >= C.E.sirs_ge) r('E', 'SIRS ' + ctx.sirs.count + '/3 → คิดถึง sepsis');
        (ctx.fastTrack || []).forEach(function (f) { r('E', 'Fast track: ' + f); });
        (ctx.highRisk || []).forEach(function (h) { r('E', h); });

        var level;
        if (reasons.some(function (x) { return x.level === 'R'; })) level = 'R';
        else if (reasons.some(function (x) { return x.level === 'E'; })) level = 'E';
        else if (ctx.resources === '2') { level = 'U'; r('U', 'คาดว่าใช้ทรัพยากร ≥ 2 อย่าง'); }
        else if (ctx.resources === '1') { level = 'L'; r('L', 'คาดว่าใช้ทรัพยากร 1 อย่าง'); }
        else if (ctx.resources === '0') { level = 'N'; r('N', 'ไม่ต้องใช้ทรัพยากร'); }
        else level = null; // ต้องเลือกจำนวนทรัพยากรก่อน

        return { level: level, reasons: reasons.filter(function (x) { return x.level === level; }), all: reasons };
    }

    root.TriageScore = { CONFIG: CONFIG, LEVELS: LEVELS, news2: news2, sirs: sirs, suggest: suggest, gcsTotal: gcsTotal };
})(window);
