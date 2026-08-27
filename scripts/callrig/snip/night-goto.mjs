export default async ({page}) => {
  await page.goto(process.env.QA_URL, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(Number(process.env.QA_WAIT||7000));
  return {url: page.url().slice(-45),
    people: await page.evaluate(()=>[...document.querySelectorAll('main button')]
      .map(b=>b.getAttribute('aria-label')).filter(l=>l&&l.startsWith('Open ')).length)};
}
