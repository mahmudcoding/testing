const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/directories?tab=people',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4200);
  out.workspaceDirectory = await page.evaluate((vs)=>{const vis=eval(vs);
    const m=document.querySelector('[data-testid="app-shell-main-column"]')||document.body;
    const names=[...new Set((m.innerText||'').match(/QA (Admin|Alice|Bob|Carol|Dave|Guest|Owner|Outsider)/g)||[])];
    return { names, hasDave:/QA Dave/.test(m.innerText||'') };},VS);
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/settings/admin/members',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4200);
  out.companyMembers = await page.evaluate((vs)=>{const vis=eval(vs);
    const m=document.querySelector('[data-testid="app-shell-main-column"]')||document.body;
    const names=[...new Set((m.innerText||'').match(/QA (Admin|Alice|Bob|Carol|Dave|Guest|Owner|Outsider)/g)||[])];
    return { names, hasDave:/QA Dave/.test(m.innerText||'') };},VS);
  return out;
};
