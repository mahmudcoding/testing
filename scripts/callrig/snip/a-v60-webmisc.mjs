const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  // ALK-2879: an active session hitting the site root should land in the app
  for (const root of ['https://airion-cargo.store/','https://airion-cargo.store/login']) {
    await page.goto(root,{waitUntil:'domcontentloaded'});
    await page.waitForTimeout(5000);
    out[root.endsWith('/login')?'root_login':'root_slash'] = await page.evaluate(()=>({
      url:location.pathname+location.search,
      head:(document.querySelector('main')?.innerText||document.body.innerText||'').replace(/\s+/g,' ').slice(0,110) }));
  }
  // ALK-2545/2675: identity presentation — name + avatar consistency across surfaces
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/directories?tab=people',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  out.identity = await page.evaluate((vs)=>{const vis=eval(vs);
    const m=document.querySelector('[data-testid="app-shell-main-column"]')||document.body;
    const rows=[...m.querySelectorAll('*')].filter(e=>vis(e)&&/^QA [A-Z]/.test((e.innerText||'').trim())&&e.children.length===0)
      .map(e=>e.innerText.trim().slice(0,20));
    // any raw handles / emails leaking into the directory
    const raw=(m.innerText||'').match(/qa[_.][a-z]+|@[a-z.]+\.test/g);
    return { names:[...new Set(rows)].slice(0,10), rawIdentifiers:[...new Set(raw||[])].slice(0,6) };},VS);
  return out;
};
