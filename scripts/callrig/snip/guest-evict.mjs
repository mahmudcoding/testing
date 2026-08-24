import { RTC_STATS } from './lib.mjs';
export default async ({ctx}) => {
  const tok = process.env.QA_TOKEN;
  const mk = async (name) => {
    const p = await ctx.newPage();
    await p.goto('https://airion-cargo.store/join/'+tok,{waitUntil:'domcontentloaded'});
    await p.waitForTimeout(2200);
    await p.fill('input[type=text]', name);
    await p.locator('button', {hasText:'Join call'}).first().click();
    await p.waitForTimeout(5000);
    return p;
  };
  const stat = async (p, tag) => {
    const s = await p.evaluate(()=>({
      inCall: !!document.querySelector('[data-testid="call-toolbar"]'),
      expired: /guest session expired/i.test(document.body.innerText),
      text: (document.querySelector('[data-testid="call-overlay-expanded"]')||document.body).innerText.replace(/\n+/g,' | ').slice(0,110)}));
    const r = await p.evaluate('('+RTC_STATS+')()');
    return {tag, ...s, conn: r.stats.map(x=>x.conn)};
  };
  const A = await mk('Solo A');
  const a1 = await stat(A,'A after A joins');
  const B = await mk('Solo B');
  const a2 = await stat(A,'A after B joins');
  const b1 = await stat(B,'B after B joins');
  await A.waitForTimeout(6000);
  const a3 = await stat(A,'A +6s');
  const b2 = await stat(B,'B +6s');
  await A.close(); await B.close();
  return [a1,a2,b1,a3,b2];
};
