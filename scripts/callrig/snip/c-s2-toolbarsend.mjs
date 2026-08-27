const WS='W4QCF1XTURESO01', PRIV='C4QCPRIVATE0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}`,{waitUntil:'load'});
  await page.waitForTimeout(7500);
  const out={};
  const comp = () => page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  const reqs=[];
  page.on('request', r=>{ if(/\/api\/v1\/messaging\/messages/.test(r.url()) && r.method()==='POST')
    reqs.push((r.postData()||'').slice(0,170)); });
  const read = (t) => page.evaluate(async (tag)=>{
    const r=await fetch('/api/v1/messaging/channels/C4QCPRIVATE0001/messages?limit=1',{credentials:'include'});
    const j=await r.json(); const m=(j.messages||[])[0]||{};
    const el=[...document.querySelectorAll('[data-message-id]')].pop();
    return {tag, body:JSON.stringify(m.body||''),
      domText: el? el.innerText.replace(/\n+/g,' | ').slice(0,80):null,
      strong: el? el.querySelectorAll('strong,b').length:0,
      em: el? el.querySelectorAll('em,i').length:0,
      code: el? el.querySelectorAll('code').length:0,
      lists: el? el.querySelectorAll('ul,ol,li').length:0,
      quotes: el? el.querySelectorAll('blockquote').length:0};
  }, t);
  // Bold via the toolbar
  await comp().click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await page.keyboard.type('QA-S2-TB plain ');
  await page.locator('button[aria-label="Bold"]').last().click({timeout:8000});
  await page.waitForTimeout(700);
  await page.keyboard.type('BOLDPART');
  await page.waitForTimeout(600);
  out.composerHtml = await page.evaluate(()=>{
    const c=[...document.querySelectorAll('div[contenteditable="true"][aria-label="Compose message"]')].pop();
    return c.innerHTML.slice(0,260);
  });
  await page.keyboard.press('Meta+Enter'); await page.waitForTimeout(3800);
  out.boldSent = await read('bold-sent');
  // bullet list via the toolbar
  await comp().click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await page.locator('button[aria-label="Insert list"]').last().click({timeout:8000});
  await page.waitForTimeout(700);
  await page.keyboard.type('QA-S2-TB-LIST one');
  await page.waitForTimeout(600);
  await page.keyboard.press('Meta+Enter'); await page.waitForTimeout(3800);
  out.listSent = await read('list-sent');
  out.requests = reqs;
  return out;
};
