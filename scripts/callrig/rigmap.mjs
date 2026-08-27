// Single source of truth for which browser belongs to which lane.
//
// A lane owns a block of ten CDP ports, so two sessions can never address the
// same window by accident. Lane A keeps the ports and profile names it has
// always had; further lanes are offset by ten each.
//
//   lane A -> 9220..9229   profiles: alice, bob, …      emails: qa.alice@…
//   lane B -> 9230..9239   profiles: b-alice, b-bob, …  emails: qa.b.alice@…
//
//   node rigmap.mjs port    B alice   -> 9232
//   node rigmap.mjs profile B alice   -> b-alice
//   node rigmap.mjs email   B alice   -> qa.b.alice@aloqa.test
//   node rigmap.mjs table   B         -> every account in the lane

export const ACCOUNTS = {
  alice: 2, bob: 3, carol: 4, dave: 5,
  owner: 6, admin: 7, guest: 8, outsider: 9,
};

const laneIndex = (lane) => {
  const L = String(lane || '').toUpperCase();
  if (!/^[A-Z]$/.test(L)) throw new Error(`lane must be a single letter A-Z, got ${lane}`);
  return { L, i: L.charCodeAt(0) - 65 };
};

export function rigPort(lane, account) {
  const { i, L } = laneIndex(lane);
  const off = ACCOUNTS[String(account || '').toLowerCase()];
  if (off === undefined) throw new Error(`unknown account ${account} (have ${Object.keys(ACCOUNTS).join(', ')})`);
  // Snippets name their own lane when they reach for a second browser, and they
  // connect straight over CDP — so drive.mjs's lane guard never sees it. Running
  // a snippet under a different lane would then quietly drive another session's
  // window. Refuse instead; the mismatch is always a mistake, never intent.
  const want = (process.env.QA_LANE || '').toUpperCase();
  if (want && want !== L) {
    throw new Error(`lane guard — asked for lane ${L}'s ${account} while QA_LANE is ${want}. `
                  + `A snippet is bound to its own lane; run it with ./d ${L.toLowerCase()}:<account>.`);
  }
  return 9220 + i * 10 + off;
}

export function rigProfile(lane, account) {
  const { L } = laneIndex(lane);
  const a = String(account).toLowerCase();
  return L === 'A' ? a : `${L.toLowerCase()}-${a}`;
}

export function rigEmail(lane, account) {
  const { L } = laneIndex(lane);
  const a = String(account).toLowerCase();
  return L === 'A' ? `qa.${a}@aloqa.test` : `qa.${L.toLowerCase()}.${a}@aloqa.test`;
}

export function laneOfEmail(email) {
  const m = /^qa\.(?:([a-z])\.)?([a-z]+)@aloqa\.test$/.exec(String(email || ''));
  if (!m) return null;
  return { lane: (m[1] || 'a').toUpperCase(), account: m[2] };
}

export function laneOfPort(port) {
  const p = Number(port);
  if (!(p >= 9220 && p < 9220 + 26 * 10)) return null;
  return String.fromCharCode(65 + Math.floor((p - 9220) / 10));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [, , cmd, lane, account] = process.argv;
  const fns = { port: rigPort, profile: rigProfile, email: rigEmail };
  if (cmd === 'table') {
    for (const a of Object.keys(ACCOUNTS))
      console.log(`${a.padEnd(9)} port ${rigPort(lane, a)}  profile ${rigProfile(lane, a).padEnd(10)} ${rigEmail(lane, a)}`);
  } else if (fns[cmd]) {
    console.log(fns[cmd](lane, account));
  } else {
    console.error('usage: rigmap.mjs port|profile|email <lane> <account>   |   rigmap.mjs table <lane>');
    process.exit(2);
  }
}
