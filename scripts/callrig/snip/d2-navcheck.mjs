export default async ({page}) => {
  const out={};
  for (const p of [process.env.QA_P1, process.env.QA_P2].filter(Boolean)) {
    await page.goto('https://airion-cargo.store'+p,{waitUntil:'domcontentloaded'});
    await page.waitForTimeout(6000);
    out[p] = await page.evaluate(async()=>{
      const vis=el=>{const r=el.getBoundingClientRect();return r.width>2&&r.height>2;};
      const me=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json().catch(()=>({}));
      const links=[...document.querySelectorAll('a[href]')].filter(vis)
        .filter(a=>/\/settings\//.test(a.getAttribute('href')||''))
        .map(a=>a.innerText.trim()).filter(Boolean);
      const t=(document.querySelector('main')||document.body).innerText.replace(/\s+/g,' ');
      return {me:me.email, settingsNav:links,
        hasAdminGroup:/ADMIN/.test(t), navText:t.slice(0,240)};
    });
  }
  return out;
};
