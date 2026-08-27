const WS='W4QCF1XTURESO01', CH='C4QCGENERAL0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(400);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${CH}`,{waitUntil:'load'});
  await page.waitForTimeout(5500);
  const out={};
  out.view = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1)return false;
      let n=el,o=1;while(n&&n!==document.documentElement){const s=getComputedStyle(n);o*=parseFloat(s.opacity||'1');
      if(s.display==='none'||s.visibility==='hidden')return false;n=n.parentElement;}return o>0.05;};
    const el=[...document.querySelectorAll('[data-message-id]')].pop();
    return {id:el.getAttribute('data-message-id'), text:el.innerText.replace(/\n+/g,' | ').slice(0,120),
      buttons:[...el.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,32))};
  });
  const btn = page.locator('[data-message-id]').last().locator('button[aria-label^="Play voice"]').first();
  try { await btn.click({timeout:8000}); } catch(e){ out.playErr=String(e).slice(0,90); }
  await page.waitForTimeout(3500);
  out.afterPlay = await page.evaluate(()=>{
    const el=[...document.querySelectorAll('[data-message-id]')].pop();
    return {text:el.innerText.replace(/\n+/g,' | ').slice(0,80)};
  });
  return out;
};
