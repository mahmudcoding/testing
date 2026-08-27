// Wrong 2FA code: poll notices from BEFORE the Confirm click, keep max opacity,
// key on text+size, and also scan role-less inline error text.
export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/security`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  const out={};
  await page.evaluate(()=>{const b=[...document.querySelectorAll('main button')].find(x=>/^Enable$/.test(x.innerText.trim())); if(b)b.click();});
  await page.waitForTimeout(4000);
  out.pending = await page.evaluate(()=>{
    const m=document.querySelector('main');
    return [...m.querySelectorAll('button,input')].filter(e=>{const r=e.getBoundingClientRect();return r.width>2&&r.height>2;})
      .map(e=>`${e.disabled?'(dis)':''}${((e.getAttribute('aria-label')||e.innerText||e.placeholder)||'').trim().slice(0,22)}`);
  });
  await page.locator('main input[placeholder="123456"]').first().fill('000000');
  await page.waitForTimeout(600);
  // poll from BEFORE the click
  await page.evaluate(()=>{ window.__n=[];
    window.__id=setInterval(()=>{
      const push=(t,el)=>{ if(!t||t.length>170) return;
        const r=el.getBoundingClientRect(); if(r.width<3||r.height<3) return;
        let n=el,o=1; while(n&&n!==document.documentElement){o*=parseFloat(getComputedStyle(n).opacity||'1'); n=n.parentElement;}
        const k=t+'|'+Math.round(r.width)+'x'+Math.round(r.height);
        const p=window.__n.find(x=>x.k===k); if(p){p.maxOp=Math.max(p.maxOp,o); p.n++;}
        else window.__n.push({k,txt:t.slice(0,90),w:Math.round(r.width),h:Math.round(r.height),maxOp:o,n:1}); };
      for(const e of document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast]')) push((e.textContent||'').replace(/\s+/g,' ').trim(), e);
      // role-less inline error text as well
      const m=document.querySelector('main');
      for(const e of m.querySelectorAll('p,span,div')) { if(e.children.length) continue;
        const cls=(typeof e.className==='string'?e.className:'');
        const t=(e.textContent||'').replace(/\s+/g,' ').trim();
        if(/red|error|danger/i.test(cls) || /(invalid|incorrect|expired|wrong code|does not match|attempts)/i.test(t)) push(t,e); }
    },120);
  });
  await page.waitForTimeout(400);
  const reqs=[]; const on=r=>{try{const u=new URL(r.url()); if(u.pathname.startsWith('/api/v1/')) reqs.push(`${r.request().method()} ${u.pathname} -> ${r.status()}`);}catch{}};
  page.on('response', on);
  await page.evaluate(()=>{const b=[...document.querySelectorAll('main button')].find(x=>/^Confirm$/.test(x.innerText.trim())); if(b&&!b.disabled)b.click();});
  await page.waitForTimeout(8000);
  out.reqs=reqs.filter(r=>/2fa/i.test(r)); page.off('response', on);
  out.notices = await page.evaluate(()=>{clearInterval(window.__id); return window.__n;});
  // discard the pending setup and confirm the account is unchanged
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/account`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3000);
  out.finalState = await page.evaluate(async()=>{const r=await fetch('/api/v1/auth/me',{credentials:'include'});
    const j=await r.json(); return {two_fa_enabled:j.two_fa_enabled};});
  return out;
};
