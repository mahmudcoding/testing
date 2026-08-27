const WS='W4QCF1XTURESO01', PRIV='C4QCPRIVATE0001';
const FWD='M4OWP5YX9TJCG0J';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(700);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}`,{waitUntil:'load'});
  await page.waitForTimeout(8000);
  const out={};
  const row = page.locator(`[data-message-id="${FWD}"]`).first();
  await row.scrollIntoViewIfNeeded().catch(()=>{});
  out.before = await page.evaluate(()=>({url:location.href}));
  await row.hover(); await page.waitForTimeout(900);
  const card = row.locator('button[aria-label="Open source message"]').first();
  await card.hover().catch(()=>{});
  await page.waitForTimeout(500);
  await card.click({timeout:10000, force:true});
  const frames=[];
  for (let i=0;i<14;i++){
    await page.waitForTimeout(300);
    frames.push(await page.evaluate(()=>{
      const vis=(el)=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1)return false;
        let n=el,o=1;while(n&&n!==document.documentElement){const s=getComputedStyle(n);o*=parseFloat(s.opacity||'1');
        if(s.display==='none'||s.visibility==='hidden')return false;n=n.parentElement;}return o>0.05;};
      return {url:location.href,
        toasts:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(vis).map(e=>(e.textContent||'').trim()).filter(Boolean).slice(0,2),
        dialogs:[...document.querySelectorAll('[role="dialog"]')].filter(vis).length};
    }));
  }
  out.frames = frames.filter((f,i)=> i===0 || JSON.stringify(f)!==JSON.stringify(frames[i-1]));
  out.after = await page.evaluate(()=>{
    const m=new URL(location.href).searchParams.get('m');
    const el=m? document.querySelector(`[data-message-id="${m}"]`):null;
    return {url:location.href, targetParam:m, targetText: el? el.innerText.replace(/\n+/g,' | ').slice(0,60):null,
      inViewport: el? (el.getBoundingClientRect().y>=0 && el.getBoundingClientRect().y<innerHeight):null};
  });
  return out;
};
