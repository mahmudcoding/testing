import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  await page.keyboard.press('Escape'); await page.waitForTimeout(700);
  const probeCell = async (labelRe, tag) => {
    const info = await page.evaluate(`(() => { ${VISFN}
      const c=[...document.querySelector('main').querySelectorAll('button')].filter(vis)
        .filter(b=>${labelRe}.test(b.getAttribute('aria-label')||''));
      if(!c.length) return {exists:false};
      const el=c[0]; const cs=getComputedStyle(el); const r=el.getBoundingClientRect();
      return {exists:true, label:el.getAttribute('aria-label'), disabled:el.disabled,
              ariaDisabled:el.getAttribute('aria-disabled'), pe:cs.pointerEvents, cursor:cs.cursor,
              opacity:cs.opacity, title:el.getAttribute('title')||null,
              cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
    if(!info.exists) return {tag, ...info};
    const feedback = `(() => { ${VISFN}
      const big=[...document.querySelectorAll('[role=dialog],[role=alertdialog]')].filter(e=>e.getBoundingClientRect().width>80);
      const notes=[...document.querySelectorAll('[role=alert],[role=status],[role=tooltip],[data-sonner-toast]')].filter(vis)
        .map(n=>(n.innerText||'').replace(/\\s+/g,' ').trim()).filter(Boolean);
      return {dialogs:big.length, notes:notes.slice(0,3)}; })()`;
    const pre = await page.evaluate(feedback);
    await page.mouse.move(info.cx, info.cy); await page.waitForTimeout(500);
    const hover = await page.evaluate(feedback);
    await page.mouse.down(); await page.waitForTimeout(140); await page.mouse.up();
    const s=[]; for(let i=0;i<10;i++){ await page.waitForTimeout(350); s.push(await page.evaluate(feedback)); }
    const after = s[s.length-1];
    const anyDialog = s.some(x=>x.dialogs>0); const anyNote = s.some(x=>x.notes.length>0);
    await page.keyboard.press('Escape'); await page.waitForTimeout(1200);
    await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
       const d=[...document.querySelectorAll('[role=alertdialog],[role=dialog]')].filter(e=>e.getBoundingClientRect().width>80).pop();
       if(d) clickDeepest(d, /^(Discard|Yes|Close)$/); })()`);
    await page.waitForTimeout(1200);
    return {tag, label:info.label, disabled:info.disabled, ariaDisabled:info.ariaDisabled,
            pointerEvents:info.pe, cursor:info.cursor, opacity:info.opacity, title:info.title,
            pre, hover, after, anyDialog, anyNote};
  };
  const header = async () => await page.evaluate(`(() => { const t=((document.querySelector('main')||document.body).innerText||'').replace(/\\s+/g,' ');
     const m=t.match(/\\d{1,2}\\s*[–-]\\s*\\d{1,2}\\s+\\w+\\s+\\d{4}/); return m?m[0]:t.slice(0,40); })()`);
  out.currentWeek = await header();
  out.pastDayThisWeek = await probeCell('/Monday at 14:00/','Mon 24 Aug — past day, current week');
  out.futureDayThisWeek = await probeCell('/Friday at 14:00/','Fri 28 Aug — future day, current week');
  for (let i=0;i<2;i++){ await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
      return clickDeepest(document.querySelector('main'), /^(Previous|Prev|Back)$/); })()`); await page.waitForTimeout(3500); }
  out.pastWeekHeader = await header();
  out.pastWeek = await probeCell('/Thursday at 14:00/','Thu — two weeks ago');
  return out;
};
