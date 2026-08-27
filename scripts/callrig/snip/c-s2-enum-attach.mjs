const DIR='/private/tmp/claude-501/-Users-mahmud-Projects-testing/be46af86-e91b-43a7-99c1-153a85741b82/scratchpad/files';
export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  for(let i=0;i<8;i++){ if((await comp.evaluate(e=>e.innerText.trim()))==='') break;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(220); }
  await page.locator('input[type=file]').first().setInputFiles(`${DIR}/qa-s2-m1.png`);
  await page.waitForTimeout(4500);
  return page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect(); if(r.width<3||r.height<3||r.top<520) return false;
      let o=1,n=e; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
        o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden') return false; n=n.parentElement;}
      return o>0.05;};
    return [...document.querySelectorAll('button,[role="button"],[role="switch"]')].filter(v)
      .map(b=>({al:b.getAttribute('aria-label'), t:(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,26),
        role:b.getAttribute('role'), pressed:b.getAttribute('aria-pressed'),
        y:Math.round(b.getBoundingClientRect().top)}))
      .filter(x=>x.al||x.t);});
};
