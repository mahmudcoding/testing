export default async ({page}) => {
  return await page.evaluate(() => {
    const tiles=[...document.querySelectorAll('[data-testid="participant-tile"]')];
    const big = tiles.sort((a,b)=>{const ra=a.getBoundingClientRect(),rb=b.getBoundingClientRect();return rb.width*rb.height-ra.width*ra.height;})[0];
    if (!big) return {none:true};
    const h = big.innerHTML.replace(/\s+/g,' ');
    const idx = h.toLowerCase().indexOf('pin');
    const els = [...big.querySelectorAll('*')].filter(e=>/pin/i.test(e.className&&String(e.className)||'')).map(e=>({
      tag:e.tagName, cls:String(e.className).slice(0,80),
      visible: e.getBoundingClientRect().width>0,
      rect:(r=>({w:Math.round(r.width),h:Math.round(r.height)}))(e.getBoundingClientRect())
    }));
    return {around: idx>=0 ? h.slice(Math.max(0,idx-160), idx+160) : null, pinClassEls: els};
  });
};
