import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  const names = `(() => { ${VISFN}
     const m=document.querySelector('main');
     return [...m.querySelectorAll('button,[role=button],a')].filter(vis)
       .map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim())
       .filter(t=>/\\.(png|txt|jpg|pdf)/i.test(t))
       .map(t=>t.split(/\\d+\\s?(B|KB|MB)/)[0].trim()).slice(0,12); })()`;
  const clickSort = async label => { const t=await page.evaluate(`(() => { ${VISFN}
      const b=[...document.querySelector('main').querySelectorAll('button')].filter(vis)
        .find(x=>(x.textContent||'').trim()===${JSON.stringify(label)});
      if(!b) return {none:true}; const r=b.getBoundingClientRect();
      return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2), pressed:b.getAttribute('aria-pressed')}; })()`);
    if(t.none) return {label, r:'not found'};
    await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(260);
    await page.mouse.down(); await page.waitForTimeout(120); await page.mouse.up();
    await page.waitForTimeout(3000);
    return {label, before:t.pressed, order: await page.evaluate(names)};
  };
  out.initial = await page.evaluate(names);
  out.byName = await clickSort('Name');
  out.bySize = await clickSort('Size');
  out.byDate = await clickSort('Date');
  out.nameSortedCorrectly = (()=>{ const a=out.byName.order||[];
    const s=[...a].sort((x,y)=>x.localeCompare(y,'en'));
    return JSON.stringify(a)===JSON.stringify(s) || JSON.stringify(a)===JSON.stringify(s.reverse()); })();
  // calendar Today from a distant month
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8500);
  const header = `(() => { const t=((document.querySelector('main')||document.body).innerText||'').replace(/\\s+/g,' ');
     const m=t.match(/\\d{1,2}\\s*[–-]\\s*\\d{1,2}\\s+\\w+\\s+\\d{4}|\\w+\\s+\\d{4}/); return m?m[0]:t.slice(0,40); })()`;
  out.calStart = await page.evaluate(header);
  for(let i=0;i<6;i++){ await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
      clickDeepest(document.querySelector('main'), /^Next$/); })()`); await page.waitForTimeout(2500); }
  out.calAfterNext = await page.evaluate(header);
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
     clickDeepest(document.querySelector('main'), /^Today$/); })()`);
  await page.waitForTimeout(4000);
  out.calAfterToday = await page.evaluate(header);
  out.todayWorks = out.calAfterToday===out.calStart;
  return out;
};
