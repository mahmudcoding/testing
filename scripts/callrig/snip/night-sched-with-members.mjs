export default async ({page}) => {
  const d=[...await page.$$('[role="dialog"]')].pop();
  const title=await d.$('input[aria-label="Add title"]');
  if(title) await title.fill(process.env.QA_TITLE||'QA SCHED WITH PEOPLE');
  const search=await d.$('input[aria-label="Search members"]');
  const added=[];
  for(const who of (process.env.QA_WHOS||'QA Alice,QA Bob').split(',')){
    if(!search) break;
    await search.click({clickCount:3}); await search.fill(who);
    await page.waitForTimeout(2500);
    const opts=await page.$$('[role="option"], [role="dialog"] li, [role="dialog"] button');
    for(const o of opts){ const t=((await o.textContent())||'').replace(/\s+/g,' ').trim();
      if(t.includes(who) && t.length<40){ try{ await o.click(); added.push(who); }catch(e){} break; } }
    await page.waitForTimeout(1200);
  }
  await search?.fill('');
  await page.waitForTimeout(800);
  return {added, dialogText: await page.evaluate(()=>{
    const dd=[...document.querySelectorAll('[role="dialog"]')].pop();
    const t=dd.innerText.replace(/\n+/g,' | ');
    const i=t.indexOf('Search members');
    return t.slice(Math.max(0,i-60), i+200);})};
};
