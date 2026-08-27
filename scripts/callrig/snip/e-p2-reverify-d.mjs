import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<120||r.height<80) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={}; const posts=[];
  page.on('response', r => { const u=r.url();
    if(u.includes('/api/v1/calendar/meetings')&&r.request().method()==='POST')
      posts.push((r.request().postData()||'').slice(0,420)); });

  // F10 — Reset all in Display settings does not reset the theme
  await page.goto(BASE+'/w/'+WS+'/settings/appearance', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8500);
  const themeState = `(() => { ${VISFN}
     const m=document.querySelector('main');
     const b=[...m.querySelectorAll('button')].filter(vis)
       .filter(x=>/^(Light|Dark|System)$/.test((x.textContent||'').trim()));
     return { buttons:b.map(x=>(x.textContent||'').trim()+'/p='+x.getAttribute('aria-pressed')),
              rootTheme:document.documentElement.getAttribute('data-theme'),
              density:document.documentElement.getAttribute('data-density'),
              prefersDark: matchMedia('(prefers-color-scheme: dark)').matches }; })()`;
  out.F10 = {initial: await page.evaluate(themeState)};
  const clickText = async re => { const t=await page.evaluate(`(() => { ${VISFN}
      const b=[...document.querySelector('main').querySelectorAll('button')].filter(vis)
        .find(x=>${re}.test((x.textContent||'').trim()));
      if(!b) return {none:true}; const r=b.getBoundingClientRect();
      return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
    if(t.none) return 'not found';
    await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(260);
    await page.mouse.down(); await page.waitForTimeout(120); await page.mouse.up();
    await page.waitForTimeout(2600); return 'clicked'; };
  out.F10.setDark = await clickText('/^Dark$/');
  out.F10.afterDark = await page.evaluate(themeState);
  out.F10.resetAll = await clickText('/^Reset all$/');
  await page.waitForTimeout(3000);
  out.F10.afterReset = await page.evaluate(themeState);
  out.F10.holds = out.F10.afterReset.rootTheme==='dark';
  // restore
  await clickText('/^System$/'); await page.waitForTimeout(2000);
  out.F10.restored = await page.evaluate(themeState);

  // F6 — the chosen reminder never reaches the create request
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8500);
  await page.getByRole('button',{name:'New meeting'}).first().click();
  await page.waitForTimeout(3400);
  await page.locator('input[data-field="event-title"]').first().fill('QA-E reverify reminder');
  await page.locator('input[data-field="event-start"]').first().fill('2026-09-20'); await page.waitForTimeout(350);
  await page.locator('input[data-field="event-start-time"]').first().fill('10:00'); await page.waitForTimeout(350);
  await page.locator('input[data-field="event-end"]').first().fill('2026-09-20'); await page.waitForTimeout(350);
  await page.locator('input[data-field="event-end-time"]').first().fill('10:30'); await page.waitForTimeout(900);
  out.F6 = {reminderPick: await clickText('/^15 minutes before$/')};
  out.F6.shownValue = await page.evaluate(`(() => { ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     const t=(d.innerText||'').replace(/\\s+/g,' ');
     const i=t.indexOf('reminder'); const j=t.toLowerCase().indexOf('reminder');
     return t.slice(Math.max(0,j-60), j+80); })()`);
  posts.length=0;
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     clickDeepest(d, /^Schedule meeting$/); })()`);
  await page.waitForTimeout(8000);
  out.F6.request = posts[0]||'(no POST captured)';
  out.F6.hasReminderField = /remind|notify|alert/i.test(out.F6.request);
  out.F6.holds = out.F6.hasReminderField===false && out.F6.request!=='(no POST captured)';
  return out;
};
