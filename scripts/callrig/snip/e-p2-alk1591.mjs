import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const CO='O4QEF1XTURESO01';
export default async ({page}) => {
  const out={}; const posts=[];
  page.on('response', async r => { const u=r.url();
    if(/messages/.test(u)&&r.request().method()==='POST'){ let b=''; try{b=(await r.text()).slice(0,120);}catch(e){}
      posts.push(r.status()+' '+u.split('/api/v1/')[1].slice(0,34)+' :: '+b.replace(/\s+/g,' ')); }});
  await page.goto(BASE+'/w/'+WS+'/chat/saved', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  out.page = await page.evaluate(`(() => ((document.querySelector('main')||document.body).innerText||'').replace(/\\s+/g,' ').slice(0,160))()`);
  const comp = page.locator('div[contenteditable="true"]').first();
  const n = await comp.count();
  out.composerPresent = n>0;
  if(!n) return out;
  await comp.click(); await page.waitForTimeout(500);
  await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(400);
  const TOKEN='savedscope'+process.env.QA_TOK;
  await page.keyboard.type('saved scope probe '+TOKEN);
  await page.waitForTimeout(700);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(7000);
  out.posted = posts.slice(0,2);
  out.token = TOKEN;
  out.search = await page.evaluate(`(async () => {
     const r=await fetch('/api/v1/search?q=${TOKEN}&company_id=${CO}&workspace_id=${WS}&limit=10',{credentials:'include'});
     const d=await r.json();
     return {tm:d.total_messages, rows:(d.messages||[]).map(m=>({dm:m.is_dm, ch:(m.channel_id||'').slice(-8), hl:(m.highlight||'').slice(0,40)}))}; })()`);
  return out;
};
