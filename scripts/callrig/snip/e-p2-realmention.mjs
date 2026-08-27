import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  const comp = page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  await comp.click(); await page.waitForTimeout(500);
  await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(600);
  out.emptied = await page.evaluate(`(() => { const c=document.querySelector('div[contenteditable="true"][aria-label="Compose message"]');
     return (c.innerText||'').trim().length; })()`);
  await page.keyboard.type('@Ali'); await page.waitForTimeout(3000);
  out.picker = await page.evaluate(`(() => { ${VISFN}
     const opts=[...document.querySelectorAll('[role=option],[role=listbox] *,[data-state=open] button')].filter(vis)
       .map(n=>(n.textContent||'').replace(/\\s+/g,' ').trim()).filter(x=>x&&x.length<40);
     return [...new Set(opts)].slice(0,6); })()`);
  const t = await page.evaluate(`(() => { ${VISFN}
     const cands=[...document.querySelectorAll('[role=option],[data-state=open] button,li')].filter(vis)
       .filter(n=>/QA Alice/.test(n.textContent||'') && (n.textContent||'').length<40);
     const inner=cands.filter(c=>!cands.some(o=>o!==c&&c.contains(o)));
     const e=inner[0]; if(!e) return {none:true}; const r=e.getBoundingClientRect();
     return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  out.pick=t;
  if(!t.none){ await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(280);
    await page.mouse.down(); await page.waitForTimeout(130); await page.mouse.up(); await page.waitForTimeout(1500); }
  else { await page.keyboard.press('Enter'); await page.waitForTimeout(1200); }
  await page.keyboard.type(' mention history probe '+process.env.QA_TOK);
  await page.waitForTimeout(800);
  out.composer = await page.evaluate(`(() => { const c=document.querySelector('div[contenteditable="true"][aria-label="Compose message"]');
     return (c.innerText||'').replace(/\\s+/g,' ').slice(0,60); })()`);
  await page.keyboard.press('Enter'); await page.waitForTimeout(6000);
  out.sent = await page.evaluate(`(() => { ${VISFN}
     const msgs=[...document.querySelectorAll('[data-message-id]')].filter(vis);
     return msgs.length? (msgs[msgs.length-1].innerText||'').replace(/\\s+/g,' ').slice(0,90):null; })()`);
  return out;
};
