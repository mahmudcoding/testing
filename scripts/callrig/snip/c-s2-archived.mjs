const WS='W4QCF1XTURESO01', ARCH='C4QCARCHIVE0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${ARCH}`,{waitUntil:'load'});
  await page.waitForTimeout(7500);
  const out={};
  out.view = await page.evaluate(async (ch)=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1)return false;
      let n=el,o=1;while(n&&n!==document.documentElement){const s=getComputedStyle(n);o*=parseFloat(s.opacity||'1');
      if(s.display==='none'||s.visibility==='hidden')return false;n=n.parentElement;}return o>0.05;};
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=10`,{credentials:'include'});
    const j=await r.json();
    const main=document.querySelector('main')||document.body;
    return {url:location.href, apiStatus:r.status, apiCount:(j.messages||[]).length,
      composer: !!document.querySelector('div[contenteditable="true"][aria-label="Compose message"]'),
      msgs: document.querySelectorAll('[data-message-id]').length,
      headerButtons:[...main.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,26)).filter(Boolean).slice(0,14),
      mainText: main.innerText.replace(/\n+/g,' | ').slice(0,200)};
  }, ARCH);
  // if there are messages, check their action set
  if (out.view.msgs) {
    const row = page.locator('[data-message-id]').last();
    await row.hover(); await page.waitForTimeout(900);
    out.rowButtons = await page.evaluate(()=>{
      const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
      const el=[...document.querySelectorAll('[data-message-id]')].pop();
      return [...el.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,26)).filter(Boolean);
    });
  }
  return out;
};
