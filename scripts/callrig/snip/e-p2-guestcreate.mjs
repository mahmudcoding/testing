import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={}; const writes=[];
  page.on('response', async r=>{ const u=r.url(); if(u.includes('/api/v1/')&&r.request().method()!=='GET'){
    let b=''; try{b=(await r.text()).slice(0,240);}catch(e){}
    writes.push(r.request().method()+' '+u.replace(/^https:\/\/[^/]+/,'').slice(0,55)+' -> '+r.status()+' '+b); }});
  out.me = await page.evaluate(`(async()=>{const r=await fetch('/api/v1/auth/me',{credentials:'include'});const j=await r.json().catch(()=>({}));return {email:j?.email,is_guest:j?.is_guest};})()`);
  await page.goto(BASE+'/w/'+WS+'/directories?tab=people', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  out.peopleSeen = await page.evaluate(`(() => { ${VISFN}
    const m=document.querySelector('main');
    return interactives(m).filter(x=>/Open .*profile/.test(x.label)).map(x=>x.label.replace("Open ","").replace("'s profile","")); })()`);
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  await page.getByRole('button',{name:'New meeting'}).first().click();
  await page.waitForTimeout(3000);
  out.dialogOpened = await page.evaluate(`(() => { ${boxVisFn} return [...document.querySelectorAll('[role=dialog]')].filter(boxVis).length; })()`);
  await page.locator('input[data-field="event-title"]').first().fill('QA-E Guest probe');
  await page.locator('input[data-field="event-start-time"]').first().fill('23:30');
  await page.waitForTimeout(600);
  writes.length=0;
  await page.getByRole('button',{name:'Schedule meeting', exact:true}).first().click();
  await page.waitForTimeout(6000);
  out.writes = writes.slice(0,3);
  out.afterSubmit = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    const toasts=[...document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast]')].filter(vis).map(e=>(e.innerText||'').replace(/\\s+/g,' ').trim()).filter(Boolean);
    return {dialogStillOpen: !!d, dialogTail: d? (d.innerText||'').replace(/\\n+/g,' | ').slice(-160):null, toasts: toasts.slice(0,3)}; })()`);
  return out;
};
