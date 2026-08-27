export default async ({page}) => {
  const n=parseInt(process.env.QA_N||'4500',10);
  const sel='div[contenteditable="true"][aria-label="Compose message"]';
  await page.goto('https://airion-cargo.store/w/W4QBF1XTURESO01/c/C4QBGENERAL0001',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  await page.click(sel);
  const payload='WORDS '+('alpha beta gamma delta '.repeat(Math.ceil(n/23))).slice(0,n);
  await page.keyboard.insertText(payload);          // real input event, not execCommand
  await page.waitForTimeout(1200);
  const typed = await page.evaluate((s)=>(document.querySelector(s)?.innerText||'').length, sel);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(5500);
  const after = await page.evaluate(async()=>{
    const j=await (await fetch('/api/v1/messaging/channels/C4QBGENERAL0001/messages?limit=6',{credentials:'include'})).json();
    return (j?.data?.messages||j?.messages||[]).slice(0,3)
      .map(m=>({len:(m.body||'').length, head:(m.body||'').slice(0,14), tail:(m.body||'').slice(-14), t:(m.created_at||'').slice(11,19)}));
  });
  const ui = await page.evaluate((s)=>({composerLen:(document.querySelector(s)?.innerText||'').length,
    toasts:[...document.querySelectorAll('*')].filter(e=>{const r=e.getBoundingClientRect();
      return r.width>0&&r.height>0&&/toast|sonner/i.test(e.className||'');})
      .map(e=>(e.innerText||'').replace(/\s+/g,' ').slice(0,60)).filter(Boolean).slice(0,2)}), sel);
  return {requested:n, typed, after, ui};
};
