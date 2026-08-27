const WS='W4QCF1XTURESO01', CH='C4OWKQTPC7FZ35V';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(400);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${CH}`,{waitUntil:'load'});
  await page.waitForTimeout(5500);
  const out={};
  await page.locator('button[aria-label="Channel details"]').last().click({timeout:8000});
  await page.waitForTimeout(2500);
  const panel = () => page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1)return false;
      let n=el,o=1;while(n&&n!==document.documentElement){const s=getComputedStyle(n);o*=parseFloat(s.opacity||'1');
      if(s.display==='none'||s.visibility==='hidden')return false;n=n.parentElement;}return o>0.05;};
    const tabs=[...document.querySelectorAll('[role="tab"]')].filter(vis).map(t=>({t:(t.textContent||'').trim().slice(0,20), sel:t.getAttribute('aria-selected')}));
    const inputs=[...document.querySelectorAll('input,textarea')].filter(vis).map(i=>({l:i.getAttribute('aria-label')||i.placeholder||i.name, v:i.value.slice(0,40), ro:i.readOnly, dis:i.disabled}));
    const btns=[...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,26)).filter(Boolean);
    return {tabs, inputs, btns: btns.slice(-22), header: (document.querySelector('main')?.innerText||'').replace(/\n+/g,' | ').slice(0,120)};
  });
  out.panel = await panel();
  return out;
};
