export default async ({page}) => {
  const r={};
  r.senderTracks = await page.evaluate(()=>{
    const out=[]; (window.__pcs||[]).forEach(pc=>{ if(pc.connectionState!=='closed') pc.getSenders().forEach(s=>{ if(s.track) out.push(s.track.kind+' | '+s.track.label+' | '+JSON.stringify(s.track.getSettings().deviceId||'').slice(0,20)); }); });
    return out;
  });
  r.gumCalls = await page.evaluate(()=>(window.__gumCalls||[]).map(c=>c.c.slice(0,160)));
  // reopen menu and read checked state
  const sel = await page.$('button[aria-label="Select microphone"]');
  if (sel) { await sel.click(); await page.waitForTimeout(2000); }
  r.menuState = await page.evaluate(()=>{
    const m=[...document.querySelectorAll('[role="menu"],[data-radix-popper-content-wrapper]')].pop();
    if(!m) return 'no menu';
    return [...m.querySelectorAll('[role="menuitemradio"],[role="menuitem"],button')].map(b=>({
      t:(b.textContent||'').trim().slice(0,28), checked:b.getAttribute('aria-checked'), state:b.getAttribute('data-state')}));
  });
  return r;
};
