const WS='W4QCF1XTURESO01', PRIV='C4QCPRIVATE0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(400);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}`,{waitUntil:'load'});
  await page.waitForTimeout(5000);
  // send a fresh own message
  const comp = () => page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  await comp().click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await page.keyboard.type('QA-S2-EDITHINT-ORIG');
  await page.keyboard.press('Enter'); await page.waitForTimeout(2500);
  const probe = (tag) => page.evaluate((t) => {
    const vis = (el) => { const r = el.getBoundingClientRect(); if (r.width<1||r.height<1) return false;
      let n=el,o=1; while(n&&n!==document.documentElement){const s=getComputedStyle(n);o*=parseFloat(s.opacity||'1');
        if(s.display==='none'||s.visibility==='hidden')return false;n=n.parentElement;} return o>0.05; };
    const hints=[...document.querySelectorAll('p')].filter(p=>/Enter/i.test(p.textContent||''))
      .map(p=>({text:(p.textContent||'').trim(), visible:vis(p)}));
    const md=[...document.querySelectorAll('button[aria-label="Markdown formatting"]')].map(b=>b.getAttribute('aria-pressed'));
    const c=[...document.querySelectorAll('div[contenteditable="true"][aria-label="Compose message"]')].pop();
    const banner = (document.body.innerText.match(/Editing message/)||[null])[0];
    return {tag:t, hints, mdPressed:md, banner, txt:c?c.innerText.replace(/\n/g,'\\n').slice(0,60):null,
      bodies: [...document.querySelectorAll('[data-message-id]')].slice(-2).map(m=>m.innerText.replace(/\n+/g,' | ').slice(0,70))};
  }, tag);
  const out={};
  out.beforeEdit = await probe('before-edit');
  // open edit on my last message
  const last = page.locator('[data-message-id]').last();
  await last.hover(); await page.waitForTimeout(600);
  let ok=false;
  try { await page.locator('button[aria-label="More actions"]').last().click({timeout:6000});
        await page.waitForTimeout(800);
        await page.locator('[role="dialog"] button, [role="menu"] button').filter({hasText:/^Edit$/}).first().click({timeout:6000});
        ok=true; } catch(e){ out.editErr=String(e).slice(0,120); }
  await page.waitForTimeout(2000);
  out.inEdit = await probe('in-edit');
  out.editOpened = ok;
  if (ok) {
    await page.keyboard.type('-X');
    await page.keyboard.press('Enter'); await page.waitForTimeout(2000);
    out.afterEnter = await probe('after-Enter');
    await page.keyboard.press('Meta+Enter'); await page.waitForTimeout(2500);
    out.afterMetaEnter = await probe('after-Meta+Enter');
  }
  return out;
};
