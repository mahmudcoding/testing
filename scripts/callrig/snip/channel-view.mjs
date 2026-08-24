export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/c/C4QAGENERAL0001',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  return await page.evaluate(() => {
    const m=document.querySelector('main')||document.body;
    return {text: m.innerText.replace(/\n+/g,' | ').slice(0,600),
      callish: [...m.querySelectorAll('*')].filter(e=>e.children.length===0 && /call|Join|LIVE|ongoing/i.test(e.textContent)).map(e=>e.textContent.trim().slice(0,50)).slice(0,10),
      buttons: [...m.querySelectorAll('button')].map(b=>`${(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,32)}`).filter(Boolean).slice(0,20),
      sidebarCall: (document.body.innerText.match(/This workspace has active calls/)||[])[0]||null};
  });
};
