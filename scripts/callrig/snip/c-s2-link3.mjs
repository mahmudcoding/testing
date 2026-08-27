const WS='W4QCF1XTURESO01', CH='C4QCGENERAL0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(400);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${CH}`,{waitUntil:'load'});
  await page.waitForTimeout(5000);
  const comp = () => page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  const clear = async () => { await comp().click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(200); };
  const doLink = async (text, url) => {
    await clear();
    await page.keyboard.type(text);
    await page.keyboard.press('Meta+A');
    await page.locator('button[aria-label="Insert link"]').last().click();
    await page.waitForTimeout(1000);
    if (url) { await page.locator('[role="dialog"] input').last().fill(url); await page.waitForTimeout(300); }
    await page.locator('[role="dialog"] button').filter({hasText:/^Insert$/}).last().click();
    await page.waitForTimeout(900);
    const composer = await page.evaluate(()=>{ const c=[...document.querySelectorAll('div[contenteditable="true"][aria-label="Compose message"]')].pop();
      return {html:c.innerHTML.slice(0,320), txt:c.innerText.replace(/\n/g,'\\n').slice(0,80)}; });
    await page.keyboard.press('Meta+Enter');   // markdown mode is on after a toolbar action
    await page.waitForTimeout(2500);
    const sent = await page.evaluate(async (ch)=>{
      const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=1`,{credentials:'include'});
      const j=await r.json(); const m=(j.messages||j.data||[])[0]||{};
      const el=[...document.querySelectorAll('[data-message-id]')].pop();
      const a=el?el.querySelector('a'):null;
      return {body:m.body, domText: el?el.innerText.replace(/\n+/g,' | ').slice(0,110):null,
              anchor: a?{href:a.getAttribute('href'), text:a.textContent.slice(0,40), rel:a.getAttribute('rel'), target:a.getAttribute('target')}:null};
    }, 'C4QCGENERAL0001');
    return {input:{text,url}, composer, sent};
  };
  const out=[];
  out.push(await doLink('QA-S2-LN-OK','https://example.com/page'));
  out.push(await doLink('QA-S2-LN-NOTURL','not a url at all'));
  out.push(await doLink('QA-S2-LN-JS','javascript:alert(1)'));
  await clear();
  return out;
};
