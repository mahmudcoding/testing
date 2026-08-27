export default async ({page}) => {
  await page.screenshot({ path: '/private/tmp/claude-501/-Users-mahmud-Projects-rtc-stream-monitor/67cea2e0-0ac4-4365-afa5-a0061a1a4dbf/scratchpad/bob.png' });
  return await page.evaluate(()=>({
    visibleDialogs: [...document.querySelectorAll('[role="dialog"]')].filter(d=>d.offsetParent)
      .map(d=>({ testid:d.getAttribute('data-testid'), text:(d.innerText||'').replace(/\s+/g,' ').slice(0,140),
                 btns:[...d.querySelectorAll('button')].map(b=>(b.textContent||b.getAttribute('aria-label')||'').trim()).filter(Boolean).slice(0,12) })),
    leaveBtn: (()=>{ const b=document.querySelector('[data-testid="call-controls-leave"]');
      if(!b) return null; const r=b.getBoundingClientRect();
      const top=document.elementFromPoint(r.left+r.width/2, r.top+r.height/2);
      return { rect:[r.x|0,r.y|0,r.width|0,r.height|0], visible:!!b.offsetParent,
               topIsSelf: top===b||b.contains(top), topEl: top&&top.tagName+'.'+String(top.className).slice(0,40) }; })()
  }));
};
