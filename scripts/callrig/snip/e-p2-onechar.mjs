import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<120||r.height<60) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={}; const api=[];
  page.on('response', async r => { const u=r.url();
    if(u.includes('/api/v1/search')) api.push('q='+(decodeURIComponent(u).match(/[?&]q=([^&]*)/)||['','?'])[1].slice(0,10)); });
  const rows = `(() => { ${VISFN} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     if(!d) return {none:true};
     const t=(d.innerText||'').replace(/\\s+/g,' ');
     const btns=[...d.querySelectorAll('button')].filter(vis)
       .filter(b=>/^Open message/.test((b.getAttribute('aria-label')||b.textContent||'').trim()));
     const tabs=(t.match(/All\\s*\\d*\\s*Messages\\s*\\d*/)||['(no tabs)'])[0];
     return { rowCount:btns.length, tabs,
              first:btns[0]?(btns[0].textContent||'').replace(/\\s+/g,' ').trim().slice(0,60):null,
              empty:/No results for/.test(t) }; })()`;
  for (const ch of ['a','z','8','x','q']) {
    await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(8500);
    await page.evaluate(`(() => { ${VISFN}
       const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^Search /.test(x.getAttribute('aria-label')||''));
       if(b) b.click(); })()`);
    await page.waitForTimeout(2600);
    api.length=0;
    await page.keyboard.type(ch);
    await page.waitForTimeout(3400);
    out[ch] = { ...(await page.evaluate(rows)), api:[...api] };
    await page.keyboard.press('Escape'); await page.waitForTimeout(900);
  }
  return out;
};
