const WS='W4QCF1XTURESO01', CH='C4OWKQTPC7FZ35V';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${CH}`,{waitUntil:'load'});
  await page.waitForTimeout(8000);
  const out={};
  out.opened = await page.evaluate(()=>({url:location.href,
    header:(document.querySelector('main')?.innerText||'').replace(/\n+/g,' | ').slice(0,60)}));
  await page.locator('button[aria-label="Channel details"]').last().click({timeout:10000});
  await page.waitForTimeout(3000);
  out.fields = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    return [...document.querySelectorAll('input,textarea')].filter(vis)
      .map(i=>({tag:i.tagName, ph:i.getAttribute('placeholder'), v:i.value.slice(0,26)}));
  });
  const topic = page.locator('input[placeholder="What is this channel about?"]:visible, textarea[placeholder="What is this channel about?"]:visible').first();
  out.topicFound = await topic.count();
  if (out.topicFound) {
    await topic.fill('- **bold** topic <b>html</b> & "q"');
    await page.waitForTimeout(500);
    await page.locator('button:visible').filter({hasText:/^Save$/}).last().click({timeout:8000});
    await page.waitForTimeout(4000);
    out.after = await page.evaluate(async (ch)=>{
      const r=await fetch(`/api/v1/channels/${ch}`,{credentials:'include'});
      const a=await r.json();
      const main=document.querySelector('main')||document.body;
      return {apiTopic:JSON.stringify(a.description??a.topic??null),
        headerText: main.innerText.split('\n').slice(0,4).join(' | ').slice(0,140),
        strong: main.querySelectorAll('strong,b').length,
        lists: main.querySelectorAll('ul,ol,li').length,
        htmlEscaped: !/<b>html<\/b>/.test(main.innerHTML)};
    }, CH);
  }
  return out;
};
