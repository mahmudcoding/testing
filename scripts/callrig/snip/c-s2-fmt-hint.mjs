const WS='W4QCF1XTURESO01', CH='C4QCGENERAL0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(400);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${CH}`,{waitUntil:'load'});
  await page.waitForTimeout(5000);
  const comp = () => page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  const probe = (tag) => page.evaluate((t) => {
    const vis = (el) => { const r = el.getBoundingClientRect(); if (r.width<1||r.height<1) return false;
      let n=el,o=1; while(n&&n!==document.documentElement){const s=getComputedStyle(n);o*=parseFloat(s.opacity||'1');
        if(s.display==='none'||s.visibility==='hidden')return false;n=n.parentElement;} return o>0.05; };
    const md = [...document.querySelectorAll('button[aria-label="Markdown formatting"]')].pop();
    // hint = small text nodes near the composer mentioning Enter
    const hints = [...document.querySelectorAll('p')].filter(p=>/Enter/i.test(p.textContent||''))
      .map(p=>({text:(p.textContent||'').trim().slice(0,80), visible:vis(p),
                cls:(p.className||'').slice(0,60), ariaHidden:p.getAttribute('aria-hidden')}));
    const c=[...document.querySelectorAll('div[contenteditable="true"][aria-label="Compose message"]')].pop();
    return {tag:t, mdPressed: md?md.getAttribute('aria-pressed'):null, hints,
            n: document.querySelectorAll('[data-message-id]').length,
            txt: c.innerText.replace(/\n/g,'\\n').slice(0,50)};
  }, tag);
  const out=[];
  await comp().click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(250);
  await page.keyboard.type('QA-S2-HINT');
  out.push(await probe('1-before-bold'));
  await page.locator('button[aria-label="Bold"]').last().click(); await page.waitForTimeout(700);
  out.push(await probe('2-after-bold'));
  await page.keyboard.type('B');
  await page.keyboard.press('Enter'); await page.waitForTimeout(1800);
  out.push(await probe('3-after-plain-Enter'));
  await page.keyboard.press('Meta+Enter'); await page.waitForTimeout(2500);
  out.push(await probe('4-after-Meta+Enter'));
  return out;
};
