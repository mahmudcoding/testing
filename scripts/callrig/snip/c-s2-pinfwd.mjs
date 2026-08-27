const WS='W4QCF1XTURESO01', PRIV='C4QCPRIVATE0001', GEN='C4QCGENERAL0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(500);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${GEN}`,{waitUntil:'load'});
  await page.waitForTimeout(6000);
  const out={};
  const src = page.locator('[data-message-id]').filter({hasText:'QA-S2-MENTRENDER'}).last();
  await src.scrollIntoViewIfNeeded().catch(()=>{});
  await src.hover(); await page.waitForTimeout(800);
  await src.locator('button[aria-label="Forward"]').first().click({timeout:10000});
  await page.waitForTimeout(2500);
  await page.locator('[role="dialog"] button').filter({hasText:/^qa-private$/}).first().click({timeout:8000});
  await page.waitForTimeout(900);
  await page.locator('[role="dialog"] button:visible').filter({hasText:/^Continue$/}).last().click({timeout:8000});
  await page.waitForTimeout(1800);
  await page.locator('[role="dialog"] button:visible').filter({hasText:/^Send$/}).last().click({timeout:8000});
  await page.waitForTimeout(4500);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}`,{waitUntil:'load'});
  await page.waitForTimeout(6500);
  const fwd = page.locator('[data-message-id]').last();
  out.fwdText = (await fwd.innerText().catch(()=>null)||'').replace(/\n+/g,' | ').slice(0,140);
  await fwd.hover(); await page.waitForTimeout(800);
  await fwd.locator('button[aria-label="More actions"]').first().click({timeout:10000});
  await page.waitForTimeout(1200);
  await page.locator('[role="menu"] button, [data-radix-popper-content-wrapper] button').filter({hasText:/^Pin message$/}).last().click({timeout:8000});
  await page.waitForTimeout(3500);
  out.banner = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1)return false;
      let n=el,o=1;while(n&&n!==document.documentElement){const s=getComputedStyle(n);o*=parseFloat(s.opacity||'1');
      if(s.display==='none'||s.visibility==='hidden')return false;n=n.parentElement;}return o>0.05;};
    const hits=[...document.querySelectorAll('div,span,p,button')].filter(e=>e.children.length===0 && /Pinned message|no message text|View all \(/.test(e.textContent||''))
      .map(e=>({t:(e.textContent||'').trim().slice(0,70), vis:vis(e)}));
    const b=[...document.querySelectorAll('*')].filter(e=>/Pinned message/.test(e.textContent||'') && e.children.length<8).pop();
    return {hits, bannerRegion: b? b.innerText.replace(/\n+/g,' | ').slice(0,150):null};
  });
  return out;
};
