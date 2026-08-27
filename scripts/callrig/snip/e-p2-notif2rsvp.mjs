import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/directories', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  out.notifs = await page.evaluate(`(async()=>{const r=await fetch('/api/v1/notifications?limit=10',{credentials:'include'});const j=await r.json().catch(()=>({}));
    const a=j?.notifications||j?.data||[]; return a.slice(0,5).map(n=>'type='+(n.type)+' "'+String(n.title||'').slice(0,28)+'" read='+!!(n.is_read||n.read_at)); })()`);
  await page.locator('button[aria-label^="Notifications"]').first().click();
  await page.waitForTimeout(2500);
  out.panelRows = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    return d? [...d.querySelectorAll('li button')].filter(vis).map(b=>(b.innerText||'').replace(/\\s+/g,' ').slice(0,60)) : ['no panel']; })()`);
  // click an invitation row if present, else the first row
  const target = page.locator('li button').filter({hasText:/invitation|invited|RSVP three/i}).first();
  const n = await page.locator('li button').filter({hasText:/invitation|invited|RSVP three/i}).count();
  out.invitationRows = n;
  const clickTarget = n ? target : page.locator('li button').first();
  await clickTarget.click();
  await page.waitForTimeout(6000);
  out.landedUrl = page.url().replace(/^https:\/\/[^/]+/,'');
  const btns = `(() => { ${VISFN} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    if(!d) return 'NO CARD';
    return {title:(d.innerText||'').replace(/\\n+/g,' | ').slice(0,120),
      yesno: [...d.querySelectorAll('button')].filter(vis).filter(b=>/^(Yes|No)$/.test((b.textContent||'').trim()))
        .map(b=>(b.textContent||'').trim()+(b.disabled?':DIS':':en')).join(',')}; })()`;
  const t=[]; for(let i=0;i<10;i++){ await page.waitForTimeout(900); const s=await page.evaluate(btns); t.push(typeof s==='string'?s:s.yesno); }
  out.afterNotifClick = await page.evaluate(btns);
  out.settleTrace = [...new Set(t)].join(' -> ');
  return out;
};
