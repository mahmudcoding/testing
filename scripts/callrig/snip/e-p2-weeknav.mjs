import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={}; const res=[];
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  await page.keyboard.press('Escape'); await page.waitForTimeout(800);
  const clickSlot = async (labelRe) => {
    const pick = await page.evaluate(`(() => { ${VISFN}
      const c=[...document.querySelector('main').querySelectorAll('button')].filter(vis)
        .filter(b=>${labelRe}.test(b.getAttribute('aria-label')||''));
      if(!c.length) return null; const el=c[0]; const r=el.getBoundingClientRect();
      return {label:el.getAttribute('aria-label'), cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
    if(!pick) return {err:'no slot'};
    await page.mouse.move(pick.cx,pick.cy); await page.waitForTimeout(300);
    await page.mouse.down(); await page.waitForTimeout(120); await page.mouse.up();
    await page.waitForTimeout(3500);
    const f = await page.evaluate(`(() => { ${VISFN}
      const d=[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>80).pop();
      if(!d) return 'no dialog'; const o={};
      ['event-start','event-start-time','event-end','event-end-time'].forEach(k=>{
        const i=d.querySelector('input[data-field="'+k+'"]'); o[k]=i?String(i.value||''):'(absent)'; });
      return o; })()`);
    await page.keyboard.press('Escape'); await page.waitForTimeout(1500);
    // some forms confirm discard
    await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
       const d=[...document.querySelectorAll('[role=alertdialog],[role=dialog]')].filter(e=>e.getBoundingClientRect().width>80).pop();
       if(d) clickDeepest(d, /^(Discard|Yes|Close|Leave)$/); })()`);
    await page.waitForTimeout(1500);
    return {clicked:pick.label, prefill:f};
  };
  const header = async () => await page.evaluate(`(() => { const t=((document.querySelector('main')||document.body).innerText||'').replace(/\\s+/g,' ');
     const m=t.match(/\\d{1,2}\\s*[–-]\\s*\\d{1,2}\\s+\\w+\\s+\\d{4}|\\w+\\s+\\d{4}/); return m?m[0]:t.slice(0,50); })()`);
  out.week0 = { header: await header(), ...(await clickSlot('/Thursday at 14:00/')) };
  // navigate forward two weeks
  for (let i=0;i<2;i++){
    await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
       return clickDeepest(document.querySelector('main'), /^Next$/); })()`);
    await page.waitForTimeout(3500);
  }
  out.week2 = { header: await header(), ...(await clickSlot('/Thursday at 14:00/')) };
  // and back four (two weeks before today)
  for (let i=0;i<4;i++){
    await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
       return clickDeepest(document.querySelector('main'), /^(Previous|Prev|Back)$/); })()`);
    await page.waitForTimeout(3500);
  }
  out.weekMinus2 = { header: await header(), ...(await clickSlot('/Thursday at 14:00/')) };
  return out;
};
