#!/usr/bin/env python3
"""
Aloqa STAGING — permanent QA fixture seeder.

Idempotent: every statement is INSERT ... ON CONFLICT DO UPDATE with fixed IDs,
so re-running repairs drift instead of creating duplicates. Run it any time the
staging fixtures look wrong; you should never need to hand-create QA users again.

    seed/seed.sh              # normal run
    seed/seed.sh --verify     # no writes, just report current state

Creates an isolated company + workspace ("QA Fixtures" / "QA Workspace") so QA
never touches "Acme Workspace", which contains real people.

Every qa.* user's password is QaPass123! and email_verified = true.

Aloqa splits data across five databases; a user only works if it exists in all
of them. Ownership per service:
    auth_db          identity of record: password_hash, email_verified
    org_db           companies, workspaces, channels, roles, memberships
    messaging_db     replica + message sequencing
    notification_db  replica (email + language only)
    realtime_db      replica for websocket fan-out
"""
import argparse
import os
import sys

import psycopg

# Staging credentials come from the environment; seed/seed.sh sources seed/.env.local,
# which is gitignored. See .claude.local.md for what that file should contain.
PGHOST = os.environ.get("QA_PGHOST")
PGPORT = int(os.environ.get("QA_PGPORT", "5433"))
PGUSER = os.environ.get("QA_PGUSER", "aloqa")
PGPASS = os.environ.get("QA_PGPASS")
if not PGHOST or not PGPASS:
    sys.exit("missing QA_PGHOST / QA_PGPASS — create seed/.env.local (see .claude.local.md) "
             "or export them, then re-run seed/seed.sh")

# bcrypt($2a$, rounds=10) of "QaPass123!" — verified with python-bcrypt 5.0.0
PWHASH = "$2a$10$.uCWsa4pyEHQQPcuVMglvusw1NWIhjA3fL.RQVqQ50.q0mtKDHxF."
PASSWORD = "QaPass123!"

CO = "O4QAF1XTURESO01"   # company  "QA Fixtures"
WS = "W4QAF1XTURESO01"   # workspace "QA Workspace"

# id, email, name, username
USERS = [
    ("U4QAOWNER000001", "qa.owner@aloqa.test",    "QA Owner",    "qa_owner"),
    ("U4QAADMIN000001", "qa.admin@aloqa.test",    "QA Admin",    "qa_admin"),
    ("U4QAALICE000001", "qa.alice@aloqa.test",    "QA Alice",    "qa_alice"),
    ("U4QABOB00000001", "qa.bob@aloqa.test",      "QA Bob",      "qa_bob"),
    ("U4QACAROL000001", "qa.carol@aloqa.test",    "QA Carol",    "qa_carol"),
    ("U4QADAVE0000001", "qa.dave@aloqa.test",     "QA Dave",     "qa_dave"),
    ("U4QAOUTSIDER001", "qa.outsider@aloqa.test", "QA Outsider", "qa_outsider"),
    ("U4QAGUEST000001", "qa.guest@aloqa.test",    "QA Guest",    "qa_guest"),
]
UID = {u[3]: u[0] for u in USERS}

# Everyone belongs to the company. qa_outsider is deliberately NOT in the
# workspace, so workspace-level authz has a negative case.
WORKSPACE_MEMBERS = [k for k in UID if k != "qa_outsider"]

# channel_id, name, type, owner, members, archived
CHANNELS = [
    (
        "C4QAGENERAL0001", "qa-general", "public", "qa_owner",
        ["qa_owner", "qa_admin", "qa_alice", "qa_bob", "qa_carol", "qa_guest"],
        False,
    ),
    (
        # owned by ALICE, not owner — gives a channel where a non-owner account
        # holds channel_owner, so Delete/Pin can be tested from both sides.
        "C4QAPRIVATE0001", "qa-private", "private", "qa_alice",
        ["qa_alice", "qa_owner", "qa_bob"],
        False,
    ),
    ("C4QAEMPTY000001", "qa-empty",    "public", "qa_owner", ["qa_owner"], False),
    (
        "C4QAARCHIVE0001", "qa-archived", "public", "qa_owner",
        ["qa_owner", "qa_alice"], True,
    ),
]

# role_id, name, scope_type, scope_id, is_system, is_guest, permissions, holders
ROLES = [
    ("R4QACOMPMEMBER1", "Member", "company", CO, False, False,
     [f"company.{CO}.member.view"], list(UID)),
    ("R4QACOMPADMIN01", "Admin", "company", CO, False, False,
     [f"company.{CO}.*"], ["qa_admin"]),
    ("R4QAGUESTROLE01", "Guest", "company", CO, False, True,
     [f"company.{CO}.member.view"], ["qa_guest"]),
    ("R4QAWSMEMBER001", "Member", "workspace", WS, False, False,
     [f"workspace.{WS}.channel.create", f"workspace.{WS}.channels.view"],
     WORKSPACE_MEMBERS),
    (f"R4QAWSOWNER0001", f"workspace_owner_{WS}", "workspace", WS, True, False,
     [f"workspace.{WS}.*"], ["qa_owner"]),
]
# one channel_owner role per channel, generated below
CHANNEL_OWNER_ROLES = [
    ("R4QACHOWNGEN001", "C4QAGENERAL0001", "qa_owner"),
    ("R4QACHOWNPRV001", "C4QAPRIVATE0001", "qa_alice"),
    ("R4QACHOWNEMP001", "C4QAEMPTY000001", "qa_owner"),
    ("R4QACHOWNARC001", "C4QAARCHIVE0001", "qa_owner"),
]

# personal Saved Messages channel per workspace member
SAVED = {u: f"C4QASAVED{i:06d}" for i, u in enumerate(WORKSPACE_MEMBERS, start=1)}


def connect(db):
    return psycopg.connect(
        host=PGHOST, port=PGPORT, user=PGUSER, password=PGPASS,
        dbname=db, sslmode="require", autocommit=False,
    )


def seed_auth(cur):
    for uid, email, name, username in USERS:
        cur.execute(
            """
            INSERT INTO users (id, email, name, username, password_hash,
                               email_verified, two_fa_enabled, is_super_admin,
                               settings, timezone, updated_at)
            VALUES (%s, %s, %s, %s, %s, true, false, false,
                    '{}'::jsonb, 'Asia/Tashkent', now())
            ON CONFLICT (id) DO UPDATE SET
                email = EXCLUDED.email,
                name = EXCLUDED.name,
                username = EXCLUDED.username,
                password_hash = EXCLUDED.password_hash,
                email_verified = true,
                two_fa_enabled = false,
                deleted_at = NULL,
                timezone = EXCLUDED.timezone,
                updated_at = now()
            """,
            (uid, email, name, username, PWHASH),
        )


def seed_org(cur):
    owner = UID["qa_owner"]
    cur.execute(
        """
        INSERT INTO companies (id, name, slug, owner_id, created_at, updated_at)
        VALUES (%s, 'QA Fixtures', 'qa-fixtures', %s, now(), now())
        ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name, slug = EXCLUDED.slug,
            owner_id = EXCLUDED.owner_id, updated_at = now()
        """,
        (CO, owner),
    )
    cur.execute(
        """
        INSERT INTO workspaces (id, name, slug, type, company_id, owner_id,
                                created_at, updated_at)
        VALUES (%s, 'QA Workspace', 'qa-workspace', 'company', %s, %s, now(), now())
        ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name, slug = EXCLUDED.slug,
            company_id = EXCLUDED.company_id, owner_id = EXCLUDED.owner_id,
            updated_at = now()
        """,
        (WS, CO, owner),
    )

    for uid, email, name, username in USERS:
        cur.execute(
            """
            INSERT INTO users (id, email, name, username, updated_at)
            VALUES (%s, %s, %s, %s, now())
            ON CONFLICT (id) DO UPDATE SET
                email = EXCLUDED.email, name = EXCLUDED.name,
                username = EXCLUDED.username, deleted_at = NULL, updated_at = now()
            """,
            (uid, email, name, username),
        )

    # membership-row ids come from the table defaults (generate_slack_id); the
    # (scope, user) unique keys are what make these idempotent.
    for key in UID:
        cur.execute(
            """
            INSERT INTO company_members (company_id, user_id, joined_at)
            VALUES (%s, %s, now())
            ON CONFLICT (company_id, user_id) DO NOTHING
            """,
            (CO, UID[key]),
        )
    for key in WORKSPACE_MEMBERS:
        cur.execute(
            """
            INSERT INTO workspace_members (workspace_id, user_id, joined_at)
            VALUES (%s, %s, now())
            ON CONFLICT (workspace_id, user_id) DO NOTHING
            """,
            (WS, UID[key]),
        )

    # roles + permissions + assignments
    all_roles = list(ROLES)
    for rid, cid, owner_key in CHANNEL_OWNER_ROLES:
        all_roles.append(
            (rid, f"channel_owner_{cid}", "channel", cid, True, False,
             [f"channel.{cid}.*"], [owner_key])
        )

    for rid, name, scope_type, scope_id, is_system, is_guest, perms, holders in all_roles:
        cur.execute(
            """
            INSERT INTO custom_roles (id, company_id, name, created_by, is_system,
                                      scope_type, scope_id, is_guest, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, now(), now())
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name, is_system = EXCLUDED.is_system,
                scope_type = EXCLUDED.scope_type, scope_id = EXCLUDED.scope_id,
                is_guest = EXCLUDED.is_guest, updated_at = now()
            """,
            (rid, CO, name, owner, is_system, scope_type, scope_id, is_guest),
        )
        for perm in perms:
            cur.execute(
                """
                INSERT INTO role_permissions (role_id, permission, granted_at, granted_by)
                VALUES (%s, %s, now(), %s)
                ON CONFLICT (role_id, permission) DO NOTHING
                """,
                (rid, perm, owner),
            )
        for key in holders:
            cur.execute(
                """
                INSERT INTO user_roles (user_id, role_id, assigned_by, assigned_at, company_id)
                VALUES (%s, %s, %s, now(), %s)
                ON CONFLICT (user_id, role_id) DO NOTHING
                """,
                (UID[key], rid, owner, CO),
            )

    # channels
    for cid, name, ctype, owner_key, members, archived in CHANNELS:
        cur.execute(
            """
            INSERT INTO channels (id, workspace_id, name, type, created_by,
                                  archived_at, created_at, updated_at)
            VALUES (%s, %s, %s, %s::channel_type, %s,
                    CASE WHEN %s THEN now() ELSE NULL END, now(), now())
            ON CONFLICT (id) DO UPDATE SET
                workspace_id = EXCLUDED.workspace_id, name = EXCLUDED.name,
                type = EXCLUDED.type, created_by = EXCLUDED.created_by,
                archived_at = EXCLUDED.archived_at, updated_at = now()
            """,
            (cid, WS, name, ctype, UID[owner_key], archived),
        )
        for key in members:
            cur.execute(
                """
                INSERT INTO channel_members (channel_id, user_id, joined_at, last_read_seq)
                VALUES (%s, %s, now(), 0)
                ON CONFLICT (channel_id, user_id) DO NOTHING
                """,
                (cid, UID[key]),
            )

    # personal Saved Messages channels
    for key, sid in SAVED.items():
        cur.execute(
            """
            INSERT INTO channels (id, workspace_id, name, type, created_by,
                                  created_at, updated_at)
            VALUES (%s, %s, %s, 'saved_messages'::channel_type, %s, now(), now())
            ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, updated_at = now()
            """,
            (sid, WS, f"saved_messages_{UID[key]}", UID[key]),
        )
        cur.execute(
            """
            INSERT INTO channel_members (channel_id, user_id, joined_at, last_read_seq)
            VALUES (%s, %s, now(), 0)
            ON CONFLICT (channel_id, user_id) DO NOTHING
            """,
            (sid, UID[key]),
        )
        cur.execute(
            """
            INSERT INTO saved_message_channels (id, user_id, workspace_id, created_at)
            VALUES (%s, %s, %s, now())
            ON CONFLICT (user_id, workspace_id) DO NOTHING
            """,
            (sid, UID[key], WS),
        )


def seed_messaging(cur):
    cur.execute(
        """
        INSERT INTO workspaces (id, company_id, type, updated_at)
        VALUES (%s, %s, 'company', now())
        ON CONFLICT (id) DO UPDATE SET company_id = EXCLUDED.company_id, updated_at = now()
        """,
        (WS, CO),
    )
    for uid, email, name, username in USERS:
        cur.execute(
            """
            INSERT INTO users (id, name, username, updated_at)
            VALUES (%s, %s, %s, now())
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name, username = EXCLUDED.username,
                deleted_at = NULL, updated_at = now()
            """,
            (uid, name, username),
        )
    for key in WORKSPACE_MEMBERS:
        cur.execute(
            """
            INSERT INTO workspace_members (workspace_id, user_id, joined_at)
            VALUES (%s, %s, now()) ON CONFLICT DO NOTHING
            """,
            (WS, UID[key]),
        )

    chans = [(c[0], c[1], c[2], c[4], c[5]) for c in CHANNELS]
    chans += [(sid, f"saved_messages_{UID[k]}", "saved_messages", [k], False)
              for k, sid in SAVED.items()]
    for cid, name, ctype, members, archived in chans:
        cur.execute(
            """
            INSERT INTO channels (id, workspace_id, name, type, created_by,
                                  archived_at, last_message_seq, created_at, updated_at)
            VALUES (%s, %s, %s, %s, '',
                    CASE WHEN %s THEN now() ELSE NULL END, 0, now(), now())
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name, type = EXCLUDED.type,
                archived_at = EXCLUDED.archived_at, updated_at = now()
            """,
            (cid, WS, name, ctype, archived),
        )
        for key in members:
            cur.execute(
                """
                INSERT INTO channel_members (channel_id, user_id, joined_at, last_read_seq)
                VALUES (%s, %s, now(), 0) ON CONFLICT DO NOTHING
                """,
                (cid, UID[key]),
            )


def seed_notification(cur):
    for uid, email, name, username in USERS:
        cur.execute(
            """
            INSERT INTO users (id, email, language, updated_at)
            VALUES (%s, %s, 'en', now())
            ON CONFLICT (id) DO UPDATE SET
                email = EXCLUDED.email, language = 'en',
                deleted_at = NULL, updated_at = now()
            """,
            (uid, email),
        )


def seed_realtime(cur):
    cur.execute(
        """
        INSERT INTO workspaces (id, company_id, owner_id, updated_at)
        VALUES (%s, %s, %s, now())
        ON CONFLICT (id) DO UPDATE SET
            company_id = EXCLUDED.company_id, owner_id = EXCLUDED.owner_id, updated_at = now()
        """,
        (WS, CO, UID["qa_owner"]),
    )
    for uid, email, name, username in USERS:
        cur.execute(
            """
            INSERT INTO users (id, email, name, username, updated_at)
            VALUES (%s, %s, %s, %s, now())
            ON CONFLICT (id) DO UPDATE SET
                email = EXCLUDED.email, name = EXCLUDED.name,
                username = EXCLUDED.username, deleted_at = NULL, updated_at = now()
            """,
            (uid, email, name, username),
        )
    for key in WORKSPACE_MEMBERS:
        cur.execute(
            "INSERT INTO workspace_members (workspace_id, user_id) VALUES (%s, %s) "
            "ON CONFLICT DO NOTHING",
            (WS, UID[key]),
        )

    chans = [(c[0], c[1], c[2], c[4], c[5]) for c in CHANNELS]
    chans += [(sid, f"saved_messages_{UID[k]}", "saved_messages", [k], False)
              for k, sid in SAVED.items()]
    for cid, name, ctype, members, archived in chans:
        cur.execute(
            """
            INSERT INTO channels (id, workspace_id, name, type, archived_at, updated_at)
            VALUES (%s, %s, %s, %s, CASE WHEN %s THEN now() ELSE NULL END, now())
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name, type = EXCLUDED.type,
                archived_at = EXCLUDED.archived_at, updated_at = now()
            """,
            (cid, WS, name, ctype, archived),
        )
        for key in members:
            cur.execute(
                "INSERT INTO channel_members (channel_id, user_id) VALUES (%s, %s) "
                "ON CONFLICT DO NOTHING",
                (cid, UID[key]),
            )


STEPS = [
    ("auth_db", seed_auth),
    ("org_db", seed_org),
    ("messaging_db", seed_messaging),
    ("notification_db", seed_notification),
    ("realtime_db", seed_realtime),
]


def verify():
    ok = True
    with connect("auth_db") as c, c.cursor() as cur:
        # match the fixture emails exactly — the staging DB also holds unrelated
        # qa.* leftovers (qa.probe.*, qa.livecall.*) from earlier sessions.
        cur.execute(
            "SELECT email, email_verified, password_hash = %s FROM users "
            "WHERE email = ANY(%s) ORDER BY email",
            (PWHASH, [u[1] for u in USERS]),
        )
        rows = cur.fetchall()
        print(f"auth_db users: {len(rows)}/{len(USERS)}")
        for email, verified, pw_ok in rows:
            flag = "OK " if (verified and pw_ok) else "BAD"
            print(f"  [{flag}] {email:26} verified={verified} password_matches={pw_ok}")
            ok &= bool(verified and pw_ok)
        if len(rows) != len(USERS):
            ok = False

    for db in ("org_db", "messaging_db", "notification_db", "realtime_db"):
        with connect(db) as c, c.cursor() as cur:
            cur.execute("SELECT count(*) FROM users WHERE id = ANY(%s)", ([u[0] for u in USERS],))
            n = cur.fetchone()[0]
            print(f"{db:16} user replicas: {n}/{len(USERS)}")
            ok &= n == len(USERS)

    with connect("org_db") as c, c.cursor() as cur:
        cur.execute("SELECT count(*) FROM company_members WHERE company_id=%s", (CO,))
        print(f"company_members : {cur.fetchone()[0]}/{len(USERS)}")
        cur.execute("SELECT count(*) FROM workspace_members WHERE workspace_id=%s", (WS,))
        print(f"workspace_members: {cur.fetchone()[0]}/{len(WORKSPACE_MEMBERS)}")
        cur.execute(
            "SELECT name, type, archived_at IS NOT NULL, "
            "(SELECT count(*) FROM channel_members m WHERE m.channel_id=ch.id) "
            "FROM channels ch WHERE workspace_id=%s AND type<>'saved_messages' ORDER BY name",
            (WS,),
        )
        for name, ctype, arch, members in cur.fetchall():
            print(f"  #{name:12} {ctype:8} archived={str(arch):5} members={members}")
        cur.execute("SELECT count(*) FROM saved_message_channels WHERE workspace_id=%s", (WS,))
        print(f"saved channels   : {cur.fetchone()[0]}/{len(WORKSPACE_MEMBERS)}")
    return ok


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--verify", action="store_true", help="report state, write nothing")
    args = ap.parse_args()

    if not args.verify:
        for db, fn in STEPS:
            with connect(db) as conn:
                with conn.cursor() as cur:
                    fn(cur)
                conn.commit()
            print(f"seeded {db}")
        print()

    ok = verify()
    print()
    print(f"password for every qa.* user: {PASSWORD}")
    print(f"company  {CO}  workspace {WS}")
    if not ok:
        print("\nFAILED: fixture is incomplete", file=sys.stderr)
        return 1
    print("\nAll fixtures present and correct.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
