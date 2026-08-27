export default async ({page}) => {
  // thread panel is already open in the DM from the previous snippet
  const out={};
  out.before = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1)return false;
      let n=el,o=1;while(n&&n!==document.documentElement){const s=getComputedStyle(n);o*=parseFloat(s.opacity||'1');
      if(s.display==='none'||s.visibility==='hidden')return false;n=n.parentElement;}return o>0.05;};
    return {url:location.href,
      hints:[...document.querySelectorAll('p')].filter(p=>/Enter/i.test(p.textContent||''))
        .map(p=>{const r=p.getBoundingClientRect(); return {t:(p.textContent||'').trim(), vis:vis(p), x:Math.round(r.x)};})};
  });
  const tcomp = page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  await tcomp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await page.keyboard.type('QA-S2-DMHINT');
  await page.locator('button[aria-label="Bold"]').last().click({timeout:8000});
  await page.waitForTimeout(900);
  out.afterBold = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1)return false;
      let n=el,o=1;while(n&&n!==document.documentElement){const s=getComputedStyle(n);o*=parseFloat(s.opacity||'1');
      if(s.display==='none'||s.visibility==='hidden')return false;n=n.parentElement;}return o>0.05;};
    return {hints:[...document.querySelectorAll('p')].filter(p=>/Enter/i.test(p.textContent||''))
        .map(p=>{const r=p.getBoundingClientRect(); return {t:(p.textContent||'').trim(), vis:vis(p), x:Math.round(r.x)};}),
      md:[...document.querySelectorAll('button[aria-label="Markdown formatting"]')].map(b=>b.getAttribute('aria-pressed'))};
  });
  await page.keyboard.press('Enter'); await page.waitForTimeout(2500);
  out.afterEnter = await page.evaluate(()=>{
    const cs=[...document.querySelectorAll('div[contenteditable="true"][aria-label="Compose message"]')];
    return {threadComposer: cs.length? cs[cs.length-1].innerText.replace(/\n/g,'\\n').slice(0,40):null,
      marker:(document.body.innerText.match(/Replies \(\d+\)/)||[null])[0]};
  });
  return out;
};
