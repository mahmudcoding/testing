export default async ({page}) => {
  // Bob's own invitation link for a meeting he was invited to. Landing page only —
  // do not proceed to join (that is sector B's scope).
  const url='https://airion-cargo.store/calendar/join/17a0df82a7cda53e3110778ff8b80a201435c260e83c9e08cfdc0b5ffa7108b6';
  await page.goto(url, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  return await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const m=document.querySelector('main')||document.body;
    return {url:location.pathname.slice(0,40)+'…',
      txt:m.innerText.replace(/\n{2,}/g,' | ').slice(0,450),
      btns:[...m.querySelectorAll('button,a')].filter(vis)
        .map(b=>(b.getAttribute('aria-label')||b.innerText).replace(/\n/g,' ').trim()).filter(Boolean).slice(0,14)};
  });
};
