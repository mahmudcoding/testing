export default async ({page}) => {
  const ms = Number(process.env.QA_MS||150000);
  const tid = process.env.QA_TID || 'call-controls-screen-share';
  return await page.evaluate(async ({ms,tid}) => {
    const out=[]; const t0=Date.now(); let last=null;
    while (Date.now()-t0 < ms) {
      const b=document.querySelector('[data-testid="'+tid+'"]');
      const cur = b ? (b.getAttribute('aria-label')+'|dis='+b.disabled) : 'absent';
      if (cur!==last){ out.push({at: Math.round((Date.now()-t0)/1000)+'s', state:cur}); last=cur; }
      await new Promise(r=>setTimeout(r,1000));
    }
    return {timeline: out};
  }, {ms,tid});
};
