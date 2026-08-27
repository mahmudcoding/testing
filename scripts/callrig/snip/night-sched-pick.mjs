export default async ({page}) => {
  const d=[...await page.$$('[role="dialog"]')].pop();
  const picked=[];
  for(const who of (process.env.QA_WHOS||'QA Alice,QA Bob').split(',')){
    const els=await d.$$('label, [role="option"], [role="checkbox"]');
    for(const e of els){ const t=((await e.textContent())||'').replace(/\s+/g,' ').trim();
      if(t===who || t===who.replace(' ','')+''){ try{ await e.click(); picked.push(who);}catch(err){} break; }
      if(t.includes(who) && t.length<=who.length+6){ try{ await e.click(); picked.push(who);}catch(err){} break; } }
    await page.waitForTimeout(1000);
  }
  return {picked, after: await page.evaluate(()=>{
    const dd=[...document.querySelectorAll('[role="dialog"]')].pop();
    const t=dd.innerText.replace(/\n+/g,' | ');
    const i=t.indexOf('Search members');
    return t.slice(Math.max(0,i-40), i+220);})};
};
