export default async ({page}) => {
  const room=process.env.QA_ROOM||'QA-SR-1';
  const act=process.env.QA_ACT||'Switch';
  const p=await page.$('[data-testid="call-side-panel-slot"]');
  if(!p) return {err:'no panel'};
  const rows=await p.$$('li, div');
  for(const r of rows){
    const t=((await r.innerText())||'').replace(/\s+/g,' ').trim();
    if(t.startsWith(room) && t.length<90){
      for(const b of await r.$$('button')){ const l=(((await b.getAttribute('aria-label'))||(await b.textContent())||'')).trim();
        if(l===act){ await b.click(); await page.waitForTimeout(6000);
          return {clicked:act, room, after: await page.evaluate(()=>{
            const tb=document.querySelector('[data-testid="call-top-bar"]');
            const sp=document.querySelector('[data-testid="call-side-panel-slot"]');
            return {top:tb?tb.innerText.replace(/\n+/g,' | ').slice(0,80):null,
                    panel:sp?sp.innerText.replace(/\n+/g,' | ').slice(0,200):null};})}; } }
    }
  }
  return {err:'row/button not found', room, act};
};
