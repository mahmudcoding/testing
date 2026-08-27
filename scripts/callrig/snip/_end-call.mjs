/* Infrastructure, not a repro: end a meeting left running by the previous run.
 *
 * Call findings build their own meeting, but they hand over with it still live —
 * that is the state being judged. Reproducing a second call finding without
 * closing the browser then starts from a call that is already up, often with a
 * co-host promoted, and a host cannot moderate a co-host: the menu the next
 * snippet needs comes back empty and it refuses. Measured exactly that across
 * six lane-A snippets run back to back.
 *
 * No-op when the driving window is not in a call.
 */
export default async ({ page }) => {
  const inCall = /\/call\//.test(page.url());
  if (!inCall) return { inCall: false, ended: false };

  // Leave is two steps: the button opens a confirm, and only the confirm leaves.
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')]
      .find(x => /leave call/i.test(x.getAttribute('aria-label') || x.textContent || ''));
    b && b.click();
  });
  await page.waitForTimeout(900);
  await page.evaluate(() => {
    const end = [...document.querySelectorAll('button')]
      .find(x => /end (the )?(call|meeting) for everyone/i.test(x.textContent || ''));
    const leave = [...document.querySelectorAll('[role="dialog"] button')]
      .find(x => /^leave$/i.test((x.textContent || '').trim()));
    (end || leave) && (end || leave).click();
  });
  await page.waitForTimeout(1800);
  return { inCall: true, ended: !/\/call\//.test(page.url()), url: page.url() };
};
