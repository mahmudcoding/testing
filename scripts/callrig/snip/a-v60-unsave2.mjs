const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  const reqs=[]; page.on('response', async r=>{const u=r.url(); if(u.includes('/api/v1/')&&r.request().method()!=='GET'){
    let b=null;try{b=(await r.text()).slice(0,70);}catch(e){}
    reqs.push({m:r.request().method(),u:u.split('/api/v1/')[1].slice(0,44),s:r.status(),res:b});}});
  // A) does the original message's Save button toggle after saving?
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/c/C4QAGENERAL0001',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const oid = await page.evaluate((vs)=>{const vis=eval(vs);
    const m=[...document.querySelectorAll('[data-message-id]')].filter(vis).filter(x=>/V60-SAVED/.test(x.innerText||''));
    return m[m.length-1]?.getAttribute('data-message-id');},VS);
  const oel = await page.$(`[data-message-id="${oid}"]`);
  await oel.scrollIntoViewIfNeeded(); await oel.hover(); await page.waitForTimeout(900);
  out.originalToolbar = await page.evaluate(([vs,id])=>{const vis=eval(vs);
    return [...document.querySelector(`[data-message-id="${id}"]`).querySelectorAll('button')].filter(vis)
      .map(b=>(b.getAttribute('aria-label')||'').slice(0,24)).filter(Boolean);},[VS,oid]);

  // B) delete the saved copy from Saved Messages, polling from before the click
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/chat/saved',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3800);
  const list = () => page.evaluate((vs)=>{const vis=eval(vs);
    const m=[...document.querySelectorAll('[data-message-id]')].filter(vis);
    return {n:m.length, ids:m.map(x=>x.getAttribute('data-message-id')),
      dialog:[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(vis).map(d=>(d.innerText||'').replace(/\s+/g,' ').slice(0,80))};},VS);
  out.savedBefore = await list();
  const sid = out.savedBefore.ids[0];
  if(!sid) return {...out, note:'saved empty'};
  const srow = await page.$(`[data-message-id="${sid}"]`);
  await srow.hover(); await page.waitForTimeout(700);
  await page.click(`[data-message-id="${sid}"] button[aria-label="More actions"]`);
  await page.waitForTimeout(800);
  // click Delete in the menu
  const clicked = await page.evaluate((vs)=>{const vis=eval(vs);
    const it=[...document.querySelectorAll('[role="menuitem"],[role="menu"] button')].filter(vis).find(b=>/^Delete$/i.test((b.innerText||'').trim()));
    if(!it) return false; it.click(); return true;},VS);
  out.deleteClicked = clicked;
  const poll=[]; for(let i=0;i<8;i++){ poll.push({t:i*400, ...(await list())}); await page.waitForTimeout(400); }
  out.confirmDialog = poll.find(p=>p.dialog.length)?.dialog ?? null;
  // confirm if a dialog appeared
  if(out.confirmDialog){
    await page.evaluate((vs)=>{const vis=eval(vs);
      const d=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(vis)[0];
      const b=[...d.querySelectorAll('button')].filter(vis).find(b=>/delete|confirm|yes/i.test(b.innerText||''));
      b?.click();},VS);
    const p2=[]; for(let i=0;i<10;i++){ p2.push({t:i*400, ...(await list())}); await page.waitForTimeout(400); }
    out.afterConfirm_goneAtMs = p2.find(p=>!p.ids.includes(sid))?.t ?? null;
    out.afterConfirm_last = p2[p2.length-1];
  } else {
    out.goneAtMs = poll.find(p=>!p.ids.includes(sid))?.t ?? null;
    out.last = poll[poll.length-1];
  }
  out.requests = reqs.slice();
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(3600);
  out.afterReload = await list();
  return out;
};
