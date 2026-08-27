import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const F=process.env.QA_FILE||'qa-e-image.png';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={}; const writes=[];
  page.on('response', async r=>{ const u=r.url(); if(u.includes('/api/v1/')&&r.request().method()!=='GET'){
    let b=''; try{b=(await r.text()).slice(0,140);}catch(e){}
    writes.push(r.request().method()+' '+u.replace(/^https:\/\/[^/]+/,'').slice(0,50)+' -> '+r.status()+' '+b); }});
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  out.storageBefore = await page.evaluate(`(() => { const m=document.querySelector('main');
    return ((m.innerText||'').match(/[\\d.]+ (?:B|KB|MB) of 10 GB used[^|]*/)||['?'])[0]; })()`);
  await page.locator('main button').filter({hasText:F}).first().hover();
  await page.waitForTimeout(1300);
  await page.evaluate(`(() => { ${VISFN}
    const tiles=[...document.querySelectorAll('main button')].filter(b=>(b.textContent||'').includes(${JSON.stringify(F)}));
    const tr=tiles[0].getBoundingClientRect();
    const c=[...document.querySelectorAll('button[aria-label="More actions"]')].filter(vis)
      .sort((a,b)=>Math.abs(a.getBoundingClientRect().y-tr.y)-Math.abs(b.getBoundingClientRect().y-tr.y))[0];
    c && c.click(); })()`);
  await page.waitForTimeout(1800);
  out.clickDelete = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const b=[...document.querySelectorAll('[role=menu],[data-radix-popper-content-wrapper]')].filter(boxVis);
    const p=b[b.length-1]; return clickDeepest(p, /delete file/i); })()`);
  await page.waitForTimeout(2500);
  out.confirmUI = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog],[role=alertdialog]')].filter(boxVis).pop();
    return d? {text:(d.innerText||'').replace(/\\n+/g,' | ').slice(0,260), ctrls:interactives(d).map(x=>x.label.slice(0,22)).join(' | ')}:'none'; })()`);
  writes.length=0;
  out.confirm = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog],[role=alertdialog]')].filter(boxVis).pop();
    return clickDeepest(d, /^(Delete|Delete file|Confirm)$/i); })()`);
  await page.waitForTimeout(5500);
  out.writes = writes.slice(0,3);
  out.storageAfter = await page.evaluate(`(() => { const m=document.querySelector('main');
    return ((m.innerText||'').match(/[\\d.]+ (?:B|KB|MB) of 10 GB used[^|]*/)||['?'])[0]; })()`);
  out.filesLeft = await page.evaluate(`(async()=>{const r=await fetch('/api/v1/users/me/files?workspace_id=${WS}&scope=own',{credentials:'include'});
    const j=await r.json().catch(()=>({})); const a=j.files||[]; return a.map(f=>f.filename); })()`);
  return out;
};
