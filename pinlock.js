/* ============================================================
   PinLock — PIN ปลดล็อกเร็ว (ต่อยอดจากบัญชี user/pass เดิม)
   - เก็บ username+password แบบเข้ารหัส (AES-GCM, คีย์มาจาก PIN)
   - รองรับหลายคนต่อ 1 เครื่อง (ลอง PIN กับทุกบัญชีที่บันทึกไว้)
   - ปลอดภัยระดับใช้ภายใน: localStorage เก็บเฉพาะ ciphertext
   ใช้ร่วมกันได้ทั้ง rak-er และ triage
   ============================================================ */
(function(){
  const encB64 = a => btoa(String.fromCharCode.apply(null, new Uint8Array(a)));
  const decB64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  const subtle = (window.crypto && window.crypto.subtle) ? window.crypto.subtle : null;

  async function deriveKey(pin, salt){
    const base = await subtle.importKey("raw", new TextEncoder().encode(String(pin)), "PBKDF2", false, ["deriveKey"]);
    return subtle.deriveKey({name:"PBKDF2", salt, iterations:120000, hash:"SHA-256"},
      base, {name:"AES-GCM", length:256}, false, ["encrypt","decrypt"]);
  }
  async function encrypt(obj, pin){
    const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(pin, salt);
    const ct = await subtle.encrypt({name:"AES-GCM", iv}, key, new TextEncoder().encode(JSON.stringify(obj)));
    return encB64(salt)+"."+encB64(iv)+"."+encB64(ct);
  }
  async function decrypt(str, pin){
    const [s,i,c] = str.split(".");
    const key = await deriveKey(pin, decB64(s));
    const pt = await subtle.decrypt({name:"AES-GCM", iv:decB64(i)}, key, decB64(c));
    return JSON.parse(new TextDecoder().decode(pt));
  }

  let APP = "app";
  const LKEY = () => "pinlock_" + APP;
  function load(){ try{ return JSON.parse(localStorage.getItem(LKEY())||"[]"); }catch(e){ return []; } }
  function save(a){ try{ localStorage.setItem(LKEY(), JSON.stringify(a)); }catch(e){} }

  /* ---------- styles (inject once) ---------- */
  function injectCSS(){
    if(document.getElementById("_pl_css")) return;
    const s=document.createElement("style"); s.id="_pl_css";
    s.textContent=`
    #_pl_gate,#_pl_mgr{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;
      padding:20px;font-family:'Sarabun',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
    #_pl_gate{background:linear-gradient(160deg,#0e7490,#0b3b49)}
    #_pl_mgr{background:rgba(15,23,42,.55)}
    ._pl_card{background:#fff;border-radius:22px;box-shadow:0 20px 60px rgba(0,0,0,.35);width:100%;max-width:360px;padding:26px 24px;color:#0f172a}
    ._pl_mgrcard{max-width:420px;max-height:88vh;overflow:auto}
    ._pl_brand{text-align:center;margin-bottom:8px}
    ._pl_brand .l{font-size:34px}
    ._pl_brand h2{margin:6px 0 2px;font-size:19px;color:#0e7490}
    ._pl_brand p{margin:0;color:#64748b;font-size:13px}
    ._pl_dots{display:flex;gap:12px;justify-content:center;margin:20px 0 8px}
    ._pl_dot{width:16px;height:16px;border-radius:50%;background:#e2e8f0;transition:.15s}
    ._pl_dot.on{background:#0e7490;transform:scale(1.05)}
    ._pl_err{color:#dc2626;text-align:center;font-size:13.5px;min-height:20px;margin:2px 0}
    ._pl_pad{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:6px}
    ._pl_pad button{border:none;background:#f1f5f9;border-radius:14px;padding:16px 0;font-size:22px;font-weight:600;color:#0f172a;cursor:pointer;transition:.1s;font-family:inherit}
    ._pl_pad button:active{background:#cbd5e1;transform:scale(.96)}
    ._pl_pad ._pl_act{background:#0e7490;color:#fff;font-size:16px}
    ._pl_pad ._pl_act:active{background:#0b5566}
    ._pl_link{display:block;width:100%;text-align:center;background:none;border:none;color:#0e7490;font-weight:600;
      font-size:13.5px;margin-top:16px;cursor:pointer;font-family:inherit}
    ._pl_field{margin:12px 0}
    ._pl_field label{display:block;font-size:13px;font-weight:600;color:#64748b;margin-bottom:5px}
    ._pl_field input{width:100%;border:1.5px solid #e2e8f0;border-radius:11px;padding:11px 12px;font-family:inherit;font-size:15px;outline:none}
    ._pl_field input:focus{border-color:#0e7490;box-shadow:0 0 0 3px #cffafe}
    ._pl_btn{display:block;width:100%;border:none;background:#0e7490;color:#fff;border-radius:12px;padding:12px;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;margin-top:6px}
    ._pl_btn.g{background:#fff;color:#0e7490;border:1px solid #e2e8f0}
    ._pl_btn.d{background:#fee2e2;color:#dc2626}
    ._pl_row{display:flex;gap:8px}
    ._pl_close{float:right;background:#f1f5f9;border:none;border-radius:9px;width:32px;height:32px;font-size:17px;color:#64748b;cursor:pointer}
    ._pl_sect{border-top:1px solid #eef2f6;margin-top:16px;padding-top:14px}
    ._pl_status{font-size:13px;color:#64748b;margin-bottom:8px}
    ._pl_toast{position:fixed;left:50%;bottom:26px;transform:translateX(-50%);background:#0f172a;color:#fff;padding:10px 18px;border-radius:12px;font-size:14px;z-index:100000;box-shadow:0 8px 24px rgba(0,0,0,.3)}
    `;
    document.head.appendChild(s);
  }
  function toast(m){ injectCSS(); const t=document.createElement("div"); t.className="_pl_toast"; t.textContent=m;
    document.body.appendChild(t); setTimeout(()=>t.remove(),2000); }

  /* ---------- storage API ---------- */
  const API = {
    use(appId){ APP=appId; return API; },
    available(){ return !!subtle; },
    hasAny(){ return load().length>0; },
    hasUser(u){ return load().some(x=>x.username===u); },
    list(){ return load().map(x=>x.username); },
    async add(creds, pin){
      const a = load().filter(x=>x.username!==creds.username);
      a.push({username:creds.username, blob:await encrypt(creds, pin)});
      save(a);
    },
    removeUser(u){ save(load().filter(x=>x.username!==u)); },
    clearAll(){ save([]); },
    async tryUnlock(pin){
      for(const x of load()){ try{ return await decrypt(x.blob, pin); }catch(e){} }
      return null;
    },

    /* ---------- GATE (PIN unlock screen) ---------- */
    mountGate(opts){
      if(!subtle || !this.hasAny()) return false;
      if(document.getElementById("_pl_gate")) return true;
      injectCSS();
      let pin="";
      const g=document.createElement("div"); g.id="_pl_gate";
      g.innerHTML=`<div class="_pl_card">
        <div class="_pl_brand"><div class="l">${opts.logo||"🔒"}</div>
          <h2>${opts.brand||""}</h2><p>${opts.subtitle||"ใส่ PIN เพื่อเข้าใช้งาน"}</p></div>
        <div class="_pl_dots" id="_pl_dots"></div>
        <div class="_pl_err" id="_pl_err"></div>
        <div class="_pl_pad" id="_pl_pad"></div>
        <button class="_pl_link" id="_pl_usepw">เข้าด้วยรหัสผ่านแทน / ลืม PIN</button>
      </div>`;
      document.body.appendChild(g);
      const dots=g.querySelector("#_pl_dots"), err=g.querySelector("#_pl_err"), pad=g.querySelector("#_pl_pad");
      const MAXV=8;
      function drawDots(){ const n=Math.max(4,pin.length||4);
        dots.innerHTML=""; for(let i=0;i<n;i++){ const d=document.createElement("div"); d.className="_pl_dot"+(i<pin.length?" on":""); dots.appendChild(d);} }
      ["1","2","3","4","5","6","7","8","9","⌫","0","✓"].forEach(lab=>{
        const b=document.createElement("button");
        if(lab==="✓"){ b.className="_pl_act"; b.textContent="✓"; b.onclick=submit; }
        else if(lab==="⌫"){ b.textContent="⌫"; b.onclick=()=>{ pin=pin.slice(0,-1); err.textContent=""; drawDots(); }; }
        else { b.textContent=lab; b.onclick=()=>{ if(pin.length<MAXV){ pin+=lab; err.textContent=""; drawDots(); if(pin.length>=6){} } }; }
        pad.appendChild(b);
      });
      async function submit(){
        if(pin.length<4){ err.textContent="PIN อย่างน้อย 4 หลัก"; return; }
        err.textContent="กำลังตรวจสอบ…";
        const creds=await API.tryUnlock(pin);
        if(!creds){ err.textContent="PIN ไม่ถูกต้อง"; pin=""; drawDots(); return; }
        try{ await opts.signIn(creds); API.hideGate(); }
        catch(e){ err.textContent="เข้าสู่ระบบไม่สำเร็จ ลองใหม่"; pin=""; drawDots(); }
      }
      g.querySelector("#_pl_usepw").onclick=()=>{ API.hideGate(); if(opts.onUsePassword) opts.onUsePassword(); };
      document.addEventListener("keydown", API._key=function(e){
        if(!document.getElementById("_pl_gate")) return;
        if(e.key>="0"&&e.key<="9"&&pin.length<MAXV){ pin+=e.key; err.textContent=""; drawDots(); }
        else if(e.key==="Backspace"){ pin=pin.slice(0,-1); err.textContent=""; drawDots(); }
        else if(e.key==="Enter"){ submit(); }
      });
      drawDots();
      return true;
    },
    hideGate(){ const g=document.getElementById("_pl_gate"); if(g) g.remove(); if(API._key) document.removeEventListener("keydown",API._key); },

    /* ---------- MANAGER (ข้อมูลสมาชิก → ตั้ง/เปลี่ยน/ลบ PIN) ---------- */
    openManager(opts){
      injectCSS();
      const username=opts.username;
      const m=document.createElement("div"); m.id="_pl_mgr";
      function close(){ m.remove(); if(opts.onClose) opts.onClose(); }
      function body(){
        const has=API.hasUser(username);
        m.querySelector("#_pl_pinbody").innerHTML=`
          <div class="_pl_sect">
            <div class="_pl_status">🔑 PIN ปลดล็อกเร็ว (เครื่องนี้): <b style="color:${has?'#16a34a':'#64748b'}">${has?'ตั้งไว้แล้ว':'ยังไม่ได้ตั้ง'}</b></div>
            <div id="_pl_pinarea"></div>
            <button class="_pl_btn" id="_pl_setbtn">${has?'เปลี่ยน PIN':'ตั้ง PIN'}</button>
            ${has?'<button class="_pl_btn d" id="_pl_delbtn" style="margin-top:8px">ลบ PIN ในเครื่องนี้</button>':''}
          </div>`;
        const setBtn=m.querySelector("#_pl_setbtn"), delBtn=m.querySelector("#_pl_delbtn");
        setBtn.onclick=()=>showSetForm();
        if(delBtn) delBtn.onclick=()=>{ API.removeUser(username); toast("ลบ PIN แล้ว"); body(); };
      }
      function showSetForm(){
        const area=m.querySelector("#_pl_pinarea");
        area.innerHTML=`
          <div class="_pl_field"><label>ยืนยันรหัสผ่านบัญชีของคุณ</label><input id="_pl_pw" type="password" placeholder="รหัสผ่าน"></div>
          <div class="_pl_field"><label>ตั้ง PIN ใหม่ (ตัวเลข 4–8 หลัก)</label><input id="_pl_np" inputmode="numeric" placeholder="PIN"></div>
          <div class="_pl_field"><label>ยืนยัน PIN</label><input id="_pl_np2" inputmode="numeric" placeholder="PIN อีกครั้ง"></div>
          <div class="_pl_err" id="_pl_serr"></div>
          <div class="_pl_row"><button class="_pl_btn g" id="_pl_cancel" style="flex:1">ยกเลิก</button>
          <button class="_pl_btn" id="_pl_save" style="flex:1">บันทึก</button></div>`;
        m.querySelector("#_pl_cancel").onclick=()=>{ area.innerHTML=""; };
        m.querySelector("#_pl_save").onclick=async()=>{
          const pw=m.querySelector("#_pl_pw").value, np=m.querySelector("#_pl_np").value.trim(), np2=m.querySelector("#_pl_np2").value.trim();
          const se=m.querySelector("#_pl_serr");
          if(!/^\d{4,8}$/.test(np)){ se.textContent="PIN ต้องเป็นตัวเลข 4–8 หลัก"; return; }
          if(np!==np2){ se.textContent="PIN สองช่องไม่ตรงกัน"; return; }
          se.textContent="กำลังตรวจสอบรหัสผ่าน…";
          let ok=false; try{ ok=await opts.verify({username, password:pw}); }catch(e){ ok=false; }
          if(!ok){ se.textContent="รหัสผ่านบัญชีไม่ถูกต้อง"; return; }
          await API.add({username, password:pw}, np);
          toast("บันทึก PIN แล้ว"); body();
        };
      }
      m.innerHTML=`<div class="_pl_card _pl_mgrcard">
        <button class="_pl_close" id="_pl_x">×</button>
        <div class="_pl_brand" style="text-align:left"><h2 style="margin:0">👤 ข้อมูลสมาชิก</h2></div>
        <div id="_pl_extra" style="margin-top:10px">${opts.extraHTML||""}</div>
        <div id="_pl_pinbody"></div>
      </div>`;
      document.body.appendChild(m);
      m.querySelector("#_pl_x").onclick=close;
      m.addEventListener("click",e=>{ if(e.target===m) close(); });
      body();
      if(opts.onExtraMount) opts.onExtraMount(m.querySelector("#_pl_extra"), close);
    },
    toast
  };
  window.PinLock = API;
})();
