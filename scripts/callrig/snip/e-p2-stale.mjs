import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<120||r.height<60) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={}; const api=[];
  page.on('response', async r => { const u=r.url();
    if(u.includes('/api/v1/search')) api.push(r.status()+' q='+(decodeURIComponent(u).match(/[?&]q=([^&]*)/)||['','?'])[1].slice(0,14)); });
  const openDlg = async () => { await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^Search /.test(x.getAttribute('aria-label')||''));
     if(b) b.click(); })()`); await page.waitForTimeout(2600); };
  const txt = `(() => { ${VISFN} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     if(!d) return '(no dialog)';
     const t=(d.innerText||'').replace(/\\s+/g,' ');
     const i=t.indexOf('Relevance');
     return t.slice(i>=0?i:0, (i>=0?i:0)+230); })()`;
  // CASE 1 — completely fresh page, dialog never used
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  await openDlg();
  api.length=0;
  await page.keyboard.type('a'); await page.waitForTimeout(3200);
  out.freshOneChar = { text: await page.evaluate(txt), api: api.slice(0,3) };
  await page.keyboard.press('Escape'); await page.waitForTimeout(1500);
  // CASE 2 — run a real search, then reduce it to one character
  await openDlg();
  await page.keyboard.type('probe'); await page.waitForTimeout(4000);
  out.afterRealQuery = { text: await page.evaluate(txt) };
  api.length=0;
  for(let i=0;i<4;i++){ await page.keyboard.press('Backspace'); await page.waitForTimeout(250); }
  await page.waitForTimeout(3200);
  out.backTo1Char = { text: await page.evaluate(txt), api: api.slice(0,3),
                      value: await page.evaluate(`(() => { ${VISFN}
                        const i=[...document.querySelectorAll('input')].filter(vis).find(x=>/Search/i.test(x.getAttribute('placeholder')||''));
                        return i? String(i.value):'(no input)'; })()`) };
  await page.keyboard.press('Escape');
  return out;
};
