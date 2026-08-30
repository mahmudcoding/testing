// Click the chat-message reaction trigger on message index QA_IDX and report everything.
export default async ({page}) => {
  const out={};
  const t = page.locator('[data-testid="call-controls-chat-toggle"]').first();
  if (await t.getAttribute('aria-pressed')!=='true'){ const b=await t.boundingBox(); await page.mouse.click(b.x+b.width/2,b.y+b.height/2); await page.waitForTimeout(2500); }
  const idx=+(process.env.QA_IDX||0);
  const trig = page.locator('[data-testid="ic-message-react-trigger"]').nth(idx);
  out.trigCount = await page.locator('[data-testid="ic-message-react-trigger"]').count();
  if(!out.trigCount) return out;
  out.trig = await trig.evaluate(e=>({dis:e.disabled, ariaDis:e.getAttribute('aria-disabled'), exp:e.getAttribute('aria-expanded'),
    rect:Math.round(e.getBoundingClientRect().width)+'x'+Math.round(e.getBoundingClientRect().height)}));
  const box = await trig.boundingBox();
  if(!box) { out.err='no box'; return out; }
  await page.mouse.click(box.x+box.width/2, box.y+box.height/2);
  await page.waitForTimeout(2500);
  out.picker = await page.evaluate(()=>{
    const vis = el=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
      let n=el,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;} return op>0.05;};
    const cands=[...document.querySelectorAll('[role=menu],[data-radix-popper-content-wrapper],[role=dialog],[frimousse-emoji]')].filter(vis);
    const m=cands[cands.length-1];
    return m? {txt:(m.innerText||'').replace(/\s+/g,' ').slice(0,120), n:[...m.querySelectorAll('button')].filter(vis).length,
      first:[...m.querySelectorAll('button')].filter(vis).slice(0,8).map(b=>(b.innerText||b.getAttribute('aria-label')||'').trim())} : null;});
  if (out.picker && out.picker.n){
    const vis = await page.evaluate(()=>{
      const v = el=>{const r=el.getBoundingClientRect(); return r.width>1&&r.height>1;};
      const cands=[...document.querySelectorAll('[role=menu],[data-radix-popper-content-wrapper],[role=dialog],[frimousse-emoji]')].filter(v);
      const m=cands[cands.length-1]; const b=[...m.querySelectorAll('button')].filter(v)[0];
      const r=b.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2,label:(b.innerText||b.getAttribute('aria-label')||'').trim()};});
    out.picked = vis.label;
    await page.mouse.click(vis.x, vis.y);
    await page.waitForTimeout(3000);
  }
  out.rowAfter = await page.evaluate((i)=>{
    const rows=[...document.querySelectorAll('[data-testid="ic-user-message"]')];
    return rows[i]?{txt:(rows[i].innerText||'').replace(/\s+/g,' ').slice(0,160),
      tids:[...rows[i].querySelectorAll('[data-testid]')].map(e=>e.dataset.testid)}:null;}, idx);
  out.toasts = await page.evaluate(()=>[...document.querySelectorAll('[data-sonner-toast]')].map(t=>(t.innerText||'').replace(/\s+/g,' ').slice(0,120)));
  return out;
};
