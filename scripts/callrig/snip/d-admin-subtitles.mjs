/* Repro: four settings subtitles describe content the page does not have.
 * Report: lane D, "[FE-WEB][SETTINGS] Четыре подзаголовка описывают содержимое,
 * которого на странице нет" */
const WS = 'W4QDF1XTURESO01';

const look = async (page, route, wait = 3000) => {
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/${route}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(wait);
  return page.evaluate(() => {
    // The settings nav lives inside <main>; the content area is what follows the breadcrumb.
    const main = document.querySelector('main') || document.body;
    const lines = main.innerText.split('\n').map(s => s.trim()).filter(Boolean);
    const i = lines.lastIndexOf('Audit log');       // last item of the settings nav
    const body = lines.slice(i + 1);
    // The page title also appears in the breadcrumb, so take the LAST occurrence of the
    // <h1> text; the subtitle is the line right after it.
    const h1 = (main.querySelector('h1')?.innerText || '').trim();
    const j = body.lastIndexOf(h1);
    return { path: location.pathname, h1, subtitle: j >= 0 ? (body[j + 1] || null) : null, body: body.slice(0, 30) };
  });
};

export default async ({ page, progress }) => {
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };

  const dash     = await look(page, 'admin/company');
  const about    = await look(page, 'about');
  const security = await look(page, 'security');
  const ws       = await look(page, 'admin/workspaces');   // land here — step 1

  out.asserted = {
    url: page.url(),
    onWorkspacesAdmin: /\/settings\/admin\/workspaces$/.test(new URL(page.url()).pathname),
    subtitles: {
      'admin/workspaces': ws.subtitle,
      'admin/company (Overview)': dash.subtitle,
      'about': about.subtitle,
      'security': security.subtitle,
    },
    workspacesBody: ws.body,
    aboutContentLinks: await (async () => {
      const cur = page.url();
      await page.goto(`https://airion-cargo.store/w/${WS}/settings/about`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2200);
      const n = await page.evaluate(() => {
        const main = document.querySelector('main');
        const nav = main.querySelector('nav, [role="navigation"]');
        return [...main.querySelectorAll('a[href]')].filter(a => !nav || !nav.contains(a)).length;
      });
      await page.goto(cur, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2500);
      return n;
    })(),
  };

  const s = out.asserted.subtitles;
  const ok = out.asserted.onWorkspacesAdmin
    && /who may open it/i.test(s['admin/workspaces'] || '')
    && /recent activity/i.test(s['admin/company (Overview)'] || '')
    && /licen/i.test(s['about'] || '')
    && /encryption keys/i.test(s['security'] || '');
  if (!ok) {
    out.leftToDo = 'Setup did not reach the state this finding needs — one of the four subtitles did '
                 + 'not read back as the finding describes. Do not judge this screen; re-run, or open '
                 + 'the four pages by hand.';
    return out;
  }
  progress(1);   // step 1: on Settings → Admin → Workspaces, subtitle read

  out.ready = true;
  out.stepsDone = 1;   // steps 2-4 (the other three pages) are the human's
  out.leftToDo = 'You are on Settings → Admin → Workspaces. Read its subtitle — "Every workspace in '
               + 'this company, and who may open it." — then look for anything on the page saying who '
               + 'may open the workspace. Then repeat on the other three: Settings → Admin → Company '
               + 'dashboard (tab Overview, promises recent activity), Settings → About (promises '
               + 'licences and where to get help), Settings → Security (promises encryption keys). '
               + 'All four subtitles are quoted in asserted.subtitles above.';
  return out;
};
