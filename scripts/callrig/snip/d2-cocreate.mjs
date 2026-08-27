export default async ({page}) => {
  await page.goto('https://airion-cargo.store/company/create',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  const enumerate = () => page.evaluate(()=>{
    const vis=el=>{const r=el.getBoundingClientRect(); if(r.width<2||r.height<2) return false;
      let n=el,o=1; while(n&&n!==document.documentElement){const c=getComputedStyle(n);
        if(c.display==='none'||c.visibility==='hidden')return false; o*=parseFloat(c.opacity||'1'); n=n.parentElement;} return o>0.01;};
    return {
      url: location.pathname,
      allInteractive:[...document.querySelectorAll('button,a[href],input,select,textarea,[role=button],[role=link],[role=tab],[role=menuitem]')]
        .filter(vis).map(e=>`${e.tagName.toLowerCase()}${e.type?'['+e.type+']':''}${e.disabled?'(dis)':''} href=${e.getAttribute('href')||'-'}: ${((e.getAttribute('aria-label')||e.innerText||e.placeholder)||'').replace(/\s+/g,' ').trim().slice(0,34)}`),
      headings:[...document.querySelectorAll('h1,h2,h3,h4,h5,h6,[role=heading]')].filter(vis)
        .map(h=>h.tagName.toLowerCase()+': '+h.innerText.trim().slice(0,40)),
      landmarks:[...document.querySelectorAll('main,nav,header,footer,aside,[role=main],[role=navigation]')].filter(vis).map(e=>e.tagName.toLowerCase()),
      bodyText:(document.body.innerText||'').replace(/\s+/g,' ').slice(0,300),
      title: document.title
    };
  });
  const out = {initial: await enumerate()};
  // fill a valid name and see whether anything else appears
  const inp = page.locator('input[type=text]').first();
  if (await inp.count()) {
    await inp.fill('QA D2 Probe Company');
    await page.waitForTimeout(900);
    out.filled = await enumerate();
  }
  return out;
};
