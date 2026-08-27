const WS='W4QCF1XTURESO01';
export default async ({page}) => {
  const out={};
  await page.keyboard.press('Escape'); await page.waitForTimeout(700);
  out.api = await page.evaluate(async (ws)=>{
    const r=await fetch('/api/v1/channels',{method:'POST',credentials:'include',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({name:'qa-c2-guest-probe', type:'public', workspace_id:ws})});
    return {status:r.status, body:(await r.text()).slice(0,220)};
  }, WS);
  // and via the UI form
  try { await page.locator('button[aria-label="Add channel"]').last().click({timeout:6000}); } catch(e){ out.uiErr=String(e).slice(0,70); }
  await page.waitForTimeout(2000);
  out.dialog = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis).pop();
    return d? {title:(d.querySelector('h1,h2,h3')?.textContent||'').trim(), text:d.innerText.replace(/\n+/g,' | ').slice(0,180)}:null;
  });
  return out;
};
