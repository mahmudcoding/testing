export default async ({page}) => {
  const out={};
  const q = async ()=> await page.evaluate(()=>{
    const vis = el=>{if(!el)return false;const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
      let n=el,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;} return op>0.05;};
    const btns=[...document.querySelectorAll('button')].filter(vis)
      .filter(b=>/mute|microphone|camera|unmute/i.test((b.getAttribute('aria-label')||'')+(b.title||'')))
      .map(b=>({l:b.getAttribute('aria-label')||b.title,dis:b.disabled,ariaDis:b.getAttribute('aria-disabled')}));
    return btns;});
  out.before = await q();
  const s = page.locator('[data-testid="call-controls-settings-toggle"]').first();
  if (await s.getAttribute('aria-pressed')!=='true'){ const b=await s.boundingBox(); await page.mouse.click(b.x+b.width/2,b.y+b.height/2); await page.waitForTimeout(2500); }
  const t = page.locator(`[data-testid="${process.env.QA_TID}"]`).first();
  const b=await t.boundingBox(); await page.mouse.click(b.x+b.width/2,b.y+b.height/2);
  await page.waitForTimeout(4000);
  // close panel to see the toolbar
  const s2 = page.locator('[data-testid="call-controls-settings-toggle"]').first();
  if (await s2.getAttribute('aria-pressed')==='true'){ const bb=await s2.boundingBox(); await page.mouse.click(bb.x+bb.width/2,bb.y+bb.height/2); await page.waitForTimeout(2000); }
  out.after = await q();
  out.explain = await page.evaluate(()=>{
    const vis = el=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
      let n=el,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;} return op>0.05;};
    return [...new Set([...document.querySelectorAll('*')].filter(e=>e.children.length===0&&e.innerText&&/blocked|disabled|not allowed|host has/i.test(e.innerText)&&vis(e)).map(e=>e.innerText.replace(/\s+/g,' ').trim().slice(0,90)))];});
  out.titles = await page.evaluate(()=>[...new Set([...document.querySelectorAll('[title]')].filter(e=>e.getBoundingClientRect().width>1).map(e=>e.getAttribute('title')))]);
  return out;
};
