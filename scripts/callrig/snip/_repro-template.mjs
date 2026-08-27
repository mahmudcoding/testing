/* Repro snippet — the contract the verification bench runs.
 *
 * Copy this to <lane>-<short-name>.mjs, fill in the three sections, and name it
 * in the finding's report block:
 *
 *   <div class="block repro" data-lane="E" data-accounts="alice,bob"
 *        data-snippet="e-calendar-stale.mjs">
 *     <h3>Воспроизведение</h3>
 *     <p><code>./d e:alice snip/e-calendar-stale.mjs</code></p>
 *   </div>
 *
 * Run standalone the same way a session would:  ./d e:alice snip/<name>.mjs
 *
 * THE ONE RULE: leave the human one action short of the defect, and prove you
 * reached the state you claim. A human judging the wrong screen is worse than a
 * human doing the setup by hand — that failure produced three wrong findings in
 * a single night, and none of them looked wrong at the time.
 */
export default async ({ page, pages, ctx, browser }) => {
  // stepsDone: how many of the report's numbered steps this script performs,
  // counting from the first. The bench ticks those off for the human and
  // highlights the next one as theirs, so nobody re-does setup by hand.
  // Count the steps in the finding, not the actions here — one step is often
  // several clicks. Leave it 0 until the setup has actually succeeded.
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };

  // ── 1. GET THERE ────────────────────────────────────────────────────────
  // Navigate and build whatever state the finding needs: create the channel,
  // send the message, archive the thing, grant the permission. Use the other
  // browsers via `pages` when a second account has to act first.
  await page.goto('https://airion-cargo.store/w/<ws>/<route>', { waitUntil: 'networkidle' });

  // ── 2. PROVE IT ─────────────────────────────────────────────────────────
  // Record what makes this the right screen in the right state. The bench shows
  // these to the human, and a mismatch here is the difference between a real
  // verification and a wasted one. Assert, do not assume.
  out.asserted = {
    url:      page.url(),
    account:  await page.evaluate(() => document.querySelector('[data-testid="me"]')?.textContent?.trim() ?? null),
    // the precondition itself — the archived banner, the granted permission,
    // the message that must already exist:
    precondition: await page.evaluate(() => !!document.querySelector('<selector that must be present>')),
  };
  if (!out.asserted.precondition) {
    out.leftToDo = 'Setup did not reach the state this finding needs — do not judge this screen. '
                 + 'Re-run, or follow the written steps by hand.';
    return out;
  }

  // ── 3. HAND OVER ────────────────────────────────────────────────────────
  // Either stop here and name the single action the human performs, or perform
  // it and say what they should be looking at. Naming one concrete control beats
  // restating the repro steps.
  out.ready = true;
  out.stepsDone = 2;   // steps 1-2 of the finding are done; step 3 is the human's
  out.leftToDo = 'Open the message menu on the pinned message and click Edit. '
               + 'Watch whether an editor opens.';
  return out;
};
