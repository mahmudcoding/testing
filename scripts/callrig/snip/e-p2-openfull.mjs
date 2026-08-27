import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<120||r.height<60) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={}; const api=[];
  page.on('response', async r => { const u=r.url();
    if(u.includes('/api/v1/search')) api.push(r.status()+' '+decodeURIComponent(u.split('/api/v1/')[1]).slice(0,120)); });
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^Search /.test(x.getAttribute('aria-label')||''));
     if(b) b.click(); })()`);
  await page.waitForTimeout(2500);
  await page.keyboard.type('probe');
  await page.waitForTimeout(3500);
  const t = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     const b=[...d.querySelectorAll('button')].filter(vis).find(x=>/Open full search/i.test(x.textContent||''));
     if(!b) return {none:true}; const r=b.getBoundingClientRect();
     return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  out.btn=t; if(t.none) return out;
  api.length=0;
  await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(300);
  await page.mouse.down(); await page.waitForTimeout(130); await page.mouse.up();
  await page.waitForTimeout(8000);
  out.landedOn = page.url().replace(/^https:\/\/[^/]+/,'').slice(0,80);
  out.api = api.slice(0,3);
  out.page = await page.evaluate(`(() => { ${VISFN}
     const m=document.querySelector('main')||document.body;
     return { text:(m.innerText||'').replace(/\\s+/g,' ').slice(0,320),
              controls:[...new Set([...m.querySelectorAll('button,[role=tab],select,input')].filter(vis)
                .map(b=>{const n=(b.getAttribute('aria-label')||b.getAttribute('placeholder')||b.textContent||'').replace(/\\s+/g,' ').trim().slice(0,26);
                  const s=b.getAttribute('aria-selected')||b.getAttribute('aria-pressed')||'';
                  return n+(s?('/'+s):''); }).filter(Boolean))].slice(0,22) }; })()`);
  return out;
};
