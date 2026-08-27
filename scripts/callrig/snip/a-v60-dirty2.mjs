const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const probe = () => page.evaluate((vs)=>{const vis=eval(vs);return{
    path:location.pathname,
    phone:document.querySelector('input[placeholder="+1 555 0100"]')?.value??null,
    dialogs:[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(vis).map(d=>(d.innerText||'').replace(/\s+/g,' ').slice(0,120)),
    saveish:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim()).filter(t=>/save|discard/i.test(t)),
  };},VS);
  const goAccount = async()=>{ await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/settings/account',{waitUntil:'domcontentloaded'}); await page.waitForTimeout(3000); };
  const dirty = async(val)=>{ const i=await page.$('input[placeholder="+1 555 0100"]'); await i.click(); await page.keyboard.type(val,{delay:30}); await page.waitForTimeout(600); };

  const results = {};

  // RUN 2: same as run 1, confirm reproducibility
  await goAccount(); await dirty('+998901110001');
  results.run2_dirty = await probe();
  await page.click('a[href$="/settings/appearance"]'); await page.waitForTimeout(1800);
  results.run2_awayDialog = (await probe()).dialogs;
  await page.click('a[href$="/settings/account"]'); await page.waitForTimeout(2200);
  results.run2_back = await probe();

  // BOUNDARY A: leave settings entirely (to Chat) — any guard?
  await goAccount(); await dirty('+998901110002');
  const beforeLeave = await probe();
  await page.click('a[href*="/c/"], a[href*="/chat"]').catch(()=>{});
  await page.waitForTimeout(2000);
  results.boundaryA_leaveSettings = { beforeLeave: beforeLeave.phone, nowPath: (await probe()).path, dialogs:(await probe()).dialogs };

  // BOUNDARY B: hard reload with dirty state — any beforeunload guard?
  await goAccount(); await dirty('+998901110003');
  const bWas = (await probe()).phone;
  let unloadPrompt = false;
  page.on('dialog', async d => { unloadPrompt = true; await d.dismiss().catch(()=>{}); });
  await page.reload({ waitUntil:'domcontentloaded' }); await page.waitForTimeout(3000);
  results.boundaryB_reload = { was:bWas, after:(await probe()).phone, beforeunloadPrompt: unloadPrompt };

  return results;
};
