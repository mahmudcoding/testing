const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  const reqs=[]; page.on('response', async r=>{const u=r.url(); if(u.includes('/api/v1/')&&r.request().method()!=='GET'){
    let b=null;try{b=(await r.text()).slice(0,90);}catch(e){}
    reqs.push({m:r.request().method(),u:u.split('/api/v1/')[1].slice(0,48),s:r.status(),res:b});}});
  // 1) save the probe message
  const id = await page.evaluate((vs)=>{const vis=eval(vs);
    const m=[...document.querySelectorAll('[data-message-id]')].filter(vis).filter(x=>/V60-SAVED/.test(x.innerText||''));
    return m[m.length-1]?.getAttribute('data-message-id');},VS);
  const el = await page.$(`[data-message-id="${id}"]`);
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(800);
  await page.click(`[data-message-id="${id}"] button[aria-label="Save"]`);
  await page.waitForTimeout(2000);
  out.saveRequests = reqs.slice(); reqs.length = 0;

  // 2) open Saved Messages
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/chat/saved',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3800);
  const list = () => page.evaluate((vs)=>{const vis=eval(vs);
    const m=[...document.querySelectorAll('[data-message-id]')].filter(vis);
    return {n:m.length, ids:m.map(x=>x.getAttribute('data-message-id')),
            txts:m.map(x=>(x.innerText||'').replace(/\s+/g,' ').slice(0,44)),
            emptyState:/nothing saved|no saved|empty/i.test(document.querySelector('[data-testid="app-shell-main-column"]')?.innerText||'')};},VS);
  out.savedListBefore = await list();
  out.probePresent = out.savedListBefore.ids.includes(id);
  if(!out.probePresent) return {...out, id, note:'probe not in saved list'};

  // 3) unsave from within the Saved Messages list, polling from before the click
  const row = await page.$(`[data-message-id="${id}"]`);
  await row.hover(); await page.waitForTimeout(800);
  out.rowActions = await page.evaluate(([vs,id])=>{const vis=eval(vs);
    return [...document.querySelector(`[data-message-id="${id}"]`).querySelectorAll('button')].filter(vis)
      .map(b=>(b.getAttribute('aria-label')||'').slice(0,26));},[VS,id]);
  const unsaveSel = out.rowActions.find(a=>/unsave|remove|saved/i.test(a)) || 'Save';
  await page.click(`[data-message-id="${id}"] button[aria-label="${unsaveSel}"]`).catch(e=>out.clickErr=String(e).slice(0,80));
  const poll=[]; for(let i=0;i<10;i++){ poll.push({t:i*400, ...(await list())}); await page.waitForTimeout(400); }
  out.unsaveClicked = unsaveSel;
  out.afterUnsave_first = poll[0]; out.afterUnsave_last = poll[poll.length-1];
  out.goneAtMs = poll.find(p=>!p.ids.includes(id))?.t ?? null;
  out.unsaveRequests = reqs.slice();
  // 4) reload truth
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(3600);
  out.afterReload = await list();
  out.stillThereAfterReload = out.afterReload.ids.includes(id);
  return out;
};
