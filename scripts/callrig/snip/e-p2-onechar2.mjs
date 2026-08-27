import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<120||r.height<60) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={}; const api=[];
  page.on('response', async r => { const u=r.url();
    if(u.includes('/api/v1/search')) api.push('q='+(decodeURIComponent(u).match(/[?&]q=([^&]*)/)||['','?'])[1].slice(0,10)); });
  const txt = `(() => { ${VISFN} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     if(!d) return '(no dialog)';
     const t=(d.innerText||'').replace(/\\s+/g,' ');
     const i=t.indexOf('Relevance');
     return t.slice(i>=0?i:0, (i>=0?i:0)+200); })()`;
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  for (const ch of ['a','z','8']) {
    await page.evaluate(`(() => { ${VISFN}
       const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^Search /.test(x.getAttribute('aria-label')||''));
       if(b) b.click(); })()`);
    await page.waitForTimeout(2600);
    api.length=0;
    await page.keyboard.type(ch);
    const samples=[]; for(let i=0;i<8;i++){ await page.waitForTimeout(400); samples.push(await page.evaluate(txt)); }
    out[ch] = { last:samples[samples.length-1], distinct:[...new Set(samples)].length, api:[...api] };
    await page.keyboard.press('Escape'); await page.waitForTimeout(1400);
  }
  return out;
};
