import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={}; const reqs=[];
  page.on('response', async r => { const u=r.url(); if(u.includes('/api/v1/') && r.request().method()!=='GET')
    reqs.push(r.request().method()+' '+u.replace(/^https:\/\/[^/]+/,'').slice(0,70)+' -> '+r.status()); });
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  await page.locator('button[aria-label="Open workspace menu"]').first().click();
  await page.waitForTimeout(2000);
  await page.evaluate(`(() => { ${VISFN}
    const node=[...document.querySelectorAll('button,[role=menuitem],a')].find(n=>vis(n)&&/create workspace/i.test((n.getAttribute('aria-label')||n.textContent||'')));
    node && node.click(); })()`);
  await page.waitForTimeout(2500);
  await page.locator('[role=dialog] input').first().fill('QA E Second');
  await page.waitForTimeout(900);
  reqs.length=0;
  await page.getByRole('button',{name:'Create', exact:true}).first().click();
  await page.waitForTimeout(6000);
  out.writes = reqs.slice(0,6);
  out.url = page.url().replace(/^https:\/\/[^/]+/,'');
  out.screen = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const dlg=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    return { dialogStillOpen: !!dlg, dlgText: dlg?(dlg.innerText||'').replace(/\\n+/g,' | ').slice(0,250):null,
      main:(document.querySelector('main')?.innerText||'').replace(/\\n+/g,' | ').slice(0,300),
      wsBtn: (()=>{const b=[...document.querySelectorAll('button')].find(b=>vis(b)&&/workspace menu/i.test(b.getAttribute('aria-label')||'')); return b? b.previousElementSibling?.textContent||b.parentElement?.innerText?.slice(0,40):null;})() };
  })()`);
  out.wsList = await page.evaluate(`(async()=>{ const r=await fetch('/api/v1/users/me/workspaces',{credentials:'include'}); let j=null; try{j=await r.json()}catch(e){}
    const d=j?.data??j; const a=Array.isArray(d)?d:(d?.workspaces||d?.items||[]); return {s:r.status, list:a.map(w=>(w.name||'?')+':'+(w.id||'?'))}; })()`);
  return out;
};
