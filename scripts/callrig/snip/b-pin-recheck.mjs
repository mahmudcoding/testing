export default async ({page}) => {
  const out = {};
  const chans = [['qa-general','C4QBGENERAL0001'],['qa-private','C4QBPRIVATE0001']];
  for (const [name, id] of chans) {
    await page.goto(`https://airion-cargo.store/w/W4QBF1XTURESO01/c/${id}`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(4000);
    out[name] = await page.evaluate(async (id) => {
      const banner = [...document.querySelectorAll('*')].filter(e => /Pinned message/i.test(e.innerText||'') && e.children.length<=6).pop();
      let bannerBox = null;
      if (banner) { let b=banner; for(let i=0;i<3&&b.parentElement;i++) b=b.parentElement;
        const r=b.getBoundingClientRect(); bannerBox={w:Math.round(r.width),h:Math.round(r.height),text:(b.innerText||'').replace(/\s+/g,' ').slice(0,140)}; }
      const msgs = document.querySelectorAll('[data-message-id]').length;
      return {bannerBox, msgs};
    }, id);
  }
  return out;
};
