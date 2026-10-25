#!/usr/bin/env python3
"""Pedagogy & contract linter for the 24-week Python curriculum.

Reads `src/content/pedagogy-manifest.yaml` and validates all 24 `.mdx` lessons:
- Manifest integrity (96 waypoints, 181 traps, orphan rationale rules).
- Rule 1 (WAYPOINT_CONSTRUCT_MISMATCH): exercise solution/scaffold uses the
  waypoint's target AST constructs and primary construct tokens from the manifest.
- Rule 2 (PRE_SOLVED_TARGET_CONSTRUCT): the waypoint's target construct is not
  already solved in `initialCode` outside the learner's `# TODO` gap.
- Rule 3 (INCOMPLETE_WAYPOINT_PRINCIPLE): the exercise covers all required
  waypoint principle tokens from the manifest.
- Rule 4 (SHORTCUT_BYPASS_VULNERABILITY): multi-branch/compound-condition
  exercises must evaluate multiple test cases so constant literals, unconditional
  raises, or half-comparisons cannot pass.
- Stage 3 Scaffolding Fade (Weeks 16-24): `# TODO` comments contain no syntax
  spoilers and target functions/classes provide typed signatures and docstrings.
- Runtime verification: `initialCode` fails `expectedOutput` and the reference
  solution passes `expectedOutput` while matching the manifest AST constructs.
"""

from __future__ import annotations

import argparse
import ast
import html
import io
import re
import sys
from contextlib import redirect_stderr, redirect_stdout
from pathlib import Path
import yaml

ROOT = Path(__file__).resolve().parent
MANIFEST_PATH = ROOT / "src" / "content" / "pedagogy-manifest.yaml"

ATTR_RE = re.compile(r'([a-zA-Z][\w-]*)="([^"]*)"')

# Reference solutions (used to verify that each exercise's intended solution
# executes to expectedOutput and matches the manifest AST).
REFERENCE_SOLUTIONS: dict[str, str] = {
    "w01-assign-and-print": (
        "hostname = 'srv-07'\n"
        "used_gb = 180\n"
        "used_gb = 190\n"
        "print(hostname, used_gb)"
    ),
    "w01-cast-before-math": (
        "raw_used = '87.5'\n"
        "bonus = 12.5\n"
        "total = float(raw_used) + bonus\n"
        "print(total)"
    ),
    "w01-delta-percentage": (
        "start_used = 120\n"
        "current_used = 170\n"
        "limit = 200\n"
        "growth_pct = ((current_used - start_used) / limit) * 100\n"
        "print(growth_pct)"
    ),
    "w01-fstring-report": (
        "hostname = 'srv-07'\n"
        "used = 190\n"
        "limit = 200\n"
        "percent = (used / limit) * 100\n"
        "print(f'{hostname}: {percent:.1f}% used')"
    ),
    "w02-compare-disk-percent": (
        "pct_warn = 95.0\n"
        "pct_over = 105.0\n"
        "is_warn_1 = (pct_warn >= 90) and (pct_warn < 100)\n"
        "is_warn_2 = (pct_over >= 90) and (pct_over < 100)\n"
        "print(is_warn_1, is_warn_2)"
    ),
    "w02-elif-order": (
        "percent = 105.0\n"
        "if percent >= 100:\n"
        "    status = 'OVER LIMIT'\n"
        "elif percent >= 90:\n"
        "    status = 'WARNING'\n"
        "else:\n"
        "    status = 'OK'\n"
        "print(status)"
    ),
    "w02-range-total": (
        "total = 0\n"
        "for i in range(1, 6):\n"
        "    total += i\n"
        "print(total)"
    ),
    "w03-return-not-print": (
        "def add_tax(price):\n"
        "    return price * 1.2\n\n"
        "total = add_tax(100)\n"
        "print(total)"
    ),
    "w03-default-warning": (
        "def status_of(percent, warning_at=90):\n"
        "    if percent >= 100:\n"
        "        return 'OVER LIMIT'\n"
        "    elif percent >= warning_at:\n"
        "        return 'WARNING'\n"
        "    return 'OK'\n\n"
        "print(status_of(95))\n"
        "print(status_of(95, 96))"
    ),
    "w03-unpack-record": (
        "def check_record(value, limit):\n"
        "    difference = value - limit\n"
        "    percent = (value / limit) * 100\n"
        "    return difference, percent\n\n"
        "difference, percent = check_record(87, 100)\n"
        "print(difference, percent)"
    ),
    "w04-comprehension-filter": (
        "values = [10, 20, 30, 40, 50]\n"
        "big_values = [v for v in values if v >= 40]\n"
        "print(big_values)"
    ),
    "w04-dict-get-default": (
        "record = {'label': 'R-001', 'value': 87.0, 'limit': 100.0}\n"
        "print(record.get('status', 'unknown'))"
    ),
    "w04-split-fields": (
        "line = 'R-001,87,100'\n"
        "label, value, limit = line.split(',')\n"
        "print(label, float(value) + float(limit))"
    ),
    "w04-bubble-sort": (
        "line = '87,45,120,63,92'\n"
        "values = [float(value) for value in line.split(',')]\n"
        "visualize_array(values)\n\n"
        "for i in range(len(values) - 1):\n"
        "    for j in range(len(values) - 1 - i):\n"
        "        if values[j] > values[j + 1]:\n"
        "            values[j], values[j + 1] = values[j + 1], values[j]\n"
        "            swap_elements(j, j + 1)\n"
        "    mark_sorted(len(values) - 1 - i)\n"
        "mark_sorted(0)\n\n"
        "print([int(value) for value in values])"
    ),
    "w05-init-attribute": (
        "class Record:\n"
        "    def __init__(self, label, value, limit):\n"
        "        self.label = label\n"
        "        self.value = value\n"
        "        self.limit = limit\n\n"
        "r = Record('R-001', 87.0, 100.0)\n"
        "print(r.label, r.value, r.limit)"
    ),
    "w05-method-status": (
        "class Record:\n"
        "    def __init__(self, label, value, limit):\n"
        "        self.label = label\n"
        "        self.value = value\n"
        "        self.limit = limit\n\n"
        "    def percent(self):\n"
        "        return (self.value / self.limit) * 100\n\n"
        "    def status(self):\n"
        "        p = self.percent()\n"
        "        if p >= 100:\n"
        "            return 'OVER LIMIT'\n"
        "        elif p >= 90:\n"
        "            return 'WARNING'\n"
        "        return 'OK'\n\n"
        "r_over = Record('R-001', 120.0, 100.0)\n"
        "r_warn = Record('R-002', 95.0, 100.0)\n"
        "r_ok = Record('R-003', 80.0, 100.0)\n"
        "print(r_over.status(), '|', r_warn.status(), '|', r_ok.status())"
    ),
    "w05-stack-push": (
        "class Record:\n"
        "    def __init__(self, label, value, limit):\n"
        "        self.label = label\n"
        "        self.value = value\n"
        "        self.limit = limit\n\n"
        "    def percent(self):\n"
        "        return (self.value / self.limit) * 100\n\n"
        "    def status(self):\n"
        "        p = self.percent()\n"
        "        if p >= 100:\n"
        "            return 'OVER LIMIT'\n"
        "        if p >= 90:\n"
        "            return 'WARNING'\n"
        "        return 'OK'\n\n"
        "class Stack:\n"
        "    def __init__(self):\n"
        "        self.items = []\n\n"
        "    def push(self, value):\n"
        "        self.items.append(value)\n\n"
        "    def pop(self):\n"
        "        return self.items.pop()\n\n"
        "records = [\n"
        "    Record('R-001', 87.0, 100.0),\n"
        "    Record('R-002', 95.0, 100.0),\n"
        "    Record('R-003', 120.0, 100.0),\n"
        "]\n"
        "stack = Stack()\n\n"
        "for record in records:\n"
        "    status = record.status()\n"
        "    stack.push(status)\n"
        "    stack_push(status)\n\n"
        "print(stack.items)\n"
        "top = stack.pop()\n"
        "stack_pop()\n"
        "print(top)"
    ),
    "w05-class-counter": (
        "class Checker:\n"
        "    over_limit_count = 0\n\n"
        "    def check(self, value, limit):\n"
        "        if value > limit:\n"
        "            Checker.over_limit_count += 1\n\n"
        "c = Checker()\n"
        "c.check(120, 100)\n"
        "c.check(87, 100)\n"
        "c.check(150, 100)\n"
        "print(Checker.over_limit_count)"
    ),
    "w06-dtype-arithmetic": (
        "import pandas as pd\n"
        "readings = pd.DataFrame(dict(count=['12', '45', '8'], limit=[50, 50, 50]))\n"
        "readings['count'] = readings['count'].astype(float)\n"
        "readings['percent'] = (readings['count'] / readings['limit']) * 100\n"
        "print(readings['percent'].iloc[0])"
    ),
    "w06-filter-percent": (
        "import pandas as pd\n"
        "servers = pd.DataFrame(dict(hostname=['srv-01', 'srv-03', 'srv-05'], percent=[87, 120, 101]))\n"
        "over = servers['percent'] >= 100\n"
        "print(len(servers[over]))"
    ),
    "w06-scene-filter": (
        "import pandas as pd\n"
        "servers = pd.DataFrame(dict(host=['srv-01', 'srv-02', 'srv-03', 'srv-04'], status=['OK', 'OVER LIMIT', 'WARNING', 'OVER LIMIT']))\n"
        "visualize_dataframe(servers.to_dict('records'))\n"
        "over = servers['status'] == 'OVER LIMIT'\n"
        "kept = servers[over]\n"
        "filter_rows(kept.index.tolist())\n"
        "print(len(kept))"
    ),
    "w06-apply-classify": (
        "import pandas as pd\n"
        "servers = pd.DataFrame(dict(hostname=['srv-01', 'srv-03', 'srv-05'], percent=[87, 120, 101]))\n\n"
        "def classify(percent):\n"
        "    if percent >= 100:\n"
        "        return 'OVER LIMIT'\n"
        "    elif percent >= 90:\n"
        "        return 'WARNING'\n"
        "    else:\n"
        "        return 'OK'\n\n"
        "servers['status'] = servers['percent'].apply(classify)\n"
        "print(servers['status'].iloc[0], servers['status'].iloc[1], servers['status'].iloc[2])"
    ),
    "w07-strip-normalise": (
        "raw = '  SRV-01  '\n"
        "clean = raw.strip().lower()\n"
        "print(clean)"
    ),
    "w07-maxsplit-record": (
        "record = 'srv-01,used=87,total=100'\n"
        "hostname, rest = record.split(',', 1)\n"
        "print(hostname, '|', rest)"
    ),
    "w07-pipeline-first-steps": (
        "raw_line = '  Srv-01 , used=87 , total=100  '\n"
        "line = raw_line.strip()\n"
        "hostname_part, rest = line.split(',', 1)\n"
        "print(hostname_part.strip().lower(), '|', rest)"
    ),
    "w08-get-fallback": (
        "data = dict(login='python', public_repos=160)\n"
        "repo_count = data.get('repo_count', 'unknown')\n"
        "print(repo_count)"
    ),
    "w08-stringio-rows": (
        "import pandas as pd\n"
        "from io import StringIO\n"
        "csv_text = 'name,used\\na,87\\nb,120'\n"
        "df = pd.read_csv(StringIO(csv_text))\n"
        "print(len(df))"
    ),
    "w08-regex-redact": (
        "import re\n"
        "text = 'Server IP: 192.168.0.10, DNS: 8.8.8.8'\n"
        "redacted = re.sub(r'\\d+\\.\\d+\\.\\d+\\.\\d+', '[REDACTED]', text)\n"
        "print(redacted)"
    ),
    "w09-hash-verify": (
        "import hashlib\n"
        "typed = 'password123'\n"
        "stored_hash = hashlib.sha256(b'password123').hexdigest()\n"
        "match = hashlib.sha256(typed.encode())\n"
        "print(match.hexdigest() == stored_hash)"
    ),
    "w09-store-split": (
        "line = 'alice,9f8e7d6c5b4a39281726354453627180$4a1b2c3d4e5f60718293a4b5c6d7e8f9'\n"
        "username, stored_cred = line.strip().split(',', 1)\n"
        "print(username, '$' in stored_cred)"
    ),
    "w09-env-read": (
        "import os\n\n"
        "def require_env(name: str) -> str:\n"
        "    value = os.environ.get(name)\n"
        "    if not value:\n"
        "        raise RuntimeError(f'{name} is missing')\n"
        "    return value\n\n"
        "os.environ['OPS_API_KEY'] = 'live_key_99'\n"
        "api_key = require_env('OPS_API_KEY')\n"
        "print('OPS_API_KEY loaded:', len(api_key), 'chars')\n"
        "os.environ.pop('OPS_API_KEY', None)\n"
        "try:\n"
        "    require_env('OPS_API_KEY')\n"
        "    print('accepted')\n"
        "except RuntimeError:\n"
        "    print('rejected')"
    ),
    "w10-one-item-tuple": (
        "import sqlite3\n\n"
        "conn = sqlite3.connect(':memory:')\n"
        "conn.execute('CREATE TABLE devices (name TEXT, ip TEXT)')\n"
        "conn.execute('INSERT INTO devices VALUES (?, ?)', ('AP-Lobby', '10.0.0.10'))\n\n"
        "name = 'AP-Lobby'\n"
        "sql = 'SELECT ip FROM devices WHERE name = ?'\n"
        "params = (name,)\n"
        "print(conn.execute(sql, params).fetchall())"
    ),
    "w10-parameterise-the-filter": (
        "import sqlite3\n\n"
        "conn = sqlite3.connect(':memory:')\n"
        "conn.execute('CREATE TABLE devices (name TEXT, ip TEXT)')\n"
        "conn.executemany('INSERT INTO devices VALUES (?, ?)', [('AP-Lobby', '10.0.0.10'), ('Core-Router', '10.0.0.1')])\n\n"
        "hostile_name = \"AP-Lobby' OR '1'='1\"\n"
        "rows = conn.execute('SELECT ip FROM devices WHERE name = ?', (hostile_name,)).fetchall()\n"
        "print(rows)"
    ),
    "w11-session-state-counter": (
        "state = {}\n\n"
        "def run_once(state, clicked):\n"
        "    if 'scans' not in state:\n"
        "        state['scans'] = 0\n"
        "    if clicked:\n"
        "        state['scans'] += 1\n\n"
        "for clicked in (False, True, True, True):\n"
        "    run_once(state, clicked)\n"
        "print('Total:', state['scans'])"
    ),
    "w11-options-from-data": (
        "regions = ['eu', 'us', 'eu', 'apac']\n"
        "options = ['all'] + sorted(set(regions))\n"
        "print(options)"
    ),
    "w12-resend-history": (
        "history = [{'role': 'system', 'content': 'You are a concise ops assistant.'}]\n"
        "def turn(user_text, reply):\n"
        "    history.append({'role': 'user', 'content': user_text})\n"
        "    history.append({'role': 'assistant', 'content': reply})\n"
        "turn('2+2?', '4')\n"
        "print(len(history), [m['role'] for m in history])"
    ),
    "w12-threshold-edge": (
        "def status_of(n, warning_at=50, limit=100):\n"
        "    if n >= limit:\n"
        "        return 'OVER LIMIT'\n"
        "    return 'WARNING' if n >= warning_at else 'OK'\n\n"
        "def test_status_boundaries():\n"
        "    assert status_of(49) == 'OK'\n"
        "    assert status_of(50) == 'WARNING'\n"
        "    assert status_of(99) == 'WARNING'\n"
        "    assert status_of(100) == 'OVER LIMIT'\n\n"
        "test_status_boundaries()\n"
        "print(status_of(49), status_of(50), status_of(99), status_of(100))"
    ),
    "w13-pathlib-parts": (
        "from pathlib import Path\n"
        "p = Path('/var/log/ops/srv-07.log')\n"
        "print(p.stem, p.suffix)"
    ),
    "w13-argparse-flags": (
        "import argparse\n"
        "parser = argparse.ArgumentParser()\n"
        "parser.add_argument('--limit', type=int, default=100)\n"
        "parser.add_argument('--verbose', action='store_true', default=False)\n"
        "args = parser.parse_args(['--limit', '90', '--verbose'])\n"
        "print(type(args.limit).__name__, args.limit, args.verbose)"
    ),
    "w13-exit-code-contract": (
        "def main(percents):\n"
        "    over = [p for p in percents if p >= 100]\n"
        "    for p in over:\n"
        "        print(f'ALERT: {p}%')\n"
        "    return 1 if over else 0\n\n"
        "print('code:', main([85, 102, 91]))\n"
        "print('code:', main([70, 88]))"
    ),
    "w14-type-contract": (
        "def parse_percent(raw: str | None) -> float:\n"
        "    if raw is None:\n"
        "        return 0.0\n"
        "    return float(raw.rstrip('%'))\n\n"
        "print(parse_percent('92.5%'), parse_percent(None))"
    ),
    "w14-default-factory": (
        "from dataclasses import dataclass, field\n\n"
        "@dataclass\n"
        "class AlertBatch:\n"
        "    region: str\n"
        "    hosts: list[str] = field(default_factory=list)\n\n"
        "b1 = AlertBatch('eu')\n"
        "b2 = AlertBatch('us')\n"
        "b1.hosts.append('srv-01')\n"
        "b2.hosts.append('srv-09')\n"
        "print(b1.hosts, b2.hosts)"
    ),
    "w14-post-init-guard": (
        "from dataclasses import dataclass\n\n"
        "@dataclass\n"
        "class HostReading:\n"
        "    hostname: str\n"
        "    used_gb: float\n"
        "    limit_gb: float = 100.0\n\n"
        "    def __post_init__(self):\n"
        "        self.hostname = self.hostname.strip().lower()\n"
        "        if self.limit_gb <= 0:\n"
        "            raise ValueError('limit_gb must be positive')\n\n"
        "ok = HostReading('  SRV-01 ', 50.0, 100.0)\n"
        "try:\n"
        "    HostReading('srv-01', 50.0, 0.0)\n"
        "    guard = 'accepted'\n"
        "except ValueError:\n"
        "    guard = 'rejected zero limit'\n"
        "print(ok.hostname, '|', guard)"
    ),
    "w14-quarantine-batch": (
        "raw_rows = [('srv-01', 80), ('', 95), ('srv-02', -5), ('srv-03', 100)]\n"
        "clean = []\n"
        "errors = 0\n"
        "for host, pct in raw_rows:\n"
        "    if host and (0 <= pct <= 100):\n"
        "        clean.append((host, pct))\n"
        "    else:\n"
        "        errors += 1\n"
        "print(len(clean), errors)"
    ),
    "w15-route-lookup": (
        "import asyncio\n"
        "import httpx\n"
        "from fastapi import FastAPI, HTTPException\n"
        "from httpx import ASGITransport, AsyncClient\n"
        "\n"
        "app = FastAPI()\n"
        "FLEET = {'srv-01': {'percent': 87.0}, 'srv-02': {'percent': 104.5}}\n"
        "\n"
        "@app.get('/hosts/{hostname}')\n"
        "async def get_host(hostname: str) -> dict:\n"
        "    key = hostname.strip().lower()\n"
        "    if key not in FLEET:\n"
        "        raise HTTPException(status_code=404, detail='Host not found')\n"
        "    record = FLEET[key]\n"
        "    return {'hostname': key, 'status': 'OVER LIMIT' if record['percent'] >= 100 else 'OK'}\n"
        "\n"
        "async def main() -> None:\n"
        "    transport = ASGITransport(app=app)\n"
        "    async with AsyncClient(transport=transport, base_url='http://test') as client:\n"
        "        ok = await client.get('/hosts/SRV-01')\n"
        "        missing = await client.get('/hosts/srv-99')\n"
        "    assert ok.status_code == 200\n"
        "    assert missing.status_code == 404\n"
        "    print(ok.status_code, ok.json())\n"
        "    print(missing.status_code, missing.json())\n"
        "\n"
        "asyncio.run(main())"
    ),
    "w15-query-filter": (
        "sample = [\n"
        "    {'hostname': 'srv-01', 'region': 'eu', 'percent': 87.0},\n"
        "    {'hostname': 'srv-02', 'region': 'eu', 'percent': 102.0},\n"
        "    {'hostname': 'srv-03', 'region': 'us', 'percent': 95.0},\n"
        "]\n"
        "def filter_hosts(rows, region=None, min_pct=0.0):\n"
        "    result = [r for r in rows if r['percent'] >= min_pct]\n"
        "    if region is not None:\n"
        "        result = [r for r in result if r['region'] == region]\n"
        "    return result\n\n"
        "print([r['hostname'] for r in filter_hosts(sample, region='eu', min_pct=90.0)])"
    ),
    "w15-http-status-dispatch": (
        "import asyncio\n"
        "import httpx\n"
        "from fastapi import FastAPI, HTTPException\n"
        "from httpx import ASGITransport, AsyncClient\n"
        "from pydantic import BaseModel, Field\n"
        "\n"
        "app = FastAPI()\n"
        "STORE = {}\n"
        "\n"
        "class ReadingIn(BaseModel):\n"
        "    hostname: str\n"
        "    percent: float = Field(ge=0)\n"
        "\n"
        "@app.post('/readings', status_code=201)\n"
        "async def create_reading(payload: ReadingIn) -> dict:\n"
        "    host = payload.hostname.strip().lower()\n"
        "    if not host:\n"
        "        raise HTTPException(status_code=422, detail='hostname required')\n"
        "    STORE[host] = {'hostname': host, 'percent': float(payload.percent)}\n"
        "    return STORE[host]\n"
        "\n"
        "async def main() -> None:\n"
        "    async with AsyncClient(transport=ASGITransport(app=app), base_url='http://test') as client:\n"
        "        bad = await client.post('/readings', json={'hostname': '', 'percent': 88})\n"
        "        good = await client.post('/readings', json={'hostname': 'srv-01', 'percent': 88})\n"
        "    assert bad.status_code == 422\n"
        "    assert good.status_code == 201\n"
        "    print(bad.status_code, good.status_code, good.json())\n"
        "\n"
        "asyncio.run(main())"
    ),
    "w16-await-coroutine": (
        "import asyncio\n\n"
        "async def fetch_status(host: str) -> str:\n"
        "    await asyncio.sleep(0.01)\n"
        "    return f'{host}: READY'\n\n"
        "async def main() -> None:\n"
        "    \"\"\"Fetch the status for 'srv-01' and print the resolved string.\"\"\"\n"
        "    status = await fetch_status('srv-01')\n"
        "    print(status)\n\n"
        "asyncio.run(main())"
    ),
    "w16-gather-order": (
        "import asyncio\n\n"
        "async def fetch_pct(host: str, pct: float) -> tuple[str, float]:\n"
        "    await asyncio.sleep(0.01)\n"
        "    return (host, pct)\n\n"
        "async def sweep_all(inputs: list[tuple[str, float]]) -> list[tuple[str, float]]:\n"
        "    \"\"\"Run fetch_pct concurrently for all (host, pct) pairs and return the results in input order.\"\"\"\n"
        "    return list(await asyncio.gather(*(fetch_pct(h, p) for h, p in inputs)))\n\n"
        "inputs = [('srv-01', 82.0), ('srv-02', 99.5), ('srv-03', 71.0)]\n"
        "print(asyncio.run(sweep_all(inputs)))"
    ),
    "w16-gather-wallclock": (
        "import asyncio\n"
        "import time\n\n"
        "HOSTS = [('srv-01', 82.0), ('srv-02', 99.5), ('srv-03', 71.0), ('srv-04', 64.0), ('srv-05', 88.0), ('srv-06', 55.0)]\n\n"
        "async def fetch_pct(host: str, pct: float) -> tuple[str, float]:\n"
        "    await asyncio.sleep(0.05)\n"
        "    return (host, pct)\n\n"
        "async def sweep_sequential(hosts: list[tuple[str, float]]) -> list[tuple[str, float]]:\n"
        "    results = []\n"
        "    for host, pct in hosts:\n"
        "        results.append(await fetch_pct(host, pct))\n"
        "    return results\n\n"
        "async def sweep_concurrent(hosts: list[tuple[str, float]]) -> list[tuple[str, float]]:\n"
        "    \"\"\"Return fetch_pct results for every host from a single asyncio.gather call.\"\"\"\n"
        "    return list(await asyncio.gather(*(fetch_pct(h, p) for h, p in hosts)))\n\n"
        "async def main() -> None:\n"
        "    start = time.perf_counter()\n"
        "    await sweep_sequential(HOSTS)\n"
        "    sequential = time.perf_counter() - start\n"
        "    start = time.perf_counter()\n"
        "    results = await sweep_concurrent(HOSTS)\n"
        "    concurrent = time.perf_counter() - start\n"
        "    print(len(results), concurrent < sequential, concurrent > 0.02)\n\n"
        "asyncio.run(main())"
    ),
    "w16-scene-gather": (
        "import asyncio\n\n"
        "HOSTS = [('srv-01', 82.0), ('srv-02', 99.5), ('srv-03', 71.0)]\n\n"
        "async def run_host(host: str, lane: int) -> str:\n"
        "    launch_task(host, lane)\n"
        "    await asyncio.sleep(0.25 + lane * 0.1)\n"
        "    pause_task(host)\n"
        "    await asyncio.sleep(0.25)\n"
        "    finish_task(host)\n"
        "    return host\n\n"
        "async def main() -> list[str]:\n"
        "    \"\"\"Gather one run_host coroutine per host and preserve input order.\"\"\"\n"
        "    start_switchyard()\n"
        "    return list(await asyncio.gather(*(run_host(host, lane) for lane, (host, _pct) in enumerate(HOSTS))))\n\n"
        "print(asyncio.run(main()))"
    ),
    "w16-return-exceptions": (
        "import asyncio\n\n"
        "async def check(host: str) -> str:\n"
        "    if host == 'srv-down':\n"
        "        raise ConnectionError('unreachable')\n"
        "    return f'{host}: UP'\n\n"
        "async def collect_healthy(hosts: list[str]) -> list[str]:\n"
        "    \"\"\"Probe all hosts concurrently without aborting on connection errors; return only non-Exception results.\"\"\"\n"
        "    results = await asyncio.gather(*(check(h) for h in hosts), return_exceptions=True)\n"
        "    return [r for r in results if not isinstance(r, Exception)]\n\n"
        "print(asyncio.run(collect_healthy(['srv-01', 'srv-down', 'srv-02'])))"
    ),
    "w16-semaphore-peak": (
        "import asyncio\n\n"
        "active = 0\n"
        "peak = 0\n\n"
        "async def step() -> None:\n"
        "    global active, peak\n"
        "    active += 1\n"
        "    peak = max(peak, active)\n"
        "    await asyncio.sleep(0.01)\n"
        "    active -= 1\n\n"
        "async def worker(sem: asyncio.Semaphore) -> None:\n"
        "    \"\"\"Execute step() while holding the concurrency slot in sem.\"\"\"\n"
        "    async with sem:\n"
        "        await step()\n\n"
        "async def main() -> None:\n"
        "    sem = asyncio.Semaphore(2)\n"
        "    await asyncio.gather(*(worker(sem) for _ in range(6)))\n"
        "    print('Peak:', peak)\n\n"
        "asyncio.run(main())"
    ),
    "w17-yield-over-limit": (
        "def over_limit_hosts(records: list[tuple[str, float]], limit: float = 100.0):\n"
        "    \"\"\"Lazily yield each host from (host, pct) records where pct >= limit.\"\"\"\n"
        "    for host, pct in records:\n"
        "        if pct >= limit:\n"
        "            yield host\n\n"
        "data = [('srv-01', 85.0), ('srv-02', 104.0), ('srv-03', 110.0)]\n"
        "print(list(over_limit_hosts(data)))"
    ),
    "w17-exhausted-generator": (
        "def count_and_peak(readings: list[float], limit: float = 100.0) -> tuple[int, float]:\n"
        "    \"\"\"Return (count, max_reading) for readings >= limit using generator expressions without exhausting a single generator twice.\"\"\"\n"
        "    count = sum(1 for r in readings if r >= limit)\n"
        "    peak = max((r for r in readings if r >= limit), default=0.0)\n"
        "    return count, peak\n\n"
        "readings = [85.0, 102.0, 110.0, 90.0]\n"
        "print(*count_and_peak(readings))"
    ),
    "w17-islice-preview": (
        "import itertools\n\n"
        "def infinite_ids(start: int = 1):\n"
        "    n = start\n"
        "    while True:\n"
        "        yield f'INC-{n:03d}'\n"
        "        n += 1\n\n"
        "def take_ids(stream, count: int) -> list[str]:\n"
        "    \"\"\"Return a list of the first `count` items from `stream` without exhausting an infinite iterator.\"\"\"\n"
        "    return list(itertools.islice(stream, count))\n\n"
        "print(take_ids(infinite_ids(), 3))"
    ),
    "w17-jsonl-generator": (
        "import json\n\n"
        "lines = [\n"
        "    '{\"host\": \"srv-01\", \"ok\": true}',\n"
        "    '{\"host\": \"srv-02\", \"ok\": false}',\n"
        "    '{\"host\": \"srv-03\", \"ok\": false}',\n"
        "]\n\n"
        "def failed_hosts(raw_lines: list[str]):\n"
        "    \"\"\"Parse each JSON line and lazily yield the 'host' value when 'ok' is False.\"\"\"\n"
        "    for line in raw_lines:\n"
        "        row = json.loads(line)\n"
        "        if not row['ok']:\n"
        "            yield row['host']\n\n"
        "print(list(failed_hosts(lines)))"
    ),
    "w18-basic-decorator": (
        "import functools\n\n"
        "def clamp_percent(func):\n"
        "    \"\"\"Decorator that preserves func metadata and caps its float return value at 100.0.\"\"\"\n"
        "    @functools.wraps(func)\n"
        "    def wrapper(*args, **kwargs):\n"
        "        return min(func(*args, **kwargs), 100.0)\n"
        "    return wrapper\n\n"
        "@clamp_percent\n"
        "def raw_pct(used: float, limit: float) -> float:\n"
        "    return (used / limit) * 100\n\n"
        "print(raw_pct(125, 100), raw_pct(80, 100))"
    ),
    "w18-retry-counter": (
        "import functools\n\n"
        "def retry(attempts: int = 3):\n"
        "    \"\"\"Decorator factory that retries `func` up to `attempts` times on ConnectionError before re-raising.\"\"\"\n"
        "    def decorator(func):\n"
        "        @functools.wraps(func)\n"
        "        def wrapper(*args, **kwargs):\n"
        "            last_exc = None\n"
        "            for _ in range(attempts):\n"
        "                try:\n"
        "                    return func(*args, **kwargs)\n"
        "                except ConnectionError as exc:\n"
        "                    last_exc = exc\n"
        "            raise last_exc\n"
        "        return wrapper\n"
        "    return decorator\n\n"
        "tries = 0\n\n"
        "@retry(attempts=3)\n"
        "def fetch(host: str) -> str:\n"
        "    global tries\n"
        "    tries += 1\n"
        "    if tries < 3:\n"
        "        raise ConnectionError('link flap')\n"
        "    return f'{host}:OK'\n\n"
        "print(fetch('srv-07'), fetch.__name__, tries)"
    ),
    "w18-contextmanager-cleanup": (
        "from contextlib import contextmanager\n\n"
        "locks: set[str] = set()\n\n"
        "@contextmanager\n"
        "def host_lock(hostname: str):\n"
        "    \"\"\"Acquire `hostname` in `locks`, yield `hostname`, and guarantee removal from `locks` on exit.\"\"\"\n"
        "    locks.add(hostname)\n"
        "    try:\n"
        "        yield hostname\n"
        "    finally:\n"
        "        locks.remove(hostname)\n\n"
        "try:\n"
        "    with host_lock('srv-01'):\n"
        "        raise ValueError('deploy failed')\n"
        "except ValueError:\n"
        "    pass\n"
        "print('Remaining locks:', len(locks))"
    ),
    "w18-lru-cache-hits": (
        "from functools import lru_cache\n\n"
        "runs = 0\n\n"
        "@lru_cache\n"
        "def parse_tag(raw: str) -> str:\n"
        "    \"\"\"Normalize `raw` tag (strip and lowercase) with memoization across repeated calls.\"\"\"\n"
        "    global runs\n"
        "    runs += 1\n"
        "    return raw.strip().lower()\n\n"
        "for tag in ['EU', 'US', 'EU', 'EU', 'US']:\n"
        "    parse_tag(tag)\n"
        "print('runs:', runs)"
    ),
    "w19-logger-level": (
        "import io\n"
        "import logging\n\n"
        "def configure_logger(buf: io.StringIO) -> logging.Logger:\n"
        "    \"\"\"Return a logger bound to `buf` formatted as '%(levelname)s:%(message)s' that records WARNING and above.\"\"\"\n"
        "    log = logging.getLogger('test_lvl')\n"
        "    handler = logging.StreamHandler(buf)\n"
        "    handler.setFormatter(logging.Formatter('%(levelname)s:%(message)s'))\n"
        "    log.handlers = [handler]\n"
        "    log.setLevel(logging.WARNING)\n"
        "    return log\n\n"
        "buf = io.StringIO()\n"
        "log = configure_logger(buf)\n"
        "log.info('routine check')\n"
        "log.warning('disk at 92%')\n"
        "log.error('disk full')\n"
        "print(buf.getvalue().strip())"
    ),
    "w19-redact-structured-log": (
        "import json\n\n"
        "SENSITIVE = {'password', 'api_key', 'token'}\n\n"
        "def safe_json_log(event: str, data: dict) -> str:\n"
        "    \"\"\"Return a sorted-key JSON string with 'event' and `data` fields, redacting any SENSITIVE key to '[REDACTED]'.\"\"\"\n"
        "    clean = {k: ('[REDACTED]' if k in SENSITIVE else v) for k, v in data.items()}\n"
        "    return json.dumps({'event': event, **clean}, sort_keys=True)\n\n"
        "print(safe_json_log('auth_attempt', {'user': 'alice', 'password': 'secret'}))"
    ),
    "w19-contextvar-trace": (
        "from contextvars import ContextVar\n\n"
        "trace_id: ContextVar[str] = ContextVar('trace_id', default='none')\n\n"
        "def record_action(action: str) -> str:\n"
        "    return f'{trace_id.get()}:{action}'\n\n"
        "def run_with_trace(tid: str, action: str) -> str:\n"
        "    \"\"\"Bind `trace_id` to `tid` while calling `record_action(action)`, then always reset `trace_id` to its prior state.\"\"\"\n"
        "    token = trace_id.set(tid)\n"
        "    try:\n"
        "        return record_action(action)\n"
        "    finally:\n"
        "        trace_id.reset(token)\n\n"
        "print(run_with_trace('tr-88', 'scan'), record_action('idle'))"
    ),
    "w20-fifo-queue": (
        "import queue\n\n"
        "def drain_queue(q: queue.Queue) -> list[str]:\n"
        "    \"\"\"Pull all items from `q` in FIFO order, mark each task done, and return them as a list.\"\"\"\n"
        "    items: list[str] = []\n"
        "    while not q.empty():\n"
        "        items.append(q.get())\n"
        "        q.task_done()\n"
        "    return items\n\n"
        "q: queue.Queue[str] = queue.Queue()\n"
        "for host in ['srv-01', 'srv-02', 'srv-03']:\n"
        "    q.put(host)\n"
        "print(drain_queue(q))"
    ),
    "w20-idempotent-sql": (
        "import sqlite3\n\n"
        "conn = sqlite3.connect(':memory:')\n"
        "conn.execute('CREATE TABLE processed_jobs (job_id TEXT PRIMARY KEY, host TEXT)')\n\n"
        "def run_job(job_id: str, host: str) -> bool:\n"
        "    \"\"\"Record (job_id, host) idempotently in processed_jobs; return True on first execution and False on duplicates.\"\"\"\n"
        "    cur = conn.execute('INSERT OR IGNORE INTO processed_jobs VALUES (?, ?)', (job_id, host))\n"
        "    return cur.rowcount == 1\n\n"
        "print(run_job('j-1', 'srv-01'), run_job('j-1', 'srv-01'))"
    ),
    "w20-dlq-routing": (
        "def route_failures(items: list[dict], max_attempts: int = 3) -> tuple[list[str], list[str]]:\n"
        "    \"\"\"For invalid items, route ids with attempts >= max_attempts to dlq; otherwise increment attempts and route to retry_q.\"\"\"\n"
        "    retry_q: list[str] = []\n"
        "    dlq: list[str] = []\n"
        "    for item in items:\n"
        "        if not item['valid']:\n"
        "            if item['attempts'] >= max_attempts:\n"
        "                dlq.append(item['id'])\n"
        "            else:\n"
        "                item['attempts'] += 1\n"
        "                retry_q.append(item['id'])\n"
        "    return retry_q, dlq\n\n"
        "queue_items = [\n"
        "    {'id': 'j1', 'attempts': 1, 'valid': True},\n"
        "    {'id': 'j2', 'attempts': 3, 'valid': False},\n"
        "    {'id': 'j3', 'attempts': 1, 'valid': False},\n"
        "]\n"
        "retry_ids, dlq_ids = route_failures(queue_items)\n"
        "print(retry_ids, dlq_ids)"
    ),
    "w20-capped-backoff": (
        "def backoff_seconds(attempt: int, base: float = 1.0, cap: float = 8.0) -> float:\n"
        "    \"\"\"Return exponential backoff delay for 1-indexed `attempt` starting at `base` and capped at `cap`.\"\"\"\n"
        "    return min(cap, base * (2 ** (attempt - 1)))\n\n"
        "print([backoff_seconds(i) for i in range(1, 6)])"
    ),
    "w21-explain-index": (
        "import sqlite3\n\n"
        "def ensure_region_index(conn: sqlite3.Connection) -> None:\n"
        "    \"\"\"Create a B-tree index on alerts(region) so region lookups avoid a full table scan.\"\"\"\n"
        "    conn.execute('CREATE INDEX IF NOT EXISTS idx_alerts_region ON alerts(region)')\n\n"
        "conn = sqlite3.connect(':memory:')\n"
        "conn.execute('CREATE TABLE alerts (id INTEGER PRIMARY KEY, region TEXT, host TEXT)')\n"
        "ensure_region_index(conn)\n"
        "plan = conn.execute('EXPLAIN QUERY PLAN SELECT host FROM alerts WHERE region = ?', ('eu',)).fetchall()\n"
        "print('INDEX' in plan[0][-1])"
    ),
    "w21-atomic-transfer": (
        "import sqlite3\n\n"
        "conn = sqlite3.connect(':memory:')\n"
        "conn.execute('CREATE TABLE quotas (team TEXT PRIMARY KEY, credits INTEGER CHECK(credits >= 0))')\n"
        "conn.executemany('INSERT INTO quotas VALUES (?, ?)', [('ops', 10), ('dev', 5)])\n"
        "conn.commit()\n\n"
        "def transfer(conn: sqlite3.Connection, src: str, dst: str, amount: int) -> None:\n"
        "    \"\"\"Atomically add `amount` credits to `dst` and deduct `amount` from `src`, rolling back both on IntegrityError.\"\"\"\n"
        "    try:\n"
        "        with conn:\n"
        "            conn.execute('UPDATE quotas SET credits = credits + ? WHERE team = ?', (amount, dst))\n"
        "            conn.execute('UPDATE quotas SET credits = credits - ? WHERE team = ?', (amount, src))\n"
        "    except sqlite3.IntegrityError:\n"
        "        pass\n\n"
        "transfer(conn, 'ops', 'dev', 50)\n"
        "print(conn.execute('SELECT team, credits FROM quotas ORDER BY team').fetchall())"
    ),
    "w21-left-join-counts": (
        "import sqlite3\n\n"
        "def incident_counts_by_host(conn: sqlite3.Connection) -> list[tuple[str, int]]:\n"
        "    \"\"\"Return (host_name, incident_count) for every host in `hosts`, including hosts with 0 incidents, ordered by name.\"\"\"\n"
        "    sql = '''\n"
        "    SELECT h.name, COUNT(i.host_name)\n"
        "    FROM hosts h\n"
        "    LEFT JOIN incidents i ON i.host_name = h.name\n"
        "    GROUP BY h.name\n"
        "    ORDER BY h.name\n"
        "    '''\n"
        "    return conn.execute(sql).fetchall()\n\n"
        "conn = sqlite3.connect(':memory:')\n"
        "conn.execute('CREATE TABLE hosts (name TEXT PRIMARY KEY)')\n"
        "conn.execute('CREATE TABLE incidents (host_name TEXT)')\n"
        "conn.executemany('INSERT INTO hosts VALUES (?)', [('srv-01',), ('srv-02',)])\n"
        "conn.executemany('INSERT INTO incidents VALUES (?)', [('srv-01',), ('srv-01',)])\n"
        "print(incident_counts_by_host(conn))"
    ),
    "w22-constant-time-check": (
        "import hmac\n\n"
        "def verify_bearer(header: str, expected_token: str) -> bool:\n"
        "    \"\"\"Extract the token after 'Bearer ' and verify it matches `expected_token` in constant time.\"\"\"\n"
        "    if not header.startswith('Bearer '):\n"
        "        return False\n"
        "    candidate = header.removeprefix('Bearer ').strip()\n"
        "    return hmac.compare_digest(candidate, expected_token)\n\n"
        "print(verify_bearer('Bearer tok_123', 'tok_123'), verify_bearer('Bearer wrong', 'tok_123'))"
    ),
    "w22-hmac-tamper": (
        "import hashlib\n"
        "import hmac\n\n"
        "def sign_webhook(secret: str, timestamp: int, body: str) -> str:\n"
        "    msg = f'{timestamp}.{body}'.encode('utf-8')\n"
        "    return hmac.new(secret.encode('utf-8'), msg, hashlib.sha256).hexdigest()\n\n"
        "def verify_webhook(\n"
        "    secret: str, timestamp: int, body: str, signature: str, now: int, max_skew: int = 300\n"
        ") -> bool:\n"
        "    \"\"\"Verify that `timestamp` is within [now - max_skew, now] and `signature` matches the HMAC-SHA256 digest.\"\"\"\n"
        "    if not (0 <= now - timestamp <= max_skew):\n"
        "        return False\n"
        "    expected = sign_webhook(secret, timestamp, body)\n"
        "    return hmac.compare_digest(expected, signature)\n\n"
        "secret = 'whsec_ops_key'\n"
        "body = '{\"host\":\"srv-01\",\"pct\":95}'\n"
        "ts = 1700000000\n"
        "sig = sign_webhook(secret, ts, body)\n"
        "results = [\n"
        "    verify_webhook(secret, ts, body, sig, now=1700000120),\n"
        "    verify_webhook(secret, ts, '{\"host\":\"srv-01\",\"pct\":10}', sig, now=1700000120),\n"
        "    verify_webhook(secret, ts, body, sig, now=1700000900),\n"
        "    verify_webhook(secret, ts + 60, body, sign_webhook(secret, ts + 60, body), now=ts),\n"
        "]\n"
        "print(results)"
    ),
    "w22-fixed-window-limiter": (
        "class TokenBucketLimiter:\n"
        "    def __init__(self, capacity: float, refill_per_sec: float) -> None:\n"
        "        self.capacity = capacity\n"
        "        self.rate = refill_per_sec\n"
        "        self.buckets: dict[str, tuple[float, float]] = {}\n\n"
        "    def allow(self, client_id: str, now: float) -> bool:\n"
        "        \"\"\"Refill client_id's bucket over elapsed time up to capacity; consume 1.0 token and return True if >= 1.0 available.\"\"\"\n"
        "        tokens, last_time = self.buckets.get(client_id, (self.capacity, now))\n"
        "        elapsed = max(0.0, now - last_time)\n"
        "        tokens = min(self.capacity, tokens + elapsed * self.rate)\n"
        "        if tokens < 1.0:\n"
        "            self.buckets[client_id] = (tokens, now)\n"
        "            return False\n"
        "        self.buckets[client_id] = (tokens - 1.0, now)\n"
        "        return True\n\n"
        "limiter = TokenBucketLimiter(capacity=2.0, refill_per_sec=1.0)\n"
        "outcomes = [\n"
        "    limiter.allow('10.0.0.5', now=0.0),\n"
        "    limiter.allow('10.0.0.5', now=0.0),\n"
        "    limiter.allow('10.0.0.5', now=0.2),\n"
        "    limiter.allow('10.0.0.5', now=1.0),\n"
        "]\n"
        "print(outcomes)"
    ),
    "w22-path-jail": (
        "from pathlib import Path\n\n"
        "def is_safe_path(base: str, user_input: str) -> bool:\n"
        "    \"\"\"Resolve `base` and `base / user_input` and return True only if the target remains inside `base`.\"\"\"\n"
        "    root = Path(base).resolve()\n"
        "    target = (root / user_input).resolve()\n"
        "    return target.is_relative_to(root)\n\n"
        "print(is_safe_path('/tmp/reports', 'daily/eu.csv'), is_safe_path('/tmp/reports', '../secrets.env'))"
    ),
    "w23-isolated-fixture": (
        "def make_store() -> dict[str, float]:\n"
        "    return {'srv-01': 85.0}\n\n"
        "def test_one(store: dict[str, float]) -> int:\n"
        "    store['srv-02'] = 102.0\n"
        "    return len(store)\n\n"
        "def test_two(store: dict[str, float]) -> int:\n"
        "    return len(store)\n\n"
        "def run_isolated_suite() -> tuple[int, int]:\n"
        "    \"\"\"Run test_one and test_two against isolated store fixtures and return both lengths.\"\"\"\n"
        "    return test_one(make_store()), test_two(make_store())\n\n"
        "print(*run_isolated_suite())"
    ),
    "w23-assert-raises": (
        "def require_positive(limit: float) -> float:\n"
        "    if limit <= 0:\n"
        "        raise ValueError('limit must be > 0')\n"
        "    return limit\n\n"
        "def check_raises_value_error(fn, arg: float) -> bool:\n"
        "    \"\"\"Call fn(arg); return True only if it raised ValueError, and False if it returned normally.\"\"\"\n"
        "    try:\n"
        "        fn(arg)\n"
        "        return False\n"
        "    except ValueError:\n"
        "        return True\n\n"
        "print(check_raises_value_error(require_positive, -5), check_raises_value_error(require_positive, 10))"
    ),
    "w23-fake-gateway": (
        "class FakeStore:\n"
        "    \"\"\"In-memory fake repository that validates inputs and stores host percentages.\"\"\"\n\n"
        "    def __init__(self) -> None:\n"
        "        self.rows: dict[str, float] = {}\n\n"
        "    def save(self, host: str, pct: float) -> None:\n"
        "        \"\"\"Raise ValueError if host is empty or pct < 0; otherwise store pct under host.\"\"\"\n"
        "        if not host or pct < 0:\n"
        "            raise ValueError('invalid host or pct')\n"
        "        self.rows[host] = pct\n\n"
        "    def get(self, host: str) -> float | None:\n"
        "        \"\"\"Return the stored percentage for host, or None if missing.\"\"\"\n"
        "        return self.rows.get(host)\n\n"
        "store = FakeStore()\n"
        "store.save('srv-07', 98.5)\n"
        "try:\n"
        "    store.save('', -1.0)\n"
        "    rejected = False\n"
        "except ValueError:\n"
        "    rejected = True\n"
        "print(store.get('srv-07'), store.get('missing'), rejected)"
    ),
    "w24-domain-separation": (
        "from dataclasses import dataclass\n\n"
        "@dataclass(frozen=True)\n"
        "class Reading:\n"
        "    host: str\n"
        "    pct: float\n\n"
        "def over_limit_hosts(readings: list[Reading], threshold: float = 100.0) -> list[str]:\n"
        "    \"\"\"Return sorted hostnames for readings with pct >= threshold.\"\"\"\n"
        "    return sorted([r.host for r in readings if r.pct >= threshold])\n\n"
        "sample = [Reading('srv-03', 105.0), Reading('srv-01', 88.0), Reading('srv-02', 100.0)]\n"
        "print(over_limit_hosts(sample))"
    ),
    "w24-entrypoint-parse": (
        "import tomllib\n\n"
        "PYPROJECT_TOML = \"\"\"\n"
        "[project]\n"
        "name = \"ops-console\"\n"
        "version = \"1.2.0\"\n\n"
        "[project.scripts]\n"
        "ops-scan = \"ops_console.cli:main\"\n"
        "ops-worker = \"ops_console.worker:run\"\n"
        "\"\"\"\n\n"
        "def parse_script_entrypoint(raw_toml: str, command: str) -> tuple[str, str]:\n"
        "    \"\"\"Parse `raw_toml` with tomllib.loads and return (package_name, script_target) for `command` under [project.scripts].\"\"\"\n"
        "    data = tomllib.loads(raw_toml)\n"
        "    return data['project']['name'], data['project']['scripts'][command]\n\n"
        "print(parse_script_entrypoint(PYPROJECT_TOML, 'ops-scan'))\n"
        "print(parse_script_entrypoint(PYPROJECT_TOML, 'ops-worker'))"
    ),
    "w24-settings-loader": (
        "def load_port(env: dict[str, str], default: int = 8000) -> int:\n"
        "    \"\"\"Read PORT from `env` (or use `default`), convert to int, and raise ValueError unless 1 <= port <= 65535.\"\"\"\n"
        "    port = int(env.get('PORT', str(default)))\n"
        "    if not (1 <= port <= 65535):\n"
        "        raise ValueError(f'Invalid port: {port}')\n"
        "    return port\n\n"
        "results = []\n"
        "for case in [{'PORT': '9090'}, {}, {'PORT': '0'}, {'PORT': '70000'}]:\n"
        "    try:\n"
        "        results.append(str(load_port(case)))\n"
        "    except ValueError:\n"
        "        results.append('ERR')\n"
        "print(' '.join(results))"
    ),
}


def ast_node_names(code: str) -> set[str]:
    tree = ast.parse(code)
    return {f"ast.{type(node).__name__}" for node in ast.walk(tree)}


# The browser prelude injects the 3D scene API into every run. Plain CPython
# needs no-ops so a scene-driven exercise still executes here.
SCENE_API_STUBS = {
    "stack_push": lambda value: None,
    "stack_pop": lambda: None,
    "visualize_array": lambda values: None,
    "swap_elements": lambda i, j: None,
    "mark_sorted": lambda index: None,
    "visualize_dataframe": lambda rows: None,
    "filter_rows": lambda keep: None,
    "clear_dataframe": lambda: None,
    "start_conveyor": lambda: None,
    "yield_item": lambda label: None,
    "stop_conveyor": lambda: None,
    "start_switchyard": lambda: None,
    "launch_task": lambda task_id, lane_index: None,
    "pause_task": lambda task_id: None,
    "finish_task": lambda task_id: None,
}


def run_code(code: str, filename: str) -> tuple[bool, str, str]:
    buf = io.StringIO()
    err_buf = io.StringIO()
    try:
        with redirect_stdout(buf), redirect_stderr(err_buf):
            exec(compile(code, filename, "exec"), {"__name__": "__main__", **SCENE_API_STUBS})
        return True, buf.getvalue().strip(), ""
    except (Exception, SystemExit) as exc:  # noqa: BLE001
        return False, buf.getvalue().strip(), f"{type(exc).__name__}: {exc}"


def check_manifest(manifest: dict) -> list[str]:
    errors: list[str] = []
    if manifest.get("version") != 1:
        errors.append(f"MANIFEST: expected version 1, got {manifest.get('version')}")
    waypoints = manifest.get("waypoints", [])
    if len(waypoints) != 96:
        errors.append(f"MANIFEST: expected 96 waypoints, got {len(waypoints)}")
    for wp in waypoints:
        if not wp.get("constructs") or not wp.get("tokens"):
            errors.append(f"MANIFEST: waypoint {wp.get('id')} missing constructs or tokens")
    traps = manifest.get("traps", [])
    if len(traps) != 181:
        errors.append(f"MANIFEST: expected 181 traps, got {len(traps)}")
    for tr in traps:
        tb = tr.get("tested_by")
        if tb is None:
            errors.append(f"MANIFEST: trap {tr.get('id')} missing tested_by")
        elif len(tb) == 0:
            if not tr.get("orphan"):
                errors.append(f"MANIFEST: trap {tr.get('id')} has empty tested_by but orphan!=true")
            if not tr.get("rationale"):
                errors.append(f"MANIFEST: orphan trap {tr.get('id')} missing rationale")
        else:
            if tr.get("orphan"):
                errors.append(f"MANIFEST: trap {tr.get('id')} has non-empty tested_by but orphan=true")
    return errors


def lint_exercise(
    eid: str,
    week: int,
    wp_id: str,
    initial_code: str,
    expected_output: str,
    wp_entry: dict,
    check_stage3_fade: bool = True,
    multi_ex_waypoint: bool = False,
) -> list[tuple[str, str, str]]:
    """Return list of (exercise_id, rule_code, message) violations."""
    violations: list[tuple[str, str, str]] = []
    constructs: list[str] = wp_entry["constructs"]
    tokens: list[str] = wp_entry["tokens"]
    sol_code = REFERENCE_SOLUTIONS.get(eid, "")

    # Parse initial_code
    try:
        init_tree = ast.parse(initial_code)
    except SyntaxError as exc:
        violations.append((eid, "SYNTAX_ERROR", f"initialCode SyntaxError: {exc}"))
        return violations

    init_nodes = ast_node_names(initial_code)

    # Rule 1: WAYPOINT_CONSTRUCT_MISMATCH
    # Check if the exercise scaffold contradicts or omits the waypoint's structural setup:
    # (a) If waypoint teaches ListComp (and not For), initialCode must not force a For+.append loop
    if "ast.ListComp" in constructs and "ast.For" not in constructs and "ast.For" in init_nodes:
        violations.append(
            (eid, "RULE_1_WAYPOINT_CONSTRUCT_MISMATCH", f"{wp_id} requires ast.ListComp, but initialCode scaffolds an imperative ast.For loop")
        )
    # (b) If waypoint requires Assert, test function must be scaffolded in initialCode
    if "ast.Assert" in constructs and "ast.Assert" not in init_nodes:
        violations.append(
            (eid, "RULE_1_WAYPOINT_CONSTRUCT_MISMATCH", f"{wp_id} requires ast.Assert boundary tests, but initialCode has no assert statements")
        )
    # (c) Check that structural anchor tokens (module imports, class names, state dicts) required by the waypoint exist in initialCode
    for tok in tokens:
        for anchor in ("session_state", "TokenBucketLimiter", "tomllib"):
            if anchor in tok and anchor not in initial_code:
                violations.append(
                    (eid, "RULE_1_WAYPOINT_CONSTRUCT_MISMATCH", f"{wp_id} target anchor {anchor!r} missing from exercise scaffold")
                )
        if tok.startswith("sum(1 for ") and "def " not in initial_code:
            violations.append(
                (eid, "RULE_1_WAYPOINT_CONSTRUCT_MISMATCH", f"{wp_id} requires generator expression function scaffold, found bare scalar assignment")
            )

    # Rule 2: PRE_SOLVED_TARGET_CONSTRUCT
    # (a) Primary target token already present on a non-comment line when it is the exact solution expression
    non_comment_lines = [
        l for l in initial_code.splitlines() if l.strip() and not l.strip().startswith("#")
    ]
    non_comment_src = "\n".join(non_comment_lines)
    if "field(default_factory=list)" in tokens and "field(default_factory=list)" in non_comment_src:
        violations.append(
            (eid, "RULE_2_PRE_SOLVED_TARGET_CONSTRUCT", "Target construct 'field(default_factory=list)' is already solved in initialCode")
        )
    # (b) In decorator / Fake class waypoints, the # TODO must be inside the decorator or Fake class, not in the caller/test helper
    if wp_id == "w18-wp2":
        # Check where # TODO is located: must be inside the retry decorator factory, not in fetch()
        if "def retry_twice" in initial_code or "# TODO: raise RuntimeError" in initial_code:
            violations.append(
                (eid, "RULE_2_PRE_SOLVED_TARGET_CONSTRUCT", "Retry decorator is pre-solved in initialCode while learner writes the flaky helper")
            )
    if wp_id == "w23-wp3":
        if "self.rows[host] = pct" in non_comment_src and "return self.rows.get(host)" in non_comment_src:
            violations.append(
                (eid, "RULE_2_PRE_SOLVED_TARGET_CONSTRUCT", "FakeStore is pre-built in initialCode while learner only calls store.save()")
            )

    # Rule 3: INCOMPLETE_WAYPOINT_PRINCIPLE
    # Check that multi-part waypoint principles are exercised in the test harness / contract:
    if wp_id == "w05-wp2":
        if "WARNING" not in initial_code and "WARNING" not in expected_output:
            violations.append(
                (eid, "RULE_3_INCOMPLETE_WAYPOINT_PRINCIPLE", f"{wp_id} requires 3-tier status (OVER LIMIT, WARNING, OK) via self.percent(), but WARNING is omitted")
            )
    if wp_id == "w17-wp2":
        if "max(" not in initial_code and "peak" not in initial_code:
            violations.append(
                (eid, "RULE_3_INCOMPLETE_WAYPOINT_PRINCIPLE", f"{wp_id} requires testing generator expressions and single-pass exhaustion")
            )
    if wp_id == "w19-wp3":
        if "reset" not in initial_code and len(expected_output.split()) < 2:
            violations.append(
                (eid, "RULE_3_INCOMPLETE_WAYPOINT_PRINCIPLE", f"{wp_id} requires resetting the ContextVar token and verifying post-scope restoration")
            )
    if wp_id == "w22-wp2":
        if "max_skew" not in initial_code or "timestamp" not in initial_code:
            violations.append(
                (eid, "RULE_3_INCOMPLETE_WAYPOINT_PRINCIPLE", f"{wp_id} requires verifying both hmac.compare_digest and the timestamp replay window (0 <= now - timestamp <= max_skew)")
            )

    # Rule 4: SHORTCUT_BYPASS_VULNERABILITY
    # Check across all 76 exercises for single-case/single-branch outputs where a constant literal,
    # unconditional raise, or one-sided comparison passes a multi-condition/multi-branch contract.
    defs = [n for n in init_tree.body if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef))]
    if not defs:
        # Top-level boolean expression check
        if expected_output in ("True", "False") and "ast.BoolOp" in constructs:
            violations.append(
                (eid, "RULE_4_SHORTCUT_BYPASS_VULNERABILITY", f"Single boolean expectedOutput={expected_output!r} allows constant/partial comparison bypass")
            )
    else:
        # Check if waypoint or exercise requires branching (ast.If, ast.IfExp, ast.Raise)
        requires_branching = any(c in constructs for c in ("ast.If", "ast.IfExp", "ast.Raise"))
        if requires_branching:
            # Count how many distinct outcomes / test assertions are verified in expectedOutput
            out_lines = [l for l in expected_output.splitlines() if l.strip()]
            # Single-value outputs that only test one branch of an if/else or try/except guard:
            single_branch_outputs = {
                "OVER LIMIT",
                "OK",
                "WARNING",
                "rejected zero limit",
                "invalid port rejected",
                "{'hostname': 'srv-02', 'status': 'OVER LIMIT'}",
            }
            if len(out_lines) == 1 and expected_output.strip() in single_branch_outputs:
                violations.append(
                    (
                        eid,
                        "RULE_4_SHORTCUT_BYPASS_VULNERABILITY",
                        f"Callable with branching/validation contract only tested on 1 outcome ({expected_output!r}), allowing constant return or unconditional raise bypass",
                    )
                )

    # Stage 3 Scaffolding Fade check for Weeks 16-24
    if check_stage3_fade and week >= 16:
        todo_lines = [l.strip() for l in initial_code.splitlines() if "TODO" in l]
        for tl in todo_lines:
            # Stage 3 rule: # TODO comment may not contain syntax spoilers; must just be `# TODO`
            after_todo = tl.split("TODO", 1)[1].strip(" :")
            if after_todo:
                violations.append(
                    (eid, "STAGE_3_SCAFFOLDING_SPOILER", f"Week {week} exercise contains syntax spoiler in TODO comment: {tl!r}")
                )
        # Must contain a function or class definition with a docstring contract
        has_docstring = False
        for node in ast.walk(init_tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
                if ast.get_docstring(node):
                    has_docstring = True
                    break
        if not has_docstring:
            violations.append(
                (eid, "STAGE_3_MISSING_DOCSTRING", f"Week {week} exercise missing docstring contract on target function/class")
            )

    # Runtime & AST verification when no structural violations block execution
    if not violations and sol_code:
        # 1. initialCode must NOT produce expectedOutput
        ok_init, out_init, _ = run_code(initial_code, f"{eid}:initial")
        if ok_init and out_init == expected_output.strip():
            violations.append(
                (eid, "INITIAL_CODE_PASSES", f"initialCode already produces expectedOutput={expected_output!r}")
            )
        # 2. solution must produce expectedOutput
        ok_sol, out_sol, err_sol = run_code(sol_code, f"{eid}:solution")
        if not ok_sol:
            violations.append(
                (eid, "SOLUTION_RUNTIME_ERROR", f"Reference solution raised {err_sol}")
            )
        elif out_sol != expected_output.strip():
            violations.append(
                (eid, "SOLUTION_OUTPUT_MISMATCH", f"Reference solution output {out_sol!r} != expectedOutput {expected_output!r}")
            )
        # 3. solution AST must match waypoint constructs & tokens
        sol_nodes = ast_node_names(sol_code)
        if multi_ex_waypoint:
            if not any(c in sol_nodes for c in constructs):
                violations.append(
                    (eid, "SOLUTION_AST_MISMATCH", f"Reference solution matches none of manifest AST constructs {constructs}")
                )
            if not any(t in sol_code for t in tokens):
                violations.append(
                    (eid, "SOLUTION_TOKEN_MISMATCH", f"Reference solution matches none of manifest tokens {tokens}")
                )
        else:
            missing_ast = [c for c in constructs if c not in sol_nodes]
            if missing_ast:
                violations.append(
                    (eid, "SOLUTION_AST_MISMATCH", f"Reference solution missing manifest AST constructs {missing_ast}")
                )
            missing_tok = [t for t in tokens if t not in sol_code]
            if missing_tok:
                violations.append(
                    (eid, "SOLUTION_TOKEN_MISMATCH", f"Reference solution missing manifest tokens {missing_tok}")
                )

    return violations


def main() -> int:
    parser = argparse.ArgumentParser(description="Lint curriculum pedagogy against manifest.")
    parser.add_argument("--no-stage3-fade", action="store_true", help="Skip Stage 3 scaffolding fade check")
    parser.add_argument("--only-rule4", action="store_true", help="Report only Rule 4 violations across all exercises")
    parser.add_argument("--only-ids", nargs="*", help="Filter to specific exercise IDs")
    args = parser.parse_args()

    if not MANIFEST_PATH.exists():
        print(f"ERROR: Manifest not found at {MANIFEST_PATH}", file=sys.stderr)
        return 1

    manifest = yaml.safe_load(MANIFEST_PATH.read_text(encoding="utf-8"))
    manifest_errors = check_manifest(manifest)
    for err in manifest_errors:
        print(err)

    wp_map = {wp["id"]: wp for wp in manifest.get("waypoints", [])}

    all_violations: list[tuple[str, str, str]] = []
    exercise_count = 0

    for mdx_path in sorted(ROOT.glob("week-*.mdx")):
        week = int(re.search(r"week-(\d+)", mdx_path.name).group(1))
        text = mdx_path.read_text(encoding="utf-8")
        wps = re.split(r"(?=^## Waypoint \d+:)", text, flags=re.M)
        for wp_chunk in wps[1:]:
            wp_body = re.split(r"^## The Debrief", wp_chunk, flags=re.M)[0]
            m_wp = re.match(r"^## Waypoint (\d+):", wp_body)
            if not m_wp:
                continue
            wp_num = int(m_wp.group(1))
            wp_id = f"w{week:02d}-wp{wp_num}"
            wp_entry = wp_map[wp_id]

            ex_lines = [l for l in wp_body.splitlines() if "<PyExercise" in l]
            is_multi = len(ex_lines) > 1
            for line in ex_lines:
                attrs = dict(ATTR_RE.findall(line))
                eid = attrs["id"]
                if args.only_ids and eid not in args.only_ids:
                    continue
                exercise_count += 1
                ic = html.unescape(attrs["initialCode"])
                eo = html.unescape(attrs["expectedOutput"])
                v_list = lint_exercise(
                    eid,
                    week,
                    wp_id,
                    ic,
                    eo,
                    wp_entry,
                    check_stage3_fade=not args.no_stage3_fade,
                    multi_ex_waypoint=is_multi,
                )
                if args.only_rule4:
                    v_list = [v for v in v_list if v[1] == "RULE_4_SHORTCUT_BYPASS_VULNERABILITY"]
                all_violations.extend(v_list)

    flagged_ids = sorted({v[0] for v in all_violations})
    for eid, rule, msg in all_violations:
        print(f"[{rule}] {eid}: {msg}")

    print(
        f"\nChecked {exercise_count} exercises across {len(wp_map)} waypoints: "
        f"{len(all_violations)} violation(s) in {len(flagged_ids)} exercise(s)."
    )
    return 1 if (all_violations or manifest_errors) else 0


if __name__ == "__main__":
    sys.exit(main())
