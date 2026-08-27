const WS='W4QCF1XTURESO01';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/chat/mentions`,{waitUntil:'load'});
  await page.waitForTimeout(8000);
  const out={};
  const look=(t)=>page.evaluate((tag)=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1)return false;
      let n=el,o=1;while(n&&n!==document.documentElement){const s=getComputedStyle(n);o*=parseFloat(s.opacity||'1');
      if(s.display==='none'||s.visibility==='hidden')return false;n=n.parentElement;}return o>0.05;};
    const main=document.querySelector('main')||document.body;
    return {tag, tabs:[...main.querySelectorAll('[role="tab"],button')].filter(vis)
        .map(b=>({l:(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,22), sel:b.getAttribute('aria-selected')}))
        .filter(x=>/All \(|Unread \(|Mark all/.test(x.l)),
      rows: [...main.querySelectorAll('[data-message-id]')].length,
      text: main.innerText.replace(/\n+/g,' | ').slice(0,240)};
  }, t);
  out.initial = await look('initial');
  // Unread tab
  try { await page.locator('main [role="tab"], main button').filter({hasText:/^Unread \(/}).first().click({timeout:8000});
        await page.waitForTimeout(2000); out.unreadTab = await look('unread-tab'); }
  catch(e){ out.unreadErr=String(e).slice(0,70); }
  // Mark all read
  try { await page.locator('main button').filter({hasText:/^Mark all read$/}).first().click({timeout:8000});
        await page.waitForTimeout(3000); out.afterMarkAll = await look('after-mark-all'); }
  catch(e){ out.markErr=String(e).slice(0,70); }
  // reload to check persistence
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/chat/mentions`,{waitUntil:'load'});
  await page.waitForTimeout(7000);
  out.afterReload = await look('after-reload');
  return out;
};
