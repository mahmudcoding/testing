export default async ({page}) => {
  const out={};
  const idx=+(process.env.QA_IDX||0);
  const trig = page.locator('[data-testid="ic-message-react-trigger"]').nth(idx);
  await page.keyboard.press('Escape'); await page.waitForTimeout(800);
  const box = await trig.boundingBox();
  await page.mouse.click(box.x+box.width/2, box.y+box.height/2);
  await page.waitForTimeout(3500);
  out.picker = await page.evaluate(()=>{
    const vis = el=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
      let n=el,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;} return op>0.05;};
    const cands=[...document.querySelectorAll('[data-radix-popper-content-wrapper],[role=menu],[role=dialog]')].filter(vis)
      .filter(m=>m.dataset.testid!=='call-overlay-expanded');
    const m=cands[cands.length-1]; if(!m) return null;
    const leaves=[...m.querySelectorAll('*')].filter(e=>e.children.length===0&&(e.innerText||'').trim()&&vis(e))
      .map(e=>{const r=e.getBoundingClientRect(); return {t:e.innerText.trim().slice(0,8), tag:e.tagName, x:Math.round(r.x+r.width/2), y:Math.round(r.y+r.height/2)};});
    return {full:(m.innerText||'').replace(/\s+/g,' ').slice(0,200), leafCount:leaves.length, leaves:leaves.slice(0,20)};
  });
  if (out.picker && out.picker.leaves.length){
    const p = out.picker.leaves[0];
    out.clicking = p.t;
    await page.mouse.click(p.x, p.y);
    await page.waitForTimeout(3500);
  }
  out.rowAfter = await page.evaluate((i)=>{
    const rows=[...document.querySelectorAll('[data-testid="ic-user-message"]')];
    return rows[i]?{txt:(rows[i].innerText||'').replace(/\s+/g,' ').slice(0,160),
      tids:[...rows[i].querySelectorAll('[data-testid]')].map(e=>e.dataset.testid)}:null;}, idx);
  out.toasts = await page.evaluate(()=>[...document.querySelectorAll('[data-sonner-toast]')].map(t=>(t.innerText||'').replace(/\s+/g,' ').slice(0,120)));
  return out;
};
