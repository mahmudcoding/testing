// Sign a fixture member into a FRESH browser context, join the call, then let the
// context die with the drive process — the same abrupt teardown that produced the guest ghosts.
export default async ({browser}) => {
  const email = process.env.QA_EMAIL || 'qa.dave@aloqa.test';
  const pw = 'QaPass123!';
  const call = process.env.QA_CALL;
  const ws = 'W4QAF1XTURESO01';
  const out={marks:[]}; const t0=Date.now(); const mark=s=>out.marks.push({ms:Date.now()-t0,s});
  const c = await browser.newContext();
  const p = await c.newPage();
  await p.goto('https://airion-cargo.store/login', {waitUntil:'domcontentloaded'});
  await p.waitForTimeout(2000);
  await p.fill('input[type=email]', email);
  await p.fill('input[type=password]', pw);
  await p.click('button[type=submit]');
  await p.waitForTimeout(6000);
  out.me = await p.evaluate(async ()=>{ try{ return (await (await fetch('/api/v1/auth/me',{credentials:'include'})).json()).email; }catch(e){ return 'ERR'; } });
  mark('logged in');
  await p.goto(`https://airion-cargo.store/w/${ws}/call/${call}`, {waitUntil:'domcontentloaded'});
  await p.waitForTimeout(6000);
  const j = p.locator('button', {hasText:/^Join$/}).first();
  if (await j.count()) { await j.click(); await p.waitForTimeout(8000); }
  mark('join clicked');
  out.state = await p.evaluate(()=>({path:location.pathname.slice(0,60),
    txt:(document.body.innerText||'').replace(/\s+/g,' ').slice(0,150)}));
  await p.waitForTimeout(Number(process.env.QA_HOLD||20000));
  out.final = await p.evaluate(()=>({txt:(document.body.innerText||'').replace(/\s+/g,' ').slice(0,120)}));
  mark('about to vanish');
  return out;
};
