export default async ({ page }) => {
  const visSrc = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
  const probe = async () => await page.evaluate((vs) => {
    const vis = eval(vs);
    return {
      path: location.pathname,
      phone: document.querySelector('input[placeholder="+1 555 0100"]')?.value ?? null,
      dialogs: [...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(vis).map(d=>(d.innerText||'').replace(/\s+/g,' ').slice(0,110)),
      saveish: [...document.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim()).filter(t=>/save|discard/i.test(t)),
    };
  }, visSrc);

  const start = await probe();                       // dirty on Account
  // click Profile in nav
  await page.click('a[href$="/settings/profile"]');
  const poll = [];
  for (let i=0;i<8;i++){ poll.push(await probe()); await page.waitForTimeout(300); }
  const onProfile = poll[poll.length-1];
  // back to Account
  await page.click('a[href$="/settings/account"]');
  await page.waitForTimeout(2000);
  const back = await probe();
  return { start, dialogSeen: poll.filter(p=>p.dialogs.length).map(p=>p.dialogs)[0] ?? null, onProfile, back };
};
