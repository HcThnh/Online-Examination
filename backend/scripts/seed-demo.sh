#!/usr/bin/env bash
# seed-demo.sh — load backend/db/seed-demo.sql into the running postgres.
#
# Usage:
#   ./scripts/seed-demo.sh            Seed ONLY if the database is empty.
#   ./scripts/seed-demo.sh --force    Wipe every table, then seed. Destructive.
#   ./scripts/seed-demo.sh --check    Report the current DB row counts, do nothing.
#   ./scripts/seed-demo.sh --help     Show this help.
#
# The script talks to postgres through the docker-compose service "postgres"
# defined in backend/docker-compose.yml, so no local psql install is required.

set -euo pipefail

# --- locate files relative to this script -----------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SEED_FILE="$BACKEND_DIR/db/seed-demo.sql"
COMPOSE_FILE="$BACKEND_DIR/docker-compose.yml"

PG_SERVICE="postgres"
PG_USER="${POSTGRES_USER:-examuser}"
PG_DB="${POSTGRES_DB:-examdb}"

# --- helpers ----------------------------------------------------------------
color() { local c="$1"; shift; printf '\033[%sm%s\033[0m\n' "$c" "$*"; }
info()  { color "34" "[seed] $*"; }
warn()  { color "33" "[seed] $*"; }
err()   { color "31" "[seed] $*" >&2; }
ok()    { color "32" "[seed] $*"; }

psql_exec() {
  # Pipe SQL into psql inside the postgres container. -T disables the TTY so
  # we can stream SQL via stdin, -v ON_ERROR_STOP makes the first error fatal.
  docker compose -f "$COMPOSE_FILE" exec -T "$PG_SERVICE" \
    psql -U "$PG_USER" -d "$PG_DB" -v ON_ERROR_STOP=1 "$@"
}

print_help() {
  sed -n '2,11p' "$0" | sed 's/^# \{0,1\}//'
}

# --- arg parse --------------------------------------------------------------
MODE="safe"
for arg in "$@"; do
  case "$arg" in
    --force) MODE="force" ;;
    --check) MODE="check" ;;
    --help|-h) print_help; exit 0 ;;
    *) err "Unknown argument: $arg"; print_help; exit 64 ;;
  esac
done

# --- pre-flight: file + container checks ------------------------------------
if [[ ! -f "$SEED_FILE" ]]; then
  err "Seed file not found at: $SEED_FILE"
  exit 1
fi

if ! docker compose -f "$COMPOSE_FILE" ps --services --filter "status=running" | grep -qx "$PG_SERVICE"; then
  err "Postgres container is not running."
  err "Start it first: cd $BACKEND_DIR && docker compose up -d"
  exit 1
fi

# Verify schema exists. If `users` doesn't exist, the Spring app hasn't booted
# yet and Hibernate hasn't created the tables, so seeding would fail.
TABLE_COUNT="$(psql_exec -At -c "
  SELECT count(*)
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN ('users','tests','questions','answer_options','test_attempts','student_answers');
" | tr -d '[:space:]')"

if [[ "$TABLE_COUNT" != "6" ]]; then
  err "Expected 6 application tables in schema 'public' but found $TABLE_COUNT."
  err "Start the Spring app once to let Hibernate create them:"
  err "  cd $BACKEND_DIR && ./mvnw spring-boot:run"
  err "Then re-run this script."
  exit 1
fi

# --- gather current row counts ---------------------------------------------
count_rows() {
  psql_exec -At -c "
    SELECT
      (SELECT count(*) FROM users)           AS users,
      (SELECT count(*) FROM tests)           AS tests,
      (SELECT count(*) FROM questions)       AS questions,
      (SELECT count(*) FROM answer_options)  AS answer_options,
      (SELECT count(*) FROM test_attempts)   AS test_attempts,
      (SELECT count(*) FROM student_answers) AS student_answers;
  "
}

print_counts() {
  IFS='|' read -r u t q o a sa <<< "$1"
  printf '  users:           %s\n' "$u"
  printf '  tests:           %s\n' "$t"
  printf '  questions:       %s\n' "$q"
  printf '  answer_options:  %s\n' "$o"
  printf '  test_attempts:   %s\n' "$a"
  printf '  student_answers: %s\n' "$sa"
}

COUNTS="$(count_rows)"
TOTAL="$(echo "$COUNTS" | awk -F'|' '{ s=0; for (i=1;i<=NF;i++) s+=$i; print s }')"

if [[ "$MODE" == "check" ]]; then
  info "Current row counts in $PG_DB:"
  print_counts "$COUNTS"
  info "Total rows across demo tables: $TOTAL"
  exit 0
fi

# --- safe mode refuses to touch a populated DB ------------------------------
if [[ "$MODE" == "safe" && "$TOTAL" -gt 0 ]]; then
  warn "Database already contains $TOTAL row(s) across the demo tables:"
  print_counts "$COUNTS"
  warn "Refusing to seed: inserting demo rows with fixed IDs could collide"
  warn "with existing data. Re-run with --force to wipe and reseed, or"
  warn "--check to just inspect the current state."
  exit 2
fi

# --- force mode: truncate everything ----------------------------------------
if [[ "$MODE" == "force" ]]; then
  warn "Force mode: about to TRUNCATE every demo table and RESTART identities."
  warn "This will delete ALL users (including any real teachers you registered)."
  info "Truncating..."
  psql_exec <<'SQL'
TRUNCATE TABLE
  student_answers,
  test_attempts,
  answer_options,
  questions,
  tests,
  users
RESTART IDENTITY CASCADE;
SQL
  ok "All demo tables truncated."
fi

# --- seed --------------------------------------------------------------------
info "Loading seed from: $SEED_FILE"
psql_exec < "$SEED_FILE" > /dev/null
ok "Seed applied."

info "Row counts after seeding:"
print_counts "$(count_rows)"

cat <<'EOF'

Demo credentials:
  Teacher 1: alice@example.com / demo1234
  Teacher 2: bob@example.com   / demo1234

Test passcodes (for student access):
  MATH101  Math Basics        (by Alice)
  GEO202   World Geography    (by Alice)
  PY303    Python Programming (by Bob)
  SCI404   General Science    (by Bob)
EOF
