// Hidden post-run assertions keyed by PyExercise id.
//
// Stdout alone can be forged with a single print, so an exercise is only
// "passed" when these assertions hold against the namespace the student's code
// actually produced. The checks stay out of the MDX so the visible lesson does
// not hand students the expected values.
const checks: Record<string, string> = {
	'w05-init-attribute': [
		"assert r.label == 'R-001'",
		'assert r.value == 87.0',
		'assert r.limit == 100.0'
	].join('\n'),
	'w05-method-status': [
		"assert r_over.status() == 'OVER LIMIT'",
		"assert r_warn.status() == 'WARNING'",
		"assert r_ok.status() == 'OK'"
	].join('\n'),
	'w05-stack-push': [
		"assert stack.items == ['OK', 'WARNING']",
		"assert top == 'OVER LIMIT'",
		"assert _STACK_EVENTS == ['push', 'push', 'push', 'pop']"
	].join('\n'),
	'w05-class-counter': ['assert Checker.over_limit_count == 2'].join('\n'),
	'w09-hash-verify': [
		'assert match.hexdigest() == stored_hash',
		"assert match.hexdigest() == hashlib.sha256(b'password123').hexdigest()"
	].join('\n'),
	'w09-store-split': [
		"assert username == 'alice'",
		"assert stored_cred.count('$') == 1",
		"assert len(stored_cred.split('$', 1)[0]) == 32"
	].join('\n'),
	'w09-env-read': [
		'assert len(api_key) == 11',
		"assert 'OPS_API_KEY' not in os.environ"
	].join('\n'),
	'w11-session-state-counter': [
		"assert state['scans'] == 3",
		'fresh = {}',
		'run_once(fresh, False)',
		"assert fresh['scans'] == 0",
		'run_once(fresh, True)',
		"assert fresh['scans'] == 1"
	].join('\n'),
	'w11-options-from-data': ["assert options == ['all', 'apac', 'eu', 'us']"].join('\n'),
	'w12-resend-history': [
		"assert [m['role'] for m in history] == ['system', 'user', 'assistant']",
		"turn('retry?', 'yes')",
		"assert len(history) == 5"
	].join('\n'),
	'w12-threshold-edge': [
		"assert status_of(100) == 'OVER LIMIT'",
		"assert status_of(99) == 'WARNING'",
		"assert status_of(100, limit=101) == 'WARNING'"
	].join('\n'),
	'w15-route-lookup': [
		'import asyncio',
		'import httpx',
		'from httpx import ASGITransport, AsyncClient',
		'async def _hidden_route_check():',
		"    async with AsyncClient(transport=ASGITransport(app=app), base_url='http://test') as client:",
		"        hit = await client.get('/hosts/srv-02')",
		"        missing = await client.get('/hosts/srv-404')",
		'    assert hit.status_code == 200',
		"    assert hit.json() == {'hostname': 'srv-02', 'status': 'OVER LIMIT'}",
		'    assert missing.status_code == 404',
		'asyncio.run(_hidden_route_check())'
	].join('\n'),
	'w15-query-filter': [
		"assert [r['hostname'] for r in filter_hosts(sample, region='eu', min_pct=102)] == ['srv-02']",
		'assert len(filter_hosts(sample)) == 3',
		"assert filter_hosts(sample, region='us') == [sample[2]]"
	].join('\n'),
	'w15-http-status-dispatch': [
		'import asyncio',
		'import httpx',
		'from httpx import ASGITransport, AsyncClient',
		'async def _hidden_status_check():',
		"    async with AsyncClient(transport=ASGITransport(app=app), base_url='http://test') as client:",
		"        good = await client.post('/readings', json={'hostname': 'SRV-09', 'percent': 90})",
		"        bad = await client.post('/readings', json={'hostname': '', 'percent': 1.0})",
		'    assert good.status_code == 201',
		'    assert bad.status_code == 422',
		"    assert STORE['srv-09']['percent'] == 90.0",
		'asyncio.run(_hidden_status_check())'
	].join('\n'),
	'w23-isolated-fixture': [
		'assert run_isolated_suite() == (2, 1)',
		'assert test_two(make_store()) == 1'
	].join('\n'),
	'w23-assert-raises': [
		'def _hidden_returns_none(value):',
		'    return value',
		'assert check_raises_value_error(require_positive, 0) is True',
		'assert check_raises_value_error(require_positive, 10) is False',
		'assert check_raises_value_error(_hidden_returns_none, 1) is False'
	].join('\n'),
	'w23-fake-gateway': [
		"assert store.get('srv-07') == 98.5",
		"assert store.get('missing') is None",
		'assert rejected is True',
		'fresh = FakeStore()',
		"fresh.save('srv-01', 0.0)",
		"assert fresh.get('srv-01') == 0.0",
		'try:',
		"    fresh.save('', 1.0)",
		'except ValueError:',
		'    pass',
		'else:',
		'    raise AssertionError("empty host must raise ValueError")'
	].join('\n')
};

export function getChecks(id: string): string | null {
	return checks[id] ?? null;
}
