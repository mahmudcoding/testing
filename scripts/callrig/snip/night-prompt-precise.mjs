export default async ({page}) => {
  const ms=Number(process.env.QA_MS||60000);
  return await page.evaluate(async (ms)=>{
    const out=[]; const t0=Date.now(); let seen=false, appeared=null, gone=null;
    while(Date.now()-t0<ms){
      const p=document.querySelector('[data-testid="app-breakout-invite-prompt"]');
      if(p && !seen){ seen=true; appeared=Date.now()-t0; out.push({event:'appeared', at:appeared/1000+'s', text:p.innerText.replace(/\n+/g,' | ').slice(0,220),
        buttons:[...p.querySelectorAll('button')].map(b=>({l:(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,30),t:b.getAttribute('data-testid')}))}); }
      else if(!p && seen && gone===null){ gone=Date.now()-t0; out.push({event:'disappeared', at:gone/1000+'s', lastedSeconds:(gone-appeared)/1000}); break; }
      await new Promise(r=>setTimeout(r,200));
    }
    return {events: out, stillPresent: !!document.querySelector('[data-testid="app-breakout-invite-prompt"]')};
  }, ms);
};
