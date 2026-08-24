export default async ({page}) => {
  const snap = async (tag) => await page.evaluate((tag) => ({
    tag,
    name: (document.querySelector('input[type=text]')||{}).value,
    pw: ((document.querySelector('input[type=password]')||{}).value||'').length,
    btnDisabled: [...document.querySelectorAll('button')].find(b=>/Join call/.test(b.textContent))?.disabled,
    labels: [...document.querySelectorAll('label')].map(l=>l.textContent.trim().slice(0,80)),
    required: {name: (document.querySelector('input[type=text]')||{}).required, pw: (document.querySelector('input[type=password]')||{}).required}
  }), tag);
  const out = [];
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(2500);
  out.push(await snap('fresh'));
  await page.fill('input[type=text]','PW Guest'); await page.waitForTimeout(700);
  out.push(await snap('name-only'));
  await page.fill('input[type=password]','x'); await page.waitForTimeout(700);
  out.push(await snap('name+badpw'));
  return out;
};
