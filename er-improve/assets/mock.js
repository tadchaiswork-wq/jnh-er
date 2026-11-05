/*
 * KPHIS ER — Mockup (static HTML)
 * ใช้แสดงหน้าตาโมดูล ER ของระบบเดิม ด้วยข้อมูลสมมติ — ไม่เชื่อมฐานข้อมูล ไม่มีการบันทึกจริง
 * ทุกปุ่มที่เป็น "บันทึก/ลบ/ยืนยัน" จะแสดงข้อความแจ้งว่าเป็น mockup เท่านั้น
 */
(function () {
    'use strict';

    // ---------- Navbar (จำลองจาก menu.php) ----------
    var NAVBAR =
        '<nav class="navbar navbar-expand-sm text-light navbar-dark bg-primary d-print-none">' +
        '  <a class="navbar-brand" href="index.html">KPHIS <span class="badge badge-warning mockup-badge">MOCKUP</span></a>' +
        '  <a class="navbar-text text-light mr-3 text-nowrap" href="#"><small>CNT 69.10.28.9</small></a>' +
        '  <div class="collapse navbar-collapse show">' +
        '    <ul class="navbar-nav mr-auto mt-2 mt-lg-0">' +
        /* CHANGE-06 */ '      <li class="nav-item active"><a class="nav-link" href="er-triage.html"><em class="fas fa-user-tag"></em> Triage</a></li>' +
        dd('fas fa-user-md', 'แพทย์', [['กระดานผู้ป่วย ER', 'er-board.html?view=doctor'], 'รายการผู้ป่วยใน', 'Order ล่วงหน้า', 'รายการผู้ป่วย Consult', 'สรุปโรค']) +
        dd('fas fa-user-nurse', 'พยาบาล', [['กระดานผู้ป่วย ER', 'er-board.html?view=nurse'], 'รายการผู้ป่วยใน', 'Vital Sign', 'Nurse Planning', 'Order ล่วงหน้า', 'รายการผู้ป่วย Consult', 'สรุปโรค']) +
        dd('fas fa-prescription', 'เภสัชกร', ['Order', 'รายการผู้ป่วยใน', 'Screen ใบสั่งยา', 'Order ล่วงหน้า']) +
        dd('fas fa-users', 'อื่นๆ', ['รายการผู้ป่วยใน', 'Order ล่วงหน้า']) +
        '      <li class="nav-item active dropdown">' +
        '        <a class="nav-link dropdown-toggle" href="#" data-toggle="dropdown"><em class="fas fa-ambulance"></em> ER</a>' +
        '        <div class="dropdown-menu">' +
        /* CHANGE-01 */ '          <a class="dropdown-item font-weight-bold" href="er-triage.html"><i class="fas fa-user-tag"></i> Triage</a>' +
        /* CHANGE-03 */ '          <a class="dropdown-item font-weight-bold" href="er-board.html?view=doctor"><i class="fas fa-th-list"></i> กระดานผู้ป่วย ER (แพทย์)</a>' +
        '          <a class="dropdown-item font-weight-bold" href="er-board.html?view=nurse"><i class="fas fa-th-list"></i> กระดานผู้ป่วย ER (พยาบาล)</a><div class="dropdown-divider"></div>' +
        '          <a class="dropdown-item" href="er-patient-list.html?view_by=doctor">รายการผู้ป่วย ER (แพทย์)</a>' +
        '          <a class="dropdown-item" href="er-patient-list.html?view_by=nurse">รายการผู้ป่วย ER (พยาบาล)</a>' +
        '          <a class="dropdown-item" href="er-patient-list.html?view_by=pharmacist">รายการผู้ป่วย ER (เภสัชกร)</a>' +
        '          <a class="dropdown-item" href="er-patient-list.html?view_by=other">รายการผู้ป่วย ER (อื่นๆ)</a>' +
        '          <a class="dropdown-item" href="er-pharmacy-order-monitor.html">Order ER (เภสัชกร)</a>' +
        '          <a class="dropdown-item" href="er-nurse-index-plan-monitor.html">Nurse Planning ER</a>' +
        '        </div>' +
        '      </li>' +
        '      <li class="nav-item active dropdown">' +
        '        <a class="nav-link dropdown-toggle" href="#" data-toggle="dropdown"><em class="fas fa-flask"></em> Lab</a>' +
        '        <div class="dropdown-menu"><a class="dropdown-item" href="#">รายการขอเลือดทั้งหมด</a></div>' +
        '      </li>' +
        '      <li class="nav-item active dropdown">' +
        '        <a class="nav-link dropdown-toggle" href="#" data-toggle="dropdown"><em class="fas fa-cog"></em> Setting</a>' +
        '        <div class="dropdown-menu">' +
        '          <a class="dropdown-item" href="#">Template Nurse</a>' +
        '          <a class="dropdown-item" href="setting-er-bed.html">เตียง ER</a>' +
        '          <a class="dropdown-item" href="#">จัดการผู้ใช้งาน</a>' +
        '          <a class="dropdown-item" href="#">จัดการบทบาท</a>' +
        '          <div class="dropdown-divider"></div>' +
        '          <a class="dropdown-item" href="#">ประวัติการปรับปรุง</a>' +
        '        </div>' +
        '      </li>' +
        '    </ul>' +
        '    <ul class="navbar-nav">' +
        '      <li class="nav-item active dropdown">' +
        '        <a class="nav-link dropdown-toggle" href="#" data-toggle="dropdown"><i class="fa fa-user"></i> นพ.ทดสอบ ระบบเดิม</a>' +
        '        <div class="dropdown-menu dropdown-menu-right">' +
        '          <h6 class="dropdown-header">Role</h6>' +
        '          <span class="dropdown-item-text">DOCTOR</span><span class="dropdown-item-text">ER_NURSE</span>' +
        '          <div class="dropdown-divider"></div>' +
        '          <a class="dropdown-item" href="index.html"><i class="fas fa-sign-out-alt"></i> ออกจากระบบ</a>' +
        '        </div>' +
        '      </li>' +
        '    </ul>' +
        '  </div>' +
        '</nav>';

    function dd(icon, label, items) {
        return '<li class="nav-item active dropdown">' +
            '<a class="nav-link dropdown-toggle" href="#" data-toggle="dropdown"><em class="' + icon + '"></em> ' + label + '</a>' +
            '<div class="dropdown-menu">' + items.map(function (t) {
                if (Array.isArray(t)) return '<a class="dropdown-item font-weight-bold" href="' + t[1] + '">' + t[0] + '</a><div class="dropdown-divider"></div>';
                return '<a class="dropdown-item" href="#">' + t + '</a>';
            }).join('') + '</div></li>';
    }

    // ---------- แถบข้อมูลผู้ป่วย (จำลองจาก opd-er-show-patient-main.php) ----------
    var PATIENT_BANNER =
        '<div class="patient-info-container alert alert-secondary" role="alert">' +
        '  <div class="d-flex">' +
        '    <div class="pt-1 pl-1 pb-1 pr-3 flex"><div class="img-thumbnail mock-patient-img"><i class="fas fa-user"></i></div></div>' +
        '    <div class="p-1 flex">' +
        '      <h5 class="alert-heading">ข้อมูลผู้ป่วย</h5>' +
        '      <label>HN : 000123456 | VN : 691104083015</label>' +
        '      | <label>ชื่อ - สกุล : นายสมชาย ตัวอย่างดี | </label>' +
        '      <label>อายุ : 58 ปี 3 เดือน 12 วัน | </label>' +
        '      <label>สิทธิ : (89) บัตรประกันสุขภาพถ้วนหน้า (ในเขต)</label><br>' +
        '      <div class="patient-info-allergy-box alert alert-danger d-inline-block py-1 px-2 mb-1">' +
        '        <i class="fas fa-exclamation-triangle"></i>' +
        '        <label class="text-danger font-weight-bold mb-0">แพ้ยา : PENICILLIN=ผื่นคัน, IBUPROFEN=หน้าบวม</label>' +
        '        | <label class="text-danger font-weight-bold mb-0">แจ้งแพ้ยา (ER) : SULFA=ผื่น</label>' +
        '      </div><br>' +
        '      <label class="text-primary">วันที่ Visit : 04/11/2569 08:30</label>' +
        '      | <label>น้ำหนักตัวล่าสุด : 68 kg (04/11/2569 08:45) </label>' +
        '      <div class="patient-info-status mt-1">' +
        '        <span class="mr-3">MEWS <span class="badge text-white" style="font-size:100%; background-color:#e6b728;">3</span></span>' +
        '        <span class="mr-3">V/S ล่าสุด : <b>04/11/2569 10:15</b></span>' +
        '      </div>' +
        '    </div>' +
        '  </div>' +
        '</div>';

    window.MOCK = {
        PATIENT_BANNER: PATIENT_BANNER,
        // แจ้งว่าเป็น mockup แทนการบันทึกจริง
        notice: function (action) {
            alert('[MOCKUP] ' + (action || 'การทำงานนี้') + '\nหน้านี้เป็นตัวอย่างหน้าจอเท่านั้น ไม่มีการบันทึกข้อมูลจริง');
            return false;
        },
        param: function (name, def) {
            var m = new RegExp('[?&]' + name + '=([^&]*)').exec(location.search);
            return m ? decodeURIComponent(m[1]) : def;
        },
        mewsColor: function (s) {
            if (s === null || s === undefined || s === '') return 'inherit';
            if (s === 0) return '#45c351';
            if (s <= 3) return '#e6b728';
            return '#e51616';
        }
    };

    document.addEventListener('DOMContentLoaded', function () {
        var nav = document.getElementById('mock-navbar');
        if (nav) nav.outerHTML = NAVBAR;
        document.querySelectorAll('[data-mock-patient-banner]').forEach(function (el) {
            el.innerHTML = PATIENT_BANNER;
        });
        // ปุ่ม/ฟอร์มที่ติด data-mock-action → แจ้งเตือนว่าเป็น mockup
        document.addEventListener('click', function (e) {
            var t = e.target.closest('[data-mock-action]');
            if (t) { e.preventDefault(); MOCK.notice(t.getAttribute('data-mock-action')); }
        });
        document.querySelectorAll('form').forEach(function (f) {
            f.addEventListener('submit', function (e) { e.preventDefault(); });
        });
    });
})();
