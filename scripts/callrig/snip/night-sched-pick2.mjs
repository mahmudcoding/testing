export default async ({page}) => {
  const d=[...await page.$$('[role="dialog"]')].pop();
  const picked=[];
  for(const who of (process.env.QA_WHOS||'QA Alice,QA Bob').split(',')){
    for(const b of await d.$$('li button')){
      const t=((await b.textContent())||'').replace(/\s+/g,' ').trim();
      if(t===who){ try{ await b.click(); picked.push(who);}catch(e){} break; } }
    await page.waitForTimeout(1200);
  }
  return {picked, after: await page.evaluate(()=>{
    const dd=[...document.querySelectorAll('[role="dialog"]')].pop();
    const t=dd.innerText.replace(/\n+/g,' | ');
    const i=t.indexOf('Search members');
    return t.slice(Math.max(0,i-30), i+230);})};
};
