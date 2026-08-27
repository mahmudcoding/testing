const WS='W4QCF1XTURESO01', PRIV='C4QCPRIVATE0001';
const DIR='/private/tmp/claude-501/-Users-mahmud-Projects-testing/be46af86-e91b-43a7-99c1-153a85741b82/scratchpad/files';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(500);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}`,{waitUntil:'load'});
  await page.waitForTimeout(6000);
  const out={};
  const state=(t)=>page.evaluate((tag)=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1)return false;
      let n=el,o=1;while(n&&n!==document.documentElement){const s=getComputedStyle(n);o*=parseFloat(s.opacity||'1');
      if(s.display==='none'||s.visibility==='hidden')return false;n=n.parentElement;}return o>0.05;};
    const c=[...document.querySelectorAll('div[contenteditable="true"][aria-label="Compose message"]')].pop();
    let box=c; for(let i=0;i<6&&box;i++) box=box.parentElement;
    return {tag, area: box? box.innerText.replace(/\n+/g,' | ').slice(-160):null,
      chipButtons: box? [...box.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,24))
        .filter(t=>/send as|remove attachment|retry/i.test(t)):[]};
  }, t);
  await page.locator('input[type=file]').first().setInputFiles(`${DIR}/qa-s2-pic.png`);
  await page.waitForTimeout(5000);
  out.attached = await state('attached');
  try { await page.locator('button:visible').filter({hasText:/^Send as file$/}).first().click({timeout:6000}); out.toggled='file'; }
  catch(e){ out.toggleErr=String(e).slice(0,80); }
  await page.waitForTimeout(1500);
  out.afterToggle = await state('after-toggle');
  await page.keyboard.press('Enter'); await page.waitForTimeout(5000);
  out.sent = await page.evaluate(async ()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const r=await fetch('/api/v1/messaging/channels/C4QCPRIVATE0001/messages?limit=1',{credentials:'include'});
    const j=await r.json(); const m=(j.messages||[])[0]||{};
    const el=[...document.querySelectorAll('[data-message-id]')].pop();
    return {body:m.body, files:JSON.stringify(m.files||[]).slice(0,220),
      dom: el? el.innerText.replace(/\n+/g,' | ').slice(0,90):null,
      imgs: el? [...el.querySelectorAll('img')].map(i=>({w:i.naturalWidth,h:i.naturalHeight})):[],
      buttons: el? [...el.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,26)).filter(Boolean):[]};
  });
  return out;
};
