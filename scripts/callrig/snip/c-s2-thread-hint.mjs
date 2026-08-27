const WS='W4QCF1XTURESO01', CH='C4QCGENERAL0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(400);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${CH}`,{waitUntil:'load'});
  await page.waitForTimeout(5000);
  // open a thread on the last message
  const last = page.locator('[data-message-id]').last();
  await last.hover(); await page.waitForTimeout(600);
  const replyBtn = page.locator('button[aria-label="Reply"]').last();
  let opened = false;
  try { await replyBtn.click({timeout:6000}); opened = true; } catch(e) {}
  await page.waitForTimeout(3000);
  const probe = (tag) => page.evaluate((t) => {
    const vis = (el) => { const r = el.getBoundingClientRect(); if (r.width<1||r.height<1) return false;
      let n=el,o=1; while(n&&n!==document.documentElement){const s=getComputedStyle(n);o*=parseFloat(s.opacity||'1');
        if(s.display==='none'||s.visibility==='hidden')return false;n=n.parentElement;} return o>0.05; };
    const hints=[...document.querySelectorAll('p')].filter(p=>/Enter/i.test(p.textContent||''))
      .map(p=>({text:(p.textContent||'').trim().slice(0,60), visible:vis(p), cls:(p.className||'').slice(0,70), ariaHidden:p.getAttribute('aria-hidden')}));
    const mds=[...document.querySelectorAll('button[aria-label="Markdown formatting"]')].map(b=>({pressed:b.getAttribute('aria-pressed')}));
    const cs=[...document.querySelectorAll('div[contenteditable="true"][aria-label="Compose message"]')];
    return {tag:t, url:location.href, composers:cs.length, mdButtons:mds, hints,
            threadTxt: cs.length? cs[cs.length-1].innerText.replace(/\n/g,'\\n').slice(0,50):null};
  }, tag);
  const out = {opened};
  out.p1 = await probe('1-thread-open');
  const tcomp = page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  await tcomp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(200);
  await page.keyboard.type('QA-S2-THREADFMT');
  out.p2 = await probe('2-typed');
  // click Bold inside the thread composer region (last one on the page)
  await page.locator('button[aria-label="Bold"]').last().click(); await page.waitForTimeout(700);
  out.p3 = await probe('3-after-bold');
  await page.keyboard.type('B');
  await page.keyboard.press('Enter'); await page.waitForTimeout(2000);
  out.p4 = await probe('4-after-Enter');
  return out;
};
