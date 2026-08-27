import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
const snap = `(() => { ${boxVisFn}
  const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
  if(!d) return '?';
  const t=(d.innerText||'').replace(/\\n+/g,' ');
  const c=t.match(/All\\s+(\\d+)\\s+Messages\\s+(\\d+)/);
  const first=(t.match(/MESSAGES Open message #[a-z-]+ ([^|]{1,40})/)||['','(none)'])[1];
  return (c?'All='+c[1]:'?')+' first="'+first.trim().slice(0,34)+'"'+(/No results/.test(t)?' [EMPTY-STATE]':''); })()`;
export default async ({page}) => {
  const out={}; const reqs=[];
  page.on('request', r=>{ const u=r.url(); if(u.includes('/api/v1/search')) reqs.push(decodeURIComponent(u).replace(/^https:\/\/[^/]+\/api\/v1\/search\?/,'').slice(0,90)); });
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  await page.locator('button[aria-label^="Search "]').first().click();
  await page.waitForTimeout(2200);
  const inp = page.locator('input[type=search], [role=dialog] input').first();
  // first a query with a DISTINCT small count
  for (const q of ['zarplex', ':@ zzzznope', ':@ zzzznope zarplex', 'zzqqxx99']) {
    reqs.length=0;
    await inp.fill(''); await page.waitForTimeout(700);
    await inp.fill(q); await page.waitForTimeout(4000);
    out['['+q+']'] = (await page.evaluate(snap))+'   req: '+(reqs.slice(-1)[0]||'(NO REQUEST)');
  }
  return out;
};
