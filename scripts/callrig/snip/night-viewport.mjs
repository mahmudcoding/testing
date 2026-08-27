export default async ({page}) => {
  const w=Number(process.env.QA_W||1280), h=Number(process.env.QA_H||800);
  const cdp=await page.context().newCDPSession(page);
  await cdp.send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:1,mobile:false});
  await page.waitForTimeout(3000);
  const st=await page.evaluate(()=>{
    const tb=document.querySelector('[data-testid="call-toolbar"]');
    const btns=tb?[...tb.querySelectorAll('button')].map(b=>{const r=b.getBoundingClientRect();return {l:b.getAttribute('aria-label'), x:Math.round(r.x), w:Math.round(r.width), vis:r.width>0&&r.height>0};}):[];
    return {
      innerW: innerWidth, innerH: innerHeight,
      docScrollW: document.documentElement.scrollWidth, docClientW: document.documentElement.clientWidth,
      toolbarScrollW: tb?tb.scrollWidth:null, toolbarClientW: tb?tb.clientWidth:null,
      buttons: btns,
      offscreen: btns.filter(b=>b.vis && b.x >= innerWidth).map(b=>b.l),
      tiles:[...document.querySelectorAll('[data-testid="participant-tile"]')].map(t=>{const r=t.getBoundingClientRect();return {w:Math.round(r.width),h:Math.round(r.height)};})
    };
  });
  return st;
};
