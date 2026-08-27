/* Repro: Settings → About promises licences and a way to get help; the block has neither.
 * Report: lane E, "[FE-WEB][SHELL] Подзаголовок About обещает лицензии и способ получить помощь" */
export default async ({ page }) => {
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };
  await page.goto('https://airion-cargo.store/w/W4QEF1XTURESO01/settings/about',
                  { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1800);

  out.asserted = await page.evaluate(() => {
    const main = document.querySelector('main') || document.body;
    const txt = main.innerText;
    const links = [...main.querySelectorAll('a[href]')].map(a => a.textContent.trim()).filter(Boolean);
    return { url: location.href, onAbout: /About/i.test(txt), subtitle:
      (txt.match(/.*licen[cs]e.*|.*help.*/i) || [''])[0].trim().slice(0, 120), links };
  });

  if (!out.asserted.onAbout) {
    out.leftToDo = 'Did not land on the About screen — do not judge this. Open Settings → About by hand.';
    return out;
  }
  out.ready = true;
  out.stepsDone = 1;   // on the About screen; comparing subtitle to content is step 2
  out.leftToDo = 'You are on Settings → About. Read the block subtitle, then look for a licences '
               + 'link and a way to get help in the block below it.';
  return out;
};
