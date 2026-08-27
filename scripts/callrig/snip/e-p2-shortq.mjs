import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<120||r.height<60) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={}; const api=[];
  page.on('response', async r => { const u=r.url();
    if(u.includes('/api/v1/search')) api.push(r.status()+' q='+(decodeURIComponent(u).match(/[?&]q=([^&]*)/)||['','?'])[1].slice(0,12)); });
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^Search /.test(x.getAttribute('aria-label')||''));
     if(b) b.click(); })()`);
  await page.waitForTimeout(2500);
  const dlgText = `(() => { ${VISFN} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     if(!d) return '(no dialog)';
     const t=(d.innerText||'').replace(/\\s+/g,' ');
     return t.slice(0, 300); })()`;
  api.length=0;
  await page.keyboard.type('a');
  const s=[]; for(let i=0;i<10;i++){ await page.waitForTimeout(350); s.push(await page.evaluate(dlgText)); }
  out.oneChar = { last:s[s.length-1], distinct:[...new Set(s)].length, api:api.slice(0,3) };
  api.length=0;
  await page.keyboard.type('l');   // now "al"
  for(let i=0;i<8;i++) await page.waitForTimeout(350);
  out.twoChar = { text: await page.evaluate(dlgText), api:api.slice(0,3) };
  await page.keyboard.press('Escape');
  return out;
};
