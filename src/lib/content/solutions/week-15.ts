// Solutions for week 15 exercises.
// Keyed by the PyExercise id used in src/content/lessons/week-15.mdx.

const solutions: Record<string, string> = {
	'w15-http-status-dispatch': `import asyncio
import httpx
from fastapi import FastAPI, HTTPException
from httpx import ASGITransport, AsyncClient
from pydantic import BaseModel, Field

app = FastAPI()
STORE = {}

class ReadingIn(BaseModel):
    hostname: str
    percent: float = Field(ge=0)

@app.post('/readings', status_code=201)
async def create_reading(payload: ReadingIn) -> dict:
    host = payload.hostname.strip().lower()
    if not host:
        raise HTTPException(status_code=422, detail='hostname required')
    STORE[host] = {'hostname': host, 'percent': float(payload.percent)}
    return STORE[host]

async def main() -> None:
    async with AsyncClient(transport=ASGITransport(app=app), base_url='http://test') as client:
        bad = await client.post('/readings', json={'hostname': '', 'percent': 88})
        good = await client.post('/readings', json={'hostname': 'srv-01', 'percent': 88})
    assert bad.status_code == 422
    assert good.status_code == 201
    print(bad.status_code, good.status_code, good.json())

asyncio.run(main())`,
	'w15-query-filter': `sample = [
    {'hostname': 'srv-01', 'region': 'eu', 'percent': 87.0},
    {'hostname': 'srv-02', 'region': 'eu', 'percent': 102.0},
    {'hostname': 'srv-03', 'region': 'us', 'percent': 95.0},
]
def filter_hosts(rows, region=None, min_pct=0.0):
    result = [r for r in rows if r['percent'] >= min_pct]
    if region is not None:
        result = [r for r in result if r['region'] == region]
    return result

print([r['hostname'] for r in filter_hosts(sample, region='eu', min_pct=90.0)])`,
	'w15-route-lookup': `import asyncio
import httpx
from fastapi import FastAPI, HTTPException
from httpx import ASGITransport, AsyncClient

app = FastAPI()
FLEET = {'srv-01': {'percent': 87.0}, 'srv-02': {'percent': 104.5}}

@app.get('/hosts/{hostname}')
async def get_host(hostname: str) -> dict:
    key = hostname.strip().lower()
    if key not in FLEET:
        raise HTTPException(status_code=404, detail='Host not found')
    record = FLEET[key]
    return {'hostname': key, 'status': 'OVER LIMIT' if record['percent'] >= 100 else 'OK'}

async def main() -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url='http://test') as client:
        ok = await client.get('/hosts/SRV-01')
        missing = await client.get('/hosts/srv-99')
    assert ok.status_code == 200
    assert missing.status_code == 404
    print(ok.status_code, ok.json())
    print(missing.status_code, missing.json())

asyncio.run(main())`
};

export default solutions;
