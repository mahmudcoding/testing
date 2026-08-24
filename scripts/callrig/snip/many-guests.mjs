export default async ({ctx}) => {
  const tok = process.env.QA_TOKEN;
  const n = Number(process.env.QA_N||6);
  const out=[];
  for (let i=1;i<=n;i++) {
    const p = await ctx.newPage();
    try {
      await p.goto('https://airion-cargo.store/join/'+tok,{waitUntil:'domcontentloaded'});
      await p.waitForTimeout(2200);
      await p.fill('input[type=text]', 'Guest '+i);
      await p.locator('button', {hasText:'Join call'}).first().click();
      await p.waitForTimeout(3500);
      const inCall = await p.evaluate(()=>!!document.querySelector('[data-testid="call-toolbar"]') || /Leave call/.test(document.body.innerText));
      out.push({i, inCall, url: p.url().slice(0,60)});
    } catch(e) { out.push({i, err:String(e).slice(0,90)}); }
  }
  return out;
};
