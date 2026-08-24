export default async ({page}) => {
  const read = async () => await page.evaluate(()=>{
    const senders=[]; (window.__pcs||[]).forEach(pc=>{ if(pc.connectionState!=='closed') pc.getSenders().forEach(s=>{ if(s.track){ const st=s.track.getSettings(); senders.push({kind:s.track.kind,label:s.track.label,id:s.track.id.slice(0,8),device:(st.deviceId||'').slice(0,12),ready:s.track.readyState,enabled:s.track.enabled}); } }); });
    return {senders, gum:(window.__gumCalls||[]).length, pcs:(window.__pcs||[]).length};
  });
  const r = {t0: await read()};
  await page.waitForTimeout(6000);
  r.t6 = await read();
  // what does the UI claim is selected?
  const sel = await page.$('button[aria-label="Select microphone"]');
  if (sel) { await sel.click(); await page.waitForTimeout(2500);
    r.ui = await page.evaluate(()=>{
      const m=[...document.querySelectorAll('[role="menu"],[data-radix-popper-content-wrapper]')].pop();
      if(!m) return 'no menu';
      return [...m.querySelectorAll('*')].filter(e=>e.children.length===0 && /Fake (Default )?Audio Input/.test(e.textContent||''))
        .map(e=>{ let p=e, mark=null; for(let i=0;i<4&&p;i++){ if(p.getAttribute&&(p.getAttribute('aria-checked')||p.getAttribute('data-state'))){mark=(p.getAttribute('aria-checked')||'')+'/'+(p.getAttribute('data-state')||'');break;} p=p.parentElement; }
                 return e.textContent.trim().slice(0,30)+'  -> '+mark; });
    });
    await page.keyboard.press('Escape');
  }
  return r;
};
