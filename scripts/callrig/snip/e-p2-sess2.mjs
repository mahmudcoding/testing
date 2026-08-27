import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/settings/sessions', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  out.api = await page.evaluate(`(async () => {
    const r=await fetch('/api/v1/security/sessions',{credentials:'include'});const d=await r.json();
    const s=d.sessions||[];
    return {count:s.length, rows:s.map(x=>({cur:x.is_current, ua:(x.user_agent||'').slice(0,42), ip:x.ip_address, last:x.last_used_at}))};
  })()`);
  const paneInter = `(() => { ${VISFN}
    const m=document.querySelector('main')||document.body; const nav=m.querySelector('nav');
    return [...m.querySelectorAll('button,a[href],[role=button],[role=menuitem],input,svg[role]')]
      .filter(n=>vis(n) && (!nav||!nav.contains(n)))
      .map(n=>n.tagName.toLowerCase()+' "'+((n.getAttribute('aria-label')||n.textContent||'').replace(/\\s+/g,' ').trim().slice(0,44))+'"'); })()`;
  out.beforeHover = await page.evaluate(paneInter);
  out.paneText = await page.evaluate(`(() => { const m=document.querySelector('main')||document.body;
     const t=(m.innerText||'').replace(/\\s+/g,' '); const i=t.indexOf('Active sessions'); return t.slice(i,i+520); })()`);
  // hover each session row in turn and re-enumerate
  out.hover = [];
  const n = await page.evaluate(`(() => { ${VISFN}
     const m=document.querySelector('main');
     const rows=[...m.querySelectorAll('div,li')].filter(e=>vis(e)&&/Mozilla\\/5\\.0/.test(e.innerText||'')&&(e.innerText||'').length<400);
     const inner=rows.filter(r=>!rows.some(o=>o!==r&&r.contains(o)));
     window.__rows=inner; return inner.length; })()`);
  out.rowCount = n;
  for (let i=0;i<n;i++){
    await page.evaluate(`(() => { const r=window.__rows[`+i+`]; const b=r.getBoundingClientRect();
       r.dispatchEvent(new MouseEvent('mouseover',{bubbles:true}));
       r.dispatchEvent(new MouseEvent('mouseenter',{bubbles:true})); return b.top; })()`);
    const box = await page.evaluate(`(() => { const b=window.__rows[`+i+`].getBoundingClientRect(); return {x:b.x+b.width/2,y:b.y+b.height/2}; })()`);
    await page.mouse.move(box.x, box.y); await page.waitForTimeout(1200);
    out.hover.push({ i, label:(await page.evaluate(`(() => (window.__rows[`+i+`].innerText||'').replace(/\\s+/g,' ').slice(0,90))()`)),
                     controls: await page.evaluate(paneInter) });
  }
  return out;
};
