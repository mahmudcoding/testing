export default async ({page}) => {
  const who=process.env.QA_WHO||'QA Carol';
  const p=await page.$('[data-testid="participants-list-panel"]');
  if(!p) return {err:'no panel'};
  const rows=await p.$$('[data-testid="participant-row"]');
  for(const r of rows){
    const t=((await r.innerText())||'').replace(/\s+/g,' ').trim();
    if(t.includes(who)){
      const b=await r.$('button[aria-label="Participant actions"]');
      if(!b) return {err:'no actions button', rowText:t.slice(0,40)};
      await b.click(); await page.waitForTimeout(2500);
      return {opened:t.slice(0,40), items: await page.evaluate(()=>{
        const m=[...document.querySelectorAll('[role="menu"],[data-radix-popper-content-wrapper]')].pop();
        return m?[...m.querySelectorAll('[role="menuitem"],button')]
          .map(e=>(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,30)).filter(Boolean):[];})};
    }
  }
  return {err:'row not found'};
};
