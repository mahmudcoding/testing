export default async ({page}) => {
  return await page.evaluate(() => {
    const surface = document.querySelector('[role="dialog"]') || document.body;
    return [...surface.querySelectorAll('video')].map(v => {
      const r = v.getBoundingClientRect();
      const chain = [];
      let e = v;
      for (let i=0;i<6 && e;i++) { e = e.parentElement; if(!e) break; chain.push(`${e.tagName}${e.getAttribute('data-testid')?'['+e.getAttribute('data-testid')+']':''}${e.getAttribute('aria-label')?'{'+e.getAttribute('aria-label').slice(0,28)+'}':''}`); }
      return {lbl: (v.closest('[aria-label]')||{}).getAttribute?.('aria-label'),
              rect: {x:Math.round(r.x), y:Math.round(r.y), w:Math.round(r.width), h:Math.round(r.height)},
              visible: r.width>0 && r.height>0, vw: v.videoWidth, vh: v.videoHeight,
              srcId: v.srcObject ? v.srcObject.getVideoTracks().map(t=>t.id.slice(0,12)).join(',') : null,
              chain};
    });
  });
};
