const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  const reqs=[]; page.on('response', async r=>{const u=r.url(); if(u.includes('/api/v1/')&&r.request().method()!=='GET'){
    let b=null;try{b=(await r.text()).slice(0,80);}catch(e){}
    reqs.push({m:r.request().method(),u:u.split('/api/v1/')[1].slice(0,46),s:r.status(),res:b});}});
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/chat/saved',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3800);
  const list = () => page.evaluate((vs)=>{const vis=eval(vs);
    const m=[...document.querySelectorAll('[data-message-id]')].filter(vis);
    const main=document.querySelector('[data-testid="app-shell-main-column"]');
    return {n:m.length, ids:m.map(x=>x.getAttribute('data-message-id')),
            mainTxt:(main?.innerText||'').replace(/\s+/g,' ').slice(-120)};},VS);
  out.before = await list();
  const id = out.before.ids[0];
  if(!id) return {...out, note:'saved list empty'};
  const row = await page.$(`[data-message-id="${id}"]`);
  await row.scrollIntoViewIfNeeded(); await row.hover(); await page.waitForTimeout(900);
  out.actions = await page.evaluate(([vs,id])=>{const vis=eval(vs);
    return [...document.querySelector(`[data-message-id="${id}"]`).querySelectorAll('button')].filter(vis)
      .map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().slice(0,26));},[VS,id]);
  const unsave = out.actions.find(a=>/unsave|remove from saved|saved/i.test(a));
  out.chose = unsave || null;
  if(!unsave){  // fall back to More actions menu
    await page.click(`[data-message-id="${id}"] button[aria-label="More actions"]`).catch(()=>{});
    await page.waitForTimeout(900);
    out.menu = await page.evaluate((vs)=>{const vis=eval(vs);
      return [...document.querySelectorAll('[role="menuitem"],[role="menu"] button')].filter(vis).map(b=>(b.innerText||'').trim().slice(0,26));},VS);
    return out;
  }
  await page.click(`[data-message-id="${id}"] button[aria-label="${unsave}"]`);
  const poll=[]; for(let i=0;i<10;i++){ poll.push({t:i*400, ...(await list())}); await page.waitForTimeout(400); }
  out.goneAtMs = poll.find(p=>!p.ids.includes(id))?.t ?? null;
  out.last = poll[poll.length-1]; out.requests=reqs.slice();
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(3600);
  out.afterReload = await list();
  return out;
};
