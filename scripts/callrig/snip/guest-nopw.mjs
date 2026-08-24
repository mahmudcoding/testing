export default async ({ctx}) => {
  const tok = process.env.QA_TOKEN;
  const p = await ctx.newPage();
  await p.goto('https://airion-cargo.store/join/'+tok, {waitUntil:'domcontentloaded'});
  await p.waitForTimeout(3000);
  const r = await p.evaluate(() => ({
    body: document.body.innerText.replace(/\n+/g,' | ').slice(0,300),
    labels: [...document.querySelectorAll('label')].map(l=>l.textContent.trim().slice(0,80)),
    hasPwField: !!document.querySelector('input[type=password]'),
    btnDisabled: [...document.querySelectorAll('button')].find(b=>/Join call/.test(b.textContent))?.disabled
  }));
  await p.close();
  return r;
};
