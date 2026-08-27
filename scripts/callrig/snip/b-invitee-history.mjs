/* B — «В истории приглашённого групповой звонок выглядит одинаково, принял он приглашение,
 *      отклонил или не ответил».
 * Скрипт делает шаги 1-4 находки для двух исходов (недозвон и явное Decline),
 * шаг 5 (открыть раздел Calls и посмотреть историю) остаётся человеку — в этом же окне.
 *   ./d b:bob snip/b-invitee-history.mjs      (окно ведущего — alice — поднимается само)
 */
import { second } from './b-second.mjs';

const WS = 'W4QBF1XTURESO01';
const HOSTURL = 'https://staging.airion-cargo.store';
const MINE = '^QA [a-z]+ \\d{6}$';
const ME = 'QA Bob';

async function endOwnLeftover(p) {
  return await p.evaluate(async mine => {
    const j = await (await fetch('/api/v1/meetings/current', { credentials: 'include' })).json().catch(() => null);
    const m = j && j.meeting;
    if (!m || m.status !== 'active') return { inCall: false };
    if (!new RegExp(mine).test(m.name || '')) return { inCall: true, foreign: true, name: m.name };
    await fetch(`/api/v1/meeting/${m.id}/end`, { method: 'POST', credentials: 'include' });
    return { inCall: true, foreign: false, ended: m.name };
  }, MINE);
}

async function startCallAndInvite(host, name) {
  await host.goto(`${HOSTURL}/w/${WS}/calls`, { waitUntil: 'domcontentloaded' });
  await host.waitForTimeout(5000);
  await host.evaluate(() => { const b = document.querySelector('[data-testid="calls-hub-start-now"]'); if (b) b.click(); });
  await host.waitForTimeout(3000);
  const ni = await host.$('[role=dialog] input[type=text], [role=dialog] input:not([type])');
  if (!ni) return { err: 'диалог Start a call не открылся' };
  await ni.fill(name);
  await host.evaluate(() => { const r = [...document.querySelectorAll('[role=dialog] input[type=radio]')].find(x => x.value === 'open'); if (r) r.click(); });
  await host.waitForTimeout(700);
  await host.evaluate(() => {
    const d = [...document.querySelectorAll('[role=dialog]')].filter(x => x.getBoundingClientRect().width > 0).pop();
    const b = [...d.querySelectorAll('button')].find(x => /^Start call$/i.test((x.innerText || '').trim()));
    if (b) b.click();
  });
  await host.waitForTimeout(9000);
  const mid = (host.url().match(/\/call\/([A-Za-z0-9]+)/) || [])[1] || null;
  if (!mid) return { err: `звонок не начался, адрес ${host.url()}` };
  await host.evaluate(() => { const b = document.querySelector('[data-testid="call-controls-add-to-call"]'); if (b) b.click(); });
  await host.waitForTimeout(3500);
  const ok = await host.evaluate(me => {
    const vis = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const d = [...document.querySelectorAll('[role=dialog]')].filter(x => vis(x) && x.getAttribute('data-testid') !== 'call-overlay-expanded').pop();
    if (!d) return false;
    const c = [...d.querySelectorAll('div,li,label')]
      .filter(e => vis(e) && (e.innerText || '').includes(me) && e.querySelector('input[type=checkbox]'))
      .sort((x, y) => (x.innerText || '').length - (y.innerText || '').length)[0];
    if (!c) return false;
    const cb = c.querySelector('input[type=checkbox]');
    if (cb.disabled) return false;
    cb.click();
    return true;
  }, ME);
  if (!ok) return { err: 'не удалось отметить приглашаемого в Add to call' };
  await host.waitForTimeout(1500);
  const label = await host.evaluate(() => {
    const vis = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const d = [...document.querySelectorAll('[role=dialog]')].filter(x => vis(x) && x.getAttribute('data-testid') !== 'call-overlay-expanded').pop();
    const b = [...d.querySelectorAll('button')].filter(vis).find(x => /^Invite \(/.test((x.innerText || '').trim()));
    if (!b) return null;
    b.click();
    return (b.innerText || '').trim();
  });
  if (!label) return { err: 'нет кнопки Invite (N)' };
  return { mid, label };
}

/** Ждём у приглашённого баннер входящего; then: 'ignore' — дождаться Missed call,
 *  'decline' — нажать Decline. Возвращаем, что реально видели. */
async function handleIncoming(p, then) {
  const seen = { calling: null, missed: null, declined: false };
  for (let i = 0; i < 40; i++) {
    const s = await p.evaluate(() => {
      const vis = el => { const r = el.getBoundingClientRect(); return r.width > 1 && r.height > 1; };
      const t = document.body.innerText.replace(/\s+/g, ' ');
      const dec = [...document.querySelectorAll('button')].filter(vis).find(x => /^Decline$/i.test((x.innerText || '').trim()));
      let box = null;
      if (dec) { const r = dec.getBoundingClientRect(); box = { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) }; }
      return {
        calling: /is calling/i.test(t), missed: /Missed call/i.test(t), declineBox: box,
        excerpt: (t.match(/.{0,20}(is calling|Missed call).{0,40}/i) || [])[0] || null,
      };
    });
    if (s.calling && !seen.calling) seen.calling = s.excerpt;
    if (then === 'decline' && s.calling && s.declineBox) {
      await p.mouse.click(s.declineBox.x, s.declineBox.y);
      seen.declined = true;
      await p.waitForTimeout(4000);
      break;
    }
    if (then === 'ignore' && s.missed) { seen.missed = s.excerpt; break; }
    await p.waitForTimeout(3000);
  }
  return seen;
}


/** Дать звонку прожить не меньше 70 с, иначе длительность в истории округлится до «0m»
 *  и утверждение «показана длительность всего звонка, а не участия» ничего не покажет. */
async function letItRun(host, mid, seconds = 70) {
  for (let i = 0; i < 40; i++) {
    const age = await host.evaluate(async id => {
      const j = await (await fetch(`/api/v1/meeting/${id}`, { credentials: 'include' })).json().catch(() => null);
      const m = j && (j.meeting || j);
      return m && m.started_at ? Math.round((Date.now() - Date.parse(m.started_at)) / 1000) : 0;
    }, mid);
    if (age >= seconds) return age;
    await host.waitForTimeout(5000);
  }
  return null;
}

export default async ({ page, progress }) => {
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };
  const pad = n => String(n).padStart(2, '0');
  const now = new Date();
  const stamp = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

  // ── 1. GET THERE ────────────────────────────────────────────────────────
  out.preflight = { invitee: await endOwnLeftover(page) };
  if (out.preflight.invitee.foreign) {
    out.leftToDo = `Это окно уже в звонке «${out.preflight.invitee.name}». Выйдите из него и запустите снippet заново.`;
    return out;
  }
  await page.goto(`${HOSTURL}/w/${WS}/calls`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  const a = await second('B', 'alice');
  out.hostBrowser = { port: a.port, account: a.email, ensured: a.ensured };
  out.preflight.host = await endOwnLeftover(a.page);
  if (out.preflight.host.foreign) {
    out.leftToDo = `Окно ведущего уже в звонке «${out.preflight.host.name}». Выйдите из него и запустите снippet заново.`;
    return out;
  }

  // шаги 1-2 — групповой звонок, приглашение, недозвон
  const n1 = `QA hist ${stamp}`;
  const c1 = await startCallAndInvite(a.page, n1);
  if (c1.err) { out.leftToDo = `${c1.err} — состояние не достигнуто.`; return out; }
  progress(1); out.stepsDone = 1;
  const seen1 = await handleIncoming(page, 'ignore');
  if (!seen1.calling || !seen1.missed) {
    out.leftToDo = `Первый вызов не пришёл или не истёк (${JSON.stringify(seen1)}) — состояние не достигнуто.`;
    return out;
  }
  progress(2); out.stepsDone = 2;
  const age1 = await letItRun(a.page, c1.mid);
  await a.page.evaluate(async id => { await fetch(`/api/v1/meeting/${id}/end`, { method: 'POST', credentials: 'include' }); }, c1.mid);
  await a.page.waitForTimeout(5000);

  // шаг 3 — то же самое, но приглашение отклоняется кнопкой Decline
  const n2 = `QA hist ${stamp}b`.replace(/b$/, '');
  const stamp2 = `${pad(new Date().getHours())}${pad(new Date().getMinutes())}${pad(new Date().getSeconds())}`;
  const c2 = await startCallAndInvite(a.page, `QA hist ${stamp2}`);
  if (c2.err) { out.leftToDo = `${c2.err} (второй звонок) — состояние не достигнуто.`; return out; }
  const seen2 = await handleIncoming(page, 'decline');
  if (!seen2.calling || !seen2.declined) {
    out.leftToDo = `Второй вызов не пришёл или Decline не нажался (${JSON.stringify(seen2)}) — состояние не достигнуто.`;
    return out;
  }
  progress(3); out.stepsDone = 3;

  // шаг 4 — завершить звонок
  const age2 = await letItRun(a.page, c2.mid);
  await a.page.evaluate(async id => { await fetch(`/api/v1/meeting/${id}/end`, { method: 'POST', credentials: 'include' }); }, c2.mid);
  await a.page.waitForTimeout(6000);
  progress(4); out.stepsDone = 4;

  // ── 2. PROVE IT ─────────────────────────────────────────────────────────
  await page.goto(`${HOSTURL}/w/${WS}/calls`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(8000);
  const probe = await page.evaluate(async ([a1, a2]) => {
    const vis = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const rowFor = n => [...document.querySelectorAll('button,li,[role=listitem]')].filter(vis)
      .map(b => (b.innerText || '').replace(/\s+/g, ' ').trim())
      .filter(t => t.includes(n))
      .sort((x, y) => x.length - y.length)[0] || null;
    const r = await fetch('/api/v1/meetings/history?limit=100', { credentials: 'include' });
    const j = await r.json().catch(() => null);
    const arr = (j && (j.meetings || j.items || j.data)) || [];
    const pick = n => {
      const m = arr.find(x => x.name === n);
      return m ? {
        name: m.name,
        hasEndReason: 'end_reason' in m, end_reason: m.end_reason ?? null,
        hasMissedForViewer: 'missed_for_viewer' in m,
      } : null;
    };
    const groups = arr.filter(m => !m.channel_id);
    const oneToOne = arr.filter(m => m.channel_id);
    return {
      rowNoAnswer: rowFor(a1), rowDeclined: rowFor(a2),
      apiNoAnswer: pick(a1), apiDeclined: pick(a2),
      historyRows: arr.length,
      groupRowsWithEndReason: groups.filter(m => 'end_reason' in m).length, groupRows: groups.length,
      oneToOneRowsWithEndReason: oneToOne.filter(m => 'end_reason' in m).length, oneToOneRows: oneToOne.length,
      rowsWithMissedForViewer: arr.filter(m => 'missed_for_viewer' in m).length,
    };
  }, [n1, `QA hist ${stamp2}`]);

  // приложение знает правду: приглашённого нет среди участников ни одного из двух звонков
  const notAParticipant = await a.page.evaluate(async ([id1, id2, me]) => {
    const one = async id => {
      const j = await (await fetch(`/api/v1/meeting/${id}/participants`, { credentials: 'include' })).json().catch(() => null);
      const arr = (j && (j.participants || j.items || j.data)) || [];
      return { names: arr.map(p => p.name), includesInvitee: arr.some(p => p.name === me) };
    };
    return { call1: await one(id1), call2: await one(id2) };
  }, [c1.mid, c2.mid, ME]);

  // увести окно с хаба, чтобы шаг 5 — открыть Calls — остался человеку
  await page.goto(`${HOSTURL}/w/${WS}/directories`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  out.asserted = {
    url: page.url(),
    invitee: ME,
    call_noAnswer: { name: n1, inviteeSaw: seen1, callLastedSeconds: age1 },
    call_declined: { name: `QA hist ${stamp2}`, inviteeSaw: seen2, callLastedSeconds: age2 },
    historyRowAsRendered_noAnswer: probe.rowNoAnswer,
    historyRowAsRendered_declined: probe.rowDeclined,
    historyApi_noAnswer: probe.apiNoAnswer,
    historyApi_declined: probe.apiDeclined,
    endReasonInGroupRows: `${probe.groupRowsWithEndReason} из ${probe.groupRows}`,
    endReasonInOneToOneRows: `${probe.oneToOneRowsWithEndReason} из ${probe.oneToOneRows}`,
    missedForViewerInAnyRow: `${probe.rowsWithMissedForViewer} из ${probe.historyRows}`,
    inviteeIsNotAParticipantOfEitherCall: notAParticipant,
  };
  const both = probe.rowNoAnswer && probe.rowDeclined
    && /Incoming · Ended/.test(probe.rowNoAnswer) && /Incoming · Ended/.test(probe.rowDeclined);
  if (!(both && probe.apiNoAnswer && !probe.apiNoAnswer.hasEndReason && probe.apiDeclined && !probe.apiDeclined.hasEndReason)) {
    out.leftToDo = 'Не достигнуто состояние находки: в истории приглашённого должны быть две строки — '
                 + `недозвон и явный Decline — и обе как «Incoming · Ended». Сейчас: ${JSON.stringify(probe)}. Судить нельзя.`;
    return out;
  }

  // ── 3. HAND OVER ────────────────────────────────────────────────────────
  out.ready = true;
  out.leftToDo = `Это окно приглашённого (${ME}). Только что прошли два групповых звонка: в «${n1}» он вызов `
               + `получил и не ответил (истёк), в «QA hist ${stamp2}» — нажал Decline. Ни в один он не входил, `
               + `и среди участников обоих звонков его нет. Откройте раздел Calls в левом меню и посмотрите на `
               + `две верхние строки истории: обе читаются одинаково — «Incoming · Ended», и длительность в них — `
               + `это длительность всего звонка (${age1} с и ${age2} с), а не его участия, которого не было. `
               + `Отличить исход по строке нельзя.`;
  return out;
};
