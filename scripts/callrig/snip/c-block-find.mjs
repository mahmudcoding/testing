// Find where Block lives: Directories -> People card, for a pair with no DM.
export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/directories?tab=people`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  const who = process.env.WHO || 'QA Bob';
  const rows = await page.evaluate(() => [...document.querySelectorAll('main *')]
    .filter(e=>e.children.length===0 && /^QA /.test(e.textContent.trim()))
    .map(e=>e.textContent.trim()).slice(0,15));
  const row = page.locator('main').getByText(who, {exact:true}).first();
  if(!await row.count()) return {err:'row not found', rows};
  await row.click();
  await page.waitForTimeout(2500);
  const st = await page.evaluate(() => {
    const vis = e => {const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false;
      let n=e,o=1; while(n){const cs=getComputedStyle(n); o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden')return false; n=n.parentElement;} return o>0.05;};
    const dlgs=[...document.querySelectorAll('[role=dialog]')].filter(vis);
    return {url:location.pathname+location.search, nDlg:dlgs.length,
      dlgText: dlgs.map(d=>d.innerText.replace(/\s+/g,' ').slice(0,200)),
      dlgBtns: dlgs.map(d=>[...d.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().slice(0,30)))};
  });
  return {rows, clicked: who, state: st};
};
