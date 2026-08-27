export default async ({page}) => {
  const want=process.env.QA_BTN;
  const p = await page.$('[data-testid="breakout-rooms-panel"]');
  if(!p) return {err:'no panel'};
  const btns = await p.$$('button');
  for (const b of btns){
    const l=((await b.getAttribute('aria-label'))||(await b.innerText())||'').trim();
    if(l===want||l.startsWith(want)){
      await b.click();
      await page.waitForTimeout(2500);
      const dlg = await page.evaluate(()=>{
        const ms=[...document.querySelectorAll('[role="dialog"]')].filter(m=>m.getAttribute('data-testid')!=='call-overlay-expanded');
        const m=ms[ms.length-1];
        if(!m) return null;
        return {text:m.innerText.replace(/\n+/g,' | ').slice(0,500),
          controls:[...m.querySelectorAll('button,input,[role="checkbox"]')].map(e=>({l:(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,36),t:e.getAttribute('data-testid'),checked:e.checked}))};
      });
      return {clicked:l, dialog: dlg};
    }
  }
  const available = await page.evaluate(()=>[...document.querySelectorAll('[data-testid="breakout-rooms-panel"] button')].map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,30)));
  return {err:'button not found: '+want, available};
};
