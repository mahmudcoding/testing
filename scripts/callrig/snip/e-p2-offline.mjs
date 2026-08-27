import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const banner = `(() => { ${VISFN}
  // any visible node whose text mentions connection state, plus live regions that are actually visible
  const cands=[...document.querySelectorAll('[role=status],[role=alert],[aria-live],div,span')]
    .filter(e=>/reconnect|connection|offline|no internet|подключ|соедин|trying to|reconnecting/i.test(e.textContent||''))
    .filter(e=>(e.textContent||'').length<120);
  const seen=new Set(); const rows=[];
  cands.forEach(e=>{ const t=(e.textContent||'').replace(/\\s+/g,' ').trim(); if(seen.has(t))return; seen.add(t);
    const srOnly=String(e.className||'').includes('sr-only');
    rows.push((vis(e)?'VIS':'hid')+(srOnly?'/sr':'')+' <'+e.tagName+'> '+t.slice(0,70)); });
  return {rows: rows.slice(0,6), online: navigator.onLine}; })()`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const trace=[];
  const sample = async (tag) => { const s=await page.evaluate(banner); trace.push(tag+' online='+s.online+' :: '+(s.rows.length?s.rows.join(' ;; '):'(none)')); };
  await sample('pre1'); await page.waitForTimeout(400); await sample('pre2');
  await page.context().setOffline(true);
  for (let i=0;i<20;i++){ await page.waitForTimeout(700); await sample('off'+i); }
  await page.context().setOffline(false);
  for (let i=0;i<14;i++){ await page.waitForTimeout(700); await sample('on'+i); }
  // collapse consecutive duplicates
  const collapsed=[]; let last=null;
  for (const t of trace){ const body=t.replace(/^[a-z0-9]+ /,''); if(body!==last){ collapsed.push(t); last=body; } }
  out.transitions = collapsed;
  out.sampleCount = trace.length;
  return out;
};
