/* Repro: choosing a file in Settings → Company replaces the company logo immediately —
 * no crop, no confirmation, no way back.
 * Report: lane D, "[FE-WEB][COMPANY] Логотип компании заменяется в момент выбора файла —
 * без кадрирования, подтверждения и возможности вернуть прежний" */
const WS = 'W4QDF1XTURESO01', CO = 'O4QDF1XTURESO01';

export default async ({ page, progress }) => {
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };

  await page.goto(`https://airion-cargo.store/w/${WS}/settings/company`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3200);

  out.asserted = await page.evaluate(async (co) => {
    const main = document.querySelector('main');
    const nav = main.querySelector('nav,[role="navigation"]');
    const inContent = (e) => !nav || !nav.contains(e);
    const controls = [...main.querySelectorAll('button,input,a[href]')].filter(inContent)
      .map(e => `${e.tagName}[${e.type || ''}] "${(e.getAttribute('aria-label') || e.innerText || '').trim().slice(0, 40)}"`);
    const company = await (await fetch(`/api/v1/companies/${co}`, { credentials: 'include' })).json();
    const del = await fetch(`/api/v1/companies/${co}/avatar`, { method: 'DELETE', credentials: 'include' });
    return {
      url: location.href,
      onCompany: /\/settings\/company$/.test(location.pathname),
      uploadButton: controls.some(c => /"Upload image"/.test(c)),
      fileInputPresent: !!main.querySelector('input[type=file]'),
      contentControls: controls,
      removeOrDeleteWordOnPage: /remove|delete/i.test(main.innerText),
      avatarUrlNow: (company.company || company).avatar_url,
      deleteAvatarProbe: del.status + ' ' + (await del.text()).slice(0, 80),
      openDialogs: document.querySelectorAll('[role="dialog"]').length,
      savePanelButtons: [...main.querySelectorAll('button')].map(b => b.innerText.trim())
        .filter(t => /^(Save|Discard|Apply)/.test(t)),
    };
  }, CO);

  const a = out.asserted;
  if (!a.onCompany || !a.uploadButton || !a.fileInputPresent) {
    out.leftToDo = 'Setup did not reach the state this finding needs — Settings → Company is not showing '
                 + 'the Company identity block with Upload image. Do not judge this screen; re-run, or '
                 + 'open it by hand with an account that administers the company.';
    return out;
  }
  progress(1);   // step 1 up to the file dialog: on Settings → Company with Upload image ready

  out.ready = true;
  out.stepsDone = 0;   // step 1 finishes with the file choice, and that is the human's action
  out.leftToDo = 'Press "Upload image" and pick any picture. Then, WITHOUT pressing anything else, '
               + 'look at the company avatar and at the network tab. Note the page has no Save / '
               + 'Discard panel (buttons now: none of Save/Discard/Apply) and no remove control — '
               + '"remove"/"delete" does not appear in the page text and DELETE on the company avatar '
               + 'answers ' + a.deleteAvatarProbe.split(' ')[0] + '. For the comparison in step 3, do '
               + 'the same in Settings → Account → Change avatar: that one crops, previews and waits '
               + 'for Save changes. The company logo you set here cannot be taken off again.';
  return out;
};
