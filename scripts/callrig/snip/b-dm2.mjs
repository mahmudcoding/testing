export default async ({page}) => {
  const sel='div[contenteditable="true"][aria-label="Compose message"]';
  const clicked = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role=dialog]')].filter(x=>x.getBoundingClientRect().width>0)[0];
    if(!d) return false;
    const b=[...d.querySelectorAll('button')].find(x=>/^message$/i.test((x.innerText||'').trim()));
    if(!b) return false; b.click(); return true;
  });
  await page.waitForTimeout(5000);
  const st = await page.evaluate((s)=>({url:location.href.replace(/^https:\/\/[^/]+/,''),
    hasComposer:!!document.querySelector(s),
    msgs:[...document.querySelectorAll('[data-message-id]')].length,
    header:(document.querySelector('main')?.innerText||'').replace(/\s+/g,' ').slice(0,140)}), sel);
  let sent=null;
  if(st.hasComposer){
    await page.click(sel);
    await page.keyboard.type('QA-B-DM1 direct message check',{delay:15});
    await page.waitForTimeout(400); await page.keyboard.press('Enter'); await page.waitForTimeout(3500);
    sent = await page.evaluate(()=>{
      const a=[...document.querySelectorAll('[data-message-id]')].slice(-1)[0];
      return a?{id:a.getAttribute('data-message-id'), text:(a.innerText||'').replace(/\s+/g,' ').slice(0,70)}:null;});
  }
  return {clicked, st, sent, url:page.url().replace(/^https:\/\/[^/]+/,'')};
};
