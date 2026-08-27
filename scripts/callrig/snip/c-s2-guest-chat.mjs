const WS='W4QCF1XTURESO01', GEN='C4QCGENERAL0001', PRIV='C4QCPRIVATE0001';
export default async ({page}) => {
  const out={};
  const look = (t) => page.evaluate((tag)=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1)return false;
      let n=el,o=1;while(n&&n!==document.documentElement){const s=getComputedStyle(n);o*=parseFloat(s.opacity||'1');
      if(s.display==='none'||s.visibility==='hidden')return false;n=n.parentElement;}return o>0.05;};
    const main=document.querySelector('main')||document.body;
    return {tag, url:location.href,
      composer: !!document.querySelector('div[contenteditable="true"][aria-label="Compose message"]'),
      msgs: document.querySelectorAll('[data-message-id]').length,
      sidebarChannels:[...document.querySelectorAll('a')].filter(vis).map(a=>({t:(a.textContent||'').trim().slice(0,22), h:(a.getAttribute('href')||'').slice(-18)})).filter(x=>/\/c\/|\/d\//.test(x.h)),
      headerButtons:[...main.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,26)).filter(Boolean).slice(0,12),
      mainText: main.innerText.replace(/\n+/g,' | ').slice(0,180)};
  }, t);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${GEN}`,{waitUntil:'load'});
  await page.waitForTimeout(6000);
  out.general = await look('qa-general');
  // try to send
  if (out.general.composer) {
    const comp = page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.keyboard.type('QA-S2-GUEST-HELLO'); await page.keyboard.press('Enter'); await page.waitForTimeout(3000);
    out.sent = await page.evaluate(async (ch)=>{
      const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=2`,{credentials:'include'});
      const j=await r.json(); return {top:(j.messages||[]).map(m=>m.body).slice(0,2)};
    }, GEN);
  }
  // private channel guest is not in
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  out.private = await look('qa-private');
  return out;
};
