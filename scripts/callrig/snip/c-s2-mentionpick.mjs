// Type "@" in the composer and watch what the mention picker offers.
export default async ({page}) => {
  const out={vis:await page.evaluate(()=>document.visibilityState), samples:[]};
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  await comp.click();
  await page.keyboard.press('Control+A'); await page.keyboard.press('Backspace');
  await page.waitForTimeout(200);
  // start polling before the trigger
  await page.evaluate(()=>{
    window.__mp={s:[],t0:performance.now()};
    window.__mpId=setInterval(()=>{
      const rows=[...document.querySelectorAll('[role="option"],[role="listbox"] li,[data-testid*="mention"]')]
        .filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;});
      window.__mp.s.push({t:Math.round(performance.now()-window.__mp.t0),
        n:rows.length, txt:rows.map(r=>r.textContent.trim().slice(0,34))});
    },150);
  });
  await page.waitForTimeout(400);
  await comp.type('@', {delay:60});
  await page.waitForTimeout(1600);
  const afterAt = await page.evaluate(()=>JSON.parse(JSON.stringify(window.__mp.s)));
  out.afterAt = afterAt.filter(s=>s.n>0).slice(0,2).concat(afterAt.slice(-1));
  // now narrow
  await comp.type('da', {delay:80});
  await page.waitForTimeout(1200);
  out.afterDa = await page.evaluate(()=>{
    const s=window.__mp.s; return JSON.parse(JSON.stringify(s.slice(-2)));
  });
  await page.evaluate(()=>clearInterval(window.__mpId));
  out.composerText = await comp.evaluate(e=>e.innerText.slice(0,80));
  await page.keyboard.press('Control+A'); await page.keyboard.press('Backspace');
  return out;
};
