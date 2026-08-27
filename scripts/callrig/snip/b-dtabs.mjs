export default async ({page}) => {
  const out={};
  const click = async (name) => {
    await page.evaluate((n)=>{ const t=[...document.querySelectorAll('[role=tab]')].find(x=>x.innerText.replace(/\s+/g,' ').trim().startsWith(n)); if(t) t.click(); }, name);
    await page.waitForTimeout(2500);
    return await page.evaluate(()=>{
      const p=[...document.querySelectorAll('[role=tabpanel]')].filter(x=>x.getBoundingClientRect().width>0)[0];
      const scope=p||document.body;
      return {
        text: scope.innerText.replace(/\n{2,}/g,'\n').slice(0,900),
        buttons: [...scope.querySelectorAll('button,a')].filter(b=>b.getBoundingClientRect().width>0).map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim()).filter(Boolean).slice(0,15)
      };
    });
  };
  out.chat = await click('Chat');
  out.logs = await click('Logs');
  return out;
};
