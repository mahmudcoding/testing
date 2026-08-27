/* Repro: every member lands in the OTHER group, and searching the directory by department
 * or job title finds nobody — although the values are saved.
 * Report: lane E, "[FE-WEB][DIRECTORIES] Все участники попадают в группу OTHER…"
 *
 * Fills Department and Job title in Settings -> Profile, saves them, proves the server has
 * them, and lands you on Directories -> People — you type the department into the search.
 */
import { DOM } from './lib.mjs';
const WS = 'W4QEF1XTURESO01';
const DEPT = 'Quality Assurance', JOB = 'QA Engineer';

export default async ({ page, progress }) => {
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };

  // step 1 — fill Department and Job title and save them
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/profile`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  await page.evaluate(DOM);
  // the inputs carry React-generated ids and no aria-label; they are named by label[for]
  const idOf = (label) => page.evaluate((l) => {
    const i = [...document.querySelectorAll('main input')]
      .find((x) => window.__qa.nameOf(x).trim() === l);
    return i ? i.id : null;
  }, label);
  const depId = await idOf('Department'), jobId = await idOf('Job title');
  if (!depId || !jobId) {
    out.leftToDo = 'Could not find the Department / Job title fields on Settings -> Profile — do not '
                 + 'judge this screen. Fill them by hand and follow the steps.';
    return out;
  }
  // fill() alone does not dirty this form and Save profile never appears — type it
  for (const [id, val] of [[depId, DEPT], [jobId, JOB]]) {
    const el = page.locator('#' + id);
    await el.click(); await el.fill(''); await el.type(val, { delay: 25 });
    await page.waitForTimeout(400);
  }
  await page.evaluate(DOM);
  const savedClick = await page.evaluate(() => window.__qa.clickDeepest(/^Save profile$/));
  await page.waitForTimeout(3500);

  const stored = await page.evaluate(async () => {
    const j = await (await fetch('/api/v1/auth/me', { credentials: 'include' })).json();
    return (j.settings && j.settings.profile) || null;
  });
  if (!stored || stored.department !== DEPT || stored.jobTitle !== JOB) {
    out.asserted = { stored, savedClick };
    out.leftToDo = 'Department and Job title did not save — do not judge this screen. Set them by '
                 + 'hand in Settings -> Profile and follow the steps.';
    return out;
  }
  progress(1);

  // step 2 — Directories -> People
  await page.goto(`https://airion-cargo.store/w/${WS}/directories?tab=people`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4500);
  await page.evaluate(DOM);

  out.asserted = await page.evaluate(async (ws) => {
    const m = document.querySelector('main') || document.body;
    const mem = await (await fetch(`/api/v1/workspaces/${ws}/members`, { credentials: 'include' })).json();
    const members = mem.members || [];
    const box = [...m.querySelectorAll('input')].find((i) => window.__qa.vis(i));
    return {
      url: location.href,
      onPeopleTab: /tab=people/.test(location.href),
      memberCount: members.length,
      groupHeadingsOnScreen: (m.innerText.match(/^[A-Z][A-Z \-&]{2,}$/gm) || []).slice(0, 6),
      membersResponseCarriesDepartment: members.filter((x) => x.department !== undefined).length + '/' + members.length,
      membersResponseCarriesJobTitle: members.filter((x) => x.job_title !== undefined || x.jobTitle !== undefined).length + '/' + members.length,
      // the directory search box is named only by its placeholder
      searchBoxName: box ? (window.__qa.nameOf(box) || box.placeholder || box.type) : null,
    };
  }, WS);
  out.asserted.savedProfile = stored;

  if (!out.asserted.onPeopleTab || !out.asserted.searchBoxName) {
    out.leftToDo = 'Did not reach Directories -> People with its search box — do not judge this '
                 + 'screen. Open it by hand.';
    return out;
  }
  progress(2);

  out.ready = true;
  out.stepsDone = 2;   // steps 1-2 done; searching the directory is step 3
  out.leftToDo = `This account's Department is now "${DEPT}" and its Job title "${JOB}" — the server `
               + `returns both. You are on Directories -> People, showing ${out.asserted.memberCount} `
               + `members. Look at which group heading they are filed under and whether any row shows a `
               + `department or a job title, then type "${DEPT}" into the directory search box `
               + `("${out.asserted.searchBoxName}") and see what comes back.`;
  return out;
};
