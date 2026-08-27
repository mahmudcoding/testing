export default async ({page}) => {
  const WS='W4QEF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const chip = page.locator('button[data-testid="calendar-event-chip"]').filter({hasText:'QA-E Sync 2'}).first();
  await chip.scrollIntoViewIfNeeded(); await page.waitForTimeout(600);
  await chip.click(); await page.waitForTimeout(3500);
  const dump = (tag) => page.evaluate((tag)=>{
    const d=document.querySelector('[role=dialog]'); if(!d) return {tag, none:true};
    const btns=[...d.querySelectorAll('button')].map(b=>{
      const r=b.getBoundingClientRect(); const cs=getComputedStyle(b);
      let op=1,e=b; for(let i=0;i<8&&e;i++){op*=parseFloat(getComputedStyle(e).opacity||'1'); e=e.parentElement;}
      return {t:(b.getAttribute('aria-label')||b.innerText||'').replace(/\n/g,' ').trim().slice(0,22),
        w:Math.round(r.width),h:Math.round(r.height), disp:cs.display, visb:cs.visibility, op:+op.toFixed(2)};
    });
    return {tag, btns};
  }, tag);
  const out={};
  out.rest = await dump('rest');
  // hover over the dialog body
  const d = page.locator('[role=dialog]').first();
  const box = await d.boundingBox();
  if(box){ await page.mouse.move(box.x+box.width/2, box.y+30); await page.waitForTimeout(1200); }
  out.hovered = await dump('hovered');
  return out;
};
