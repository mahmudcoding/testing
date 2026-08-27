const CH='C4QCGENERAL0001';
export default async ({page}) => {
  const esc = async () => { for (let i=0;i<3;i++){ await page.keyboard.press('Escape'); await page.waitForTimeout(400);} };
  const comp = () => page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  const clear = async () => { await esc(); await comp().click({timeout:8000}); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(200); };
  const snap = () => page.evaluate(() => {
    const vis=(el)=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1)return false;
      let n=el,o=1;while(n&&n!==document.documentElement){const s=getComputedStyle(n);o*=parseFloat(s.opacity||'1');
      if(s.display==='none'||s.visibility==='hidden')return false;n=n.parentElement;}return o>0.05;};
    const ds=[...document.querySelectorAll('[role="dialog"]')].filter(vis);
    const c=[...document.querySelectorAll('div[contenteditable="true"][aria-label="Compose message"]')].pop();
    return {dlgOpen: ds.length>0, dlgText: ds.length? ds[ds.length-1].innerText.replace(/\n+/g,' | ').slice(0,160):null,
            composerHTML: c?c.innerHTML.slice(0,300):null};
  });
  const doLink = async (text, url) => {
    await clear();
    await page.keyboard.type(text);
    await page.keyboard.press('Meta+A');
    await page.locator('button[aria-label="Insert link"]').last().click({timeout:8000});
    await page.waitForTimeout(1000);
    await page.locator('[role="dialog"] input').last().fill(url);
    await page.waitForTimeout(300);
    await page.locator('[role="dialog"] button').filter({hasText:/^Insert$/}).last().click({timeout:8000});
    await page.waitForTimeout(1000);
    const afterInsert = await snap();
    if (afterInsert.dlgOpen) return {url, rejected:true, afterInsert};
    await page.keyboard.press('Meta+Enter');
    await page.waitForTimeout(2500);
    const sent = await page.evaluate(async (ch)=>{
      const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=1`,{credentials:'include'});
      const j=await r.json(); const m=(j.messages||j.data||[])[0]||{};
      const el=[...document.querySelectorAll('[data-message-id]')].pop();
      const a=el?el.querySelector('a'):null;
      return {body:m.body, domText: el?el.innerText.replace(/\n+/g,' | ').slice(0,100):null,
              anchor: a?{href:a.getAttribute('href'), text:a.textContent.slice(0,40), rel:a.getAttribute('rel'), target:a.getAttribute('target')}:null};
    }, CH);
    return {url, rejected:false, afterInsert, sent};
  };
  const out=[];
  for (const [t,u] of [['QA-S2-LN-OK','https://example.com/page'],
                       ['QA-S2-LN-NOTURL','not a url at all'],
                       ['QA-S2-LN-JS','javascript:alert(1)'],
                       ['QA-S2-LN-NOSCHEME','example.org/x']]) {
    try { out.push(await doLink(t,u)); } catch(e){ out.push({url:u, err:String(e).slice(0,140)}); }
  }
  await esc();
  return out;
};
