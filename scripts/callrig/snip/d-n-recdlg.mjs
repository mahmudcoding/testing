export default async ({page}) => {
  const out={};
  const b = page.locator('[data-testid="recording-start-access-trigger"]').first();
  out.found = await b.count();
  if(!out.found) return out;
  const box=await b.boundingBox(); await page.mouse.click(box.x+box.width/2,box.y+box.height/2);
  await page.waitForTimeout(3000);
  out.dlg = await page.evaluate(()=>{
    const vis = el=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
      let n=el,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;} return op>0.05;};
    const d=[...document.querySelectorAll('[role=dialog]')].find(x=>/Recording access/.test(x.innerText||''));
    if(!d) return null;
    // structure: each radio and the text nearest it
    const radios=[...d.querySelectorAll('[role=radio],input[type=radio]')].map(r=>{
      // nearest ancestor containing exactly one radio
      let n=r; while(n && n.parentElement && n.parentElement.querySelectorAll('[role=radio],input[type=radio]').length===1) n=n.parentElement;
      return {checked:r.getAttribute('aria-checked')??r.checked, tid:r.dataset.testid||null,
        text:(n.innerText||'').replace(/\s+/g,' ').trim()};});
    const warn=d.querySelector('[data-testid="recording-access-broad-audience-warning"]');
    return {fullLen:(d.innerText||'').replace(/\s+/g,' ').length, full:(d.innerText||'').replace(/\s+/g,' '),
      radios, warning: warn?{text:(warn.innerText||'').replace(/\s+/g,' ').trim(), vis:vis(warn)}:null,
      leaves:[...d.querySelectorAll('*')].filter(e=>e.children.length===0&&(e.innerText||'').trim()&&vis(e)).map(e=>e.innerText.replace(/\s+/g,' ').trim())};
  });
  return out;
};
