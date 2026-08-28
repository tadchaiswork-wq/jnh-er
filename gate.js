/* ============================================================
   Gate — รหัสกลางตัวเดียว + ออกจากระบบอัตโนมัติเมื่อไม่ใช้งาน
   ใช้กับ: triage, rak, checklist
   - รหัสเก็บ (แบบ hash) ที่ Realtime Database ของโปรเจกต์ jnh-er
     (แชร์รหัสเดียวกันทุกแอป, แก้ไขได้จากในหน้าจอ)
   - ปลดล็อกด้วยรหัส -> เรียก onUnlock(); ไม่ใช้งานเกิน N นาที -> ล็อกใหม่ (onLock)
   ============================================================ */
(function(){
  const DEFAULT_CODE = "1234";
  const subtle = (window.crypto && crypto.subtle) ? crypto.subtle : null;
  async function sha(s){
    if(!subtle){ let h=0x811c9dc5; for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193);} return ("0000000"+(h>>>0).toString(16)).slice(-8); }
    const b=await subtle.digest("SHA-256", new TextEncoder().encode(s));
    return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("");
  }
  function dbBase(){
    if(window.GATE_DB_URL) return window.GATE_DB_URL.replace(/\/+$/,"");
    if(window.FIREBASE_CONFIG && window.FIREBASE_CONFIG.databaseURL) return window.FIREBASE_CONFIG.databaseURL.replace(/\/+$/,"");
    return "https://jnh-er-7f427-default-rtdb.asia-southeast1.firebasedatabase.app";
  }
  const LS_HASH="gate_codeHash_cache";
  async function fetchHash(){
    try{
      const r=await fetch(dbBase()+"/gate/codeHash.json",{cache:"no-store"});
      if(!r.ok) return undefined;                       // 404 / permission denied -> treat as unavailable
      const v=await r.json();
      if(typeof v==="string"){ try{localStorage.setItem(LS_HASH,v);}catch(e){} return v; }
      if(v===null) return null;                          // DB empty -> seed default
      return undefined;                                  // error object / unexpected -> unavailable
    }catch(e){ return undefined; }
  }
  async function putHash(h){ try{ await fetch(dbBase()+"/gate/codeHash.json",{method:"PUT",body:JSON.stringify(h)}); try{localStorage.setItem(LS_HASH,h);}catch(e){} return true; }catch(e){ return false; } }
  async function currentHash(){
    let h=await fetchHash();
    if(h===undefined){ try{ h=localStorage.getItem(LS_HASH); }catch(e){} return h||null; } // offline -> cached
    if(h===null){ h=await sha(DEFAULT_CODE); await putHash(h); }                            // seed default
    return h;
  }

  function css(){
    if(document.getElementById("_gt_css")) return;
    const s=document.createElement("style"); s.id="_gt_css"; s.textContent=`
    #_gt{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:20px;
      background:linear-gradient(160deg,#0e7490,#0b3b49);font-family:'Sarabun',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
    #_gt .c{background:#fff;border-radius:22px;box-shadow:0 20px 60px rgba(0,0,0,.4);width:100%;max-width:360px;padding:26px 24px;color:#0f172a}
    #_gt .l{font-size:34px;text-align:center}
    #_gt h2{margin:6px 0 2px;font-size:20px;color:#0e7490;text-align:center}
    #_gt p{margin:0;color:#64748b;font-size:13px;text-align:center}
    #_gt .dots{display:flex;gap:12px;justify-content:center;margin:20px 0 8px}
    #_gt .dot{width:16px;height:16px;border-radius:50%;background:#e2e8f0}
    #_gt .dot.on{background:#0e7490}
    #_gt .err{color:#dc2626;text-align:center;font-size:13.5px;min-height:20px}
    #_gt .pad{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:6px}
    #_gt .pad button{border:none;background:#f1f5f9;border-radius:14px;padding:16px 0;font-size:22px;font-weight:600;color:#0f172a;cursor:pointer;font-family:inherit}
    #_gt .pad button:active{background:#cbd5e1;transform:scale(.96)}
    #_gt .pad .go{background:#0e7490;color:#fff;font-size:16px}
    #_gt .lnk{display:block;width:100%;text-align:center;background:none;border:none;color:#0e7490;font-weight:600;font-size:12.5px;margin-top:14px;cursor:pointer;font-family:inherit}
    #_gt .field{margin:10px 0}
    #_gt .field label{display:block;font-size:12.5px;font-weight:600;color:#64748b;margin-bottom:4px}
    #_gt .field input{width:100%;border:1.5px solid #e2e8f0;border-radius:10px;padding:10px 12px;font-family:inherit;font-size:15px;outline:none}
    #_gt .btn{display:block;width:100%;border:none;background:#0e7490;color:#fff;border-radius:12px;padding:11px;font-size:14.5px;font-weight:700;cursor:pointer;font-family:inherit;margin-top:6px}
    #_gt .btn.g{background:#fff;color:#0e7490;border:1px solid #e2e8f0}
    `;
    document.head.appendChild(s);
  }

  const Gate={
    async verify(code){ const h=await currentHash(); if(!h){ return (await sha(String(code)))===(await sha(DEFAULT_CODE)); } return (await sha(String(code)))===h; },
    async changeCode(cur,next){ if(!(await this.verify(cur))) return false; return putHash(await sha(String(next))); },

    protect(opts){
      opts=opts||{}; css();
      const idleMs=(opts.idleMinutes||20)*60*1000;
      let initialized=false, idleTimer=null, pin="";
      const g=document.createElement("div"); g.id="_gt";
      g.innerHTML=`<div class="c">
        <div class="l">${opts.logo||"🔒"}</div>
        <h2>${opts.brand||"เข้าสู่ระบบ"}</h2>
        <p>${opts.subtitle||"ใส่รหัสเพื่อเข้าใช้งาน"}</p>
        <div class="dots" id="_gtd"></div>
        <div class="err" id="_gte"></div>
        <div class="pad" id="_gtp"></div>
        <button class="lnk" id="_gtc">🔧 เปลี่ยนรหัส (ผู้ดูแล)</button>
      </div>`;
      const dots=()=>{ const d=g.querySelector("#_gtd"); const n=Math.max(4,pin.length||4); d.innerHTML=""; for(let i=0;i<n;i++){const e=document.createElement("div");e.className="dot"+(i<pin.length?" on":"");d.appendChild(e);} };
      const err=m=>{ g.querySelector("#_gte").textContent=m||""; };
      const pad=g.querySelector("#_gtp");
      ["1","2","3","4","5","6","7","8","9","⌫","0","✓"].forEach(lab=>{
        const b=document.createElement("button");
        if(lab==="✓"){ b.className="go"; b.textContent="✓"; b.onclick=submit; }
        else if(lab==="⌫"){ b.textContent="⌫"; b.onclick=()=>{pin=pin.slice(0,-1);err("");dots();}; }
        else { b.textContent=lab; b.onclick=()=>{ if(pin.length<10){pin+=lab;err("");dots();} }; }
        pad.appendChild(b);
      });
      async function submit(){
        if(pin.length<4){ err("รหัสอย่างน้อย 4 หลัก"); return; }
        err("กำลังตรวจสอบ…");
        const ok=await Gate.verify(pin); const code=pin; pin="";
        if(!ok){ err("รหัสไม่ถูกต้อง"); dots(); return; }
        err(""); dots(); unlock();
      }
      async function unlock(){
        try{ if(opts.onUnlock) await opts.onUnlock(); }catch(e){ console.warn(e); }
        g.style.display="none"; document.removeEventListener("keydown",keyh);
        resetIdle();
      }
      function lock(){
        pin=""; err(""); dots(); g.style.display="flex"; document.addEventListener("keydown",keyh);
        clearTimeout(idleTimer);
        try{ if(opts.onLock) opts.onLock(); }catch(e){}
      }
      function resetIdle(){ clearTimeout(idleTimer); idleTimer=setTimeout(lock, idleMs); }
      function keyh(e){ if(g.style.display==="none")return; if(e.key>="0"&&e.key<="9"&&pin.length<10){pin+=e.key;err("");dots();} else if(e.key==="Backspace"){pin=pin.slice(0,-1);err("");dots();} else if(e.key==="Enter"){submit();} }
      // change code
      g.querySelector("#_gtc").onclick=()=>{
        const c=g.querySelector(".c");
        c.insertAdjacentHTML("beforeend",`<div id="_gtcf" style="border-top:1px solid #eef2f6;margin-top:12px;padding-top:12px">
          <div class="field"><label>รหัสเดิม</label><input id="_gtcur" inputmode="numeric" type="password"></div>
          <div class="field"><label>รหัสใหม่ (ตัวเลข 4–8 หลัก)</label><input id="_gtnew" inputmode="numeric"></div>
          <div class="err" id="_gtcerr"></div>
          <div style="display:flex;gap:8px"><button class="btn g" id="_gtcx" style="flex:1">ปิด</button><button class="btn" id="_gtcs" style="flex:1">บันทึกรหัสใหม่</button></div>
        </div>`);
        g.querySelector("#_gtc").style.display="none";
        g.querySelector("#_gtcx").onclick=()=>{ g.querySelector("#_gtcf").remove(); g.querySelector("#_gtc").style.display=""; };
        g.querySelector("#_gtcs").onclick=async()=>{
          const cur=g.querySelector("#_gtcur").value, nw=g.querySelector("#_gtnew").value.trim(), e=g.querySelector("#_gtcerr");
          if(!/^\d{4,8}$/.test(nw)){ e.textContent="รหัสใหม่ต้องเป็นตัวเลข 4–8 หลัก"; return; }
          e.textContent="กำลังบันทึก…";
          const ok=await Gate.changeCode(cur,nw);
          e.textContent = ok ? "" : "รหัสเดิมไม่ถูกต้อง";
          if(ok){ g.querySelector("#_gtcf").remove(); g.querySelector("#_gtc").style.display=""; err("เปลี่ยนรหัสแล้ว ใช้รหัสใหม่ได้เลย"); }
        };
      };
      document.body.appendChild(g);
      document.addEventListener("keydown",keyh);
      ["pointerdown","keydown","touchstart"].forEach(ev=>document.addEventListener(ev,()=>{ if(g.style.display==="none") resetIdle(); }, {passive:true}));
      dots();
      window.Gate._lock=lock; // expose for manual lock if needed
    }
  };
  window.Gate=Gate;
})();
