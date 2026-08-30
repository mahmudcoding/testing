export default async ({page}) => {
  const out={};
  const t = page.locator('[data-testid="call-controls-people-toggle"]').first();
  if (await t.getAttribute('aria-pressed')!=='true'){ const b=await t.boundingBox(); await page.mouse.click(b.x+b.width/2,b.y+b.height/2); await page.waitForTimeout(2500); }
  out.panel = await page.evaluate(()=>{
    const vis = el=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
      let n=el,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;} return op>0.05;};
    const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    if(!p) return null;
    return {full:(p.innerText||'').replace(/\s+/g,' '),
      btns:[...p.querySelectorAll('button')].filter(vis).map(b=>({l:(b.getAttribute('aria-label')||b.innerText||'').trim().replace(/\s+/g,' '),tid:b.dataset.testid||null})),
      testids:[...p.querySelectorAll('[data-testid]')].map(e=>e.dataset.testid)};
  });
  // full-document scan for any 'share' wording, visible only
  out.shareText = await page.evaluate(()=>{
    const vis = el=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
      let n=el,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;} return op>0.05;};
    return [...new Set([...document.querySelectorAll('*')].filter(e=>e.children.length===0&&e.innerText&&/shar|request/i.test(e.innerText)&&vis(e)).map(e=>e.innerText.replace(/\s+/g,' ').trim().slice(0,90)))];});
  out.bell = await page.evaluate(()=>document.querySelector('button[aria-label^="Notifications"]')?.getAttribute('aria-label')||null);
  return out;
};
