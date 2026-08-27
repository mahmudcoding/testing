import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={}; const writes=[];
  page.on('response', async r=>{ const u=r.url(); if(u.includes('/api/v1/')&&r.request().method()!=='GET'){
    let b=''; try{ b=(await r.text()).slice(0,260);}catch(e){}
    writes.push(r.request().method()+' '+u.replace(/^https:\/\/[^/]+/,'').slice(0,55)+' -> '+r.status()+' '+b); }});
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  await page.getByRole('button',{name:'New meeting'}).first().click();
  await page.waitForTimeout(3000);
  await page.locator('input[aria-label="Add title"]').first().fill('QA-E RSVP two');
  await page.locator('input[aria-label="Starts time"]').first().fill('21:00');
  await page.waitForTimeout(500);
  await page.locator('input[aria-label="Ends time"]').first().fill('21:30');
  await page.waitForTimeout(500);
  const sm = page.locator('input[aria-label="Search members"]').first();
  await sm.scrollIntoViewIfNeeded();
  await sm.fill('Bob');
  await page.waitForTimeout(2200);
  out.searchResults = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    return interactives(d).filter(x=>/QA /.test(x.label)).map(x=>'<'+x.tag+'> "'+x.label.slice(0,26)+'"'); })()`);
  out.picked = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    const n=[...d.querySelectorAll('button,[role=option],li')].filter(vis).find(x=>/QA Bob/.test(x.textContent||''));
    if(!n) return 'not found'; n.click(); return 'clicked <'+n.tagName+'>'; })()`);
  await page.waitForTimeout(2000);
  out.selectedState = await page.evaluate(`(() => { ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    return (d.innerText.match(/Selected \\(\\d+\\)[\\s\\S]{0,50}/)||['(no Selected marker)'])[0].replace(/\\n+/g,' ').slice(0,80); })()`);
  writes.length=0;
  await page.getByRole('button',{name:'Schedule meeting', exact:true}).first().click();
  await page.waitForTimeout(6000);
  out.writes = writes.slice(0,3);
  return out;
};
