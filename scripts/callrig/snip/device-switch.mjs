import { RTC_STATS } from './lib.mjs';
export default async ({page}) => {
  const track = async () => await page.evaluate(()=>{
    const pcs=window.__pcs||[]; const out=[];
    for (const pc of pcs){ if(pc.connectionState==='closed') continue;
      pc.getSenders().forEach(s=>{ if(s.track) out.push(s.track.kind+':'+s.track.label+':'+s.track.readyState); }); }
    return out;
  });
  const r={};
  r.before = await track();
  const sel = await page.$('button[aria-label="Select microphone"]');
  if (!sel) return {err:'no mic selector', ...r};
  await sel.click(); await page.waitForTimeout(2000);
  const menu = await page.evaluate(()=>{const m=[...document.querySelectorAll('[role="menu"],[data-radix-popper-content-wrapper]')].pop();
    return m? {text:m.innerText.replace(/\n+/g,' | ').slice(0,300), items:[...m.querySelectorAll('button,[role="menuitem"],[role="menuitemradio"]')].map(b=>(b.textContent||'').trim().slice(0,40)).filter(Boolean)}:'no menu';});
  r.menu = menu;
  const m=[...(await page.$$('[role="menu"],[data-radix-popper-content-wrapper]'))].pop();
  if (m) { for (const it of await m.$$('button,[role="menuitem"],[role="menuitemradio"]')) {
      const t=(await it.innerText()).trim();
      if (/Fake Audio Input 2/i.test(t)) { await it.click(); r.picked=t; break; } } }
  await page.waitForTimeout(5000);
  r.after = await track();
  const st = await page.evaluate('('+RTC_STATS+')()');
  r.outAudioBytes = st.stats.map(pc=>pc.out.filter(o=>o.kind==='audio').map(o=>o.bytes));
  return r;
};
