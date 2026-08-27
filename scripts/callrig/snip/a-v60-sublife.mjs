const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page, ctx }) => {
  const snap = async (tag) => {
    await page.waitForTimeout(7000);
    return await page.evaluate(async([vs,tag])=>{const vis=eval(vs);
      const pcs=window.__pcs||[]; const rows=[];
      for(const pc of pcs){ if(pc.connectionState==='closed') continue;
        const s=await pc.getStats();
        s.forEach(r=>{ if(r.type==='inbound-rtp'&&r.kind==='video') rows.push({w:r.frameWidth,dec:r.framesDecoded}); }); }
      // what does the UI say about the OTHER participant?
      const claims=[...document.body.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0
        && /camera|left|stopped|unpublish|no video|disconnect/i.test(e.innerText||''))
        .map(e=>e.innerText.replace(/\s+/g,' ').trim().slice(0,44));
      const aria=[...document.querySelectorAll('[aria-label]')].filter(vis).map(e=>e.getAttribute('aria-label'))
        .filter(a=>/camera off|camera on|left|stopped/i.test(a||'')).slice(0,5);
      return {tag, inbound:rows, uiClaims:[...new Set(claims)].slice(0,5), aria:[...new Set(aria)],
        rosterN:document.querySelectorAll('[data-testid="participant-row"]').length,
        videos:document.querySelectorAll('video').length};},[VS,tag]);
  };
  const out={};
  const cdp = await ctx.newCDPSession(page);
  out.a_normal = await snap('normal');
  // ALK-2949: force a transport-level unsubscribe by shrinking the tile hard,
  // then check the UI does NOT claim the other side stopped publishing.
  await cdp.send('Emulation.setDeviceMetricsOverride',{width:360,height:300,deviceScaleFactor:1,mobile:false});
  out.b_tiny = await snap('tiny');
  await cdp.send('Emulation.clearDeviceMetricsOverride');
  out.c_restored = await snap('restored');
  return out;
};
