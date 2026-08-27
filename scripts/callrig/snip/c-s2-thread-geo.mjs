const WS='W4QCF1XTURESO01', CH='C4QCGENERAL0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(400);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${CH}`,{waitUntil:'load'});
  await page.waitForTimeout(5000);
  const last = page.locator('[data-message-id]').last();
  await last.hover(); await page.waitForTimeout(600);
  await page.locator('button[aria-label="Reply"]').last().click({timeout:8000});
  await page.waitForTimeout(3000);
  const geo = (tag) => page.evaluate((t) => {
    const vis = (el) => { const r = el.getBoundingClientRect(); if (r.width<1||r.height<1) return false;
      let n=el,o=1; while(n&&n!==document.documentElement){const s=getComputedStyle(n);o*=parseFloat(s.opacity||'1');
        if(s.display==='none'||s.visibility==='hidden')return false;n=n.parentElement;} return o>0.05; };
    const R = e => { const r=e.getBoundingClientRect(); return {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}; };
    const hints=[...document.querySelectorAll('p')].filter(p=>/Enter/i.test(p.textContent||''))
      .map(p=>({text:(p.textContent||'').trim(), visible:vis(p), rect:R(p)}));
    const cs=[...document.querySelectorAll('div[contenteditable="true"][aria-label="Compose message"]')].map(c=>({rect:R(c), txt:c.innerText.replace(/\n/g,'\\n').slice(0,40)}));
    return {tag:t, viewport:{w:innerWidth,h:innerHeight}, hints, composers:cs,
            replies: (document.body.innerText.match(/Replies \(\d+\)/)||[null])[0]};
  }, tag);
  const out = {};
  const tcomp = page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  await tcomp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(200);
  await page.keyboard.type('QA-S2-TGEO');
  await page.locator('button[aria-label="Bold"]').last().click(); await page.waitForTimeout(700);
  out.afterBold = await geo('after-bold');
  await page.keyboard.press('Enter'); await page.waitForTimeout(1800);
  out.afterEnter = await geo('after-enter');
  await page.keyboard.press('Meta+Enter'); await page.waitForTimeout(2500);
  out.afterMetaEnter = await geo('after-meta-enter');
  return out;
};
