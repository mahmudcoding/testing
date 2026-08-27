export default async ({page}) => {
  const n=parseInt(process.env.QA_N||'5000',10);
  const sel='div[contenteditable="true"][aria-label="Compose message"]';
  await page.goto('https://airion-cargo.store/w/W4QBF1XTURESO01/c/C4QBGENERAL0001',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const before = await page.evaluate(async()=>{
    const j=await (await fetch('/api/v1/messaging/channels/C4QBGENERAL0001/messages?limit=3',{credentials:'include'})).json();
    return (j?.data?.messages||j?.messages||[]).length ? (j?.data?.messages||j?.messages)[0].id : null;});
  const net=[];
  page.on('response', async r=>{ if(/\/messaging\/messages/.test(r.url()) && r.request().method()==='POST'){
    let b=''; try{ b=(await r.text()).slice(0,200);}catch(e){}
    net.push({s:r.status(), body:b}); }});
  // set text directly then fire input so Lexical picks it up, fallback to typing a chunk
  await page.click(sel);
  const payload = 'LONG-'+'x'.repeat(n);
  await page.evaluate(async({s,txt})=>{
    const el=document.querySelector(s); el.focus();
    document.execCommand('insertText', false, txt);
  }, {s:sel, txt:payload});
  await page.waitForTimeout(1200);
  const typed = await page.evaluate((s)=>(document.querySelector(s)?.innerText||'').length, sel);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(5000);
  const after = await page.evaluate(async()=>{
    const j=await (await fetch('/api/v1/messaging/channels/C4QBGENERAL0001/messages?limit=3',{credentials:'include'})).json();
    const arr=(j?.data?.messages||j?.messages||[]);
    return {topId:arr[0]?.id, topLen:(arr[0]?.body||'').length, topHead:(arr[0]?.body||'').slice(0,20)};});
  const ui = await page.evaluate((s)=>({
    composerLen:(document.querySelector(s)?.innerText||'').length,
    toasts:[...document.querySelectorAll('*')].filter(e=>{const r=e.getBoundingClientRect();
      return r.width>0&&r.height>0&&/toast|sonner|error/i.test(e.className||'');})
      .map(e=>(e.innerText||'').replace(/\s+/g,' ').slice(0,80)).filter(Boolean).slice(0,3)}), sel);
  return {requested:n, typed, before, after, sentOk: after.topId!==before, net, ui};
};
