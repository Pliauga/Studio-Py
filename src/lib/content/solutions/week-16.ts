// Solutions for week 16 exercises.
// Keyed by the PyExercise id used in src/content/lessons/week-16.mdx.

const solutions: Record<string, string> = {
	'w16-await-coroutine': `import asyncio

async def fetch_status(host: str) -> str:
    await asyncio.sleep(0.01)
    return f'{host}: READY'

async def main() -> None:
    """Fetch the status for 'srv-01' and print the resolved string."""
    status = await fetch_status('srv-01')
    print(status)

asyncio.run(main())`,
	'w16-gather-order': `import asyncio

async def fetch_pct(host: str, pct: float) -> tuple[str, float]:
    await asyncio.sleep(0.01)
    return (host, pct)

async def sweep_all(inputs: list[tuple[str, float]]) -> list[tuple[str, float]]:
    """Run fetch_pct concurrently for all (host, pct) pairs and return the results in input order."""
    return list(await asyncio.gather(*(fetch_pct(h, p) for h, p in inputs)))

inputs = [('srv-01', 82.0), ('srv-02', 99.5), ('srv-03', 71.0)]
print(asyncio.run(sweep_all(inputs)))`,
	'w16-gather-wallclock': `import asyncio
import time

HOSTS = [('srv-01', 82.0), ('srv-02', 99.5), ('srv-03', 71.0), ('srv-04', 64.0), ('srv-05', 88.0), ('srv-06', 55.0)]

async def fetch_pct(host: str, pct: float) -> tuple[str, float]:
    await asyncio.sleep(0.05)
    return (host, pct)

async def sweep_sequential(hosts: list[tuple[str, float]]) -> list[tuple[str, float]]:
    results = []
    for host, pct in hosts:
        results.append(await fetch_pct(host, pct))
    return results

async def sweep_concurrent(hosts: list[tuple[str, float]]) -> list[tuple[str, float]]:
    """Return fetch_pct results for every host from a single asyncio.gather call."""
    return list(await asyncio.gather(*(fetch_pct(h, p) for h, p in hosts)))

async def main() -> None:
    start = time.perf_counter()
    await sweep_sequential(HOSTS)
    sequential = time.perf_counter() - start
    start = time.perf_counter()
    results = await sweep_concurrent(HOSTS)
    concurrent = time.perf_counter() - start
    print(len(results), concurrent < sequential, concurrent > 0.02)

asyncio.run(main())`,
	'w16-scene-gather': `import asyncio

HOSTS = [('srv-01', 82.0), ('srv-02', 99.5), ('srv-03', 71.0)]

async def run_host(host: str, lane: int) -> str:
    launch_task(host, lane)
    await asyncio.sleep(0.25 + lane * 0.1)
    pause_task(host)
    await asyncio.sleep(0.25)
    finish_task(host)
    return host

async def main() -> list[str]:
    """Gather one run_host coroutine per host and preserve input order."""
    start_switchyard()
    return list(await asyncio.gather(*(run_host(host, lane) for lane, (host, _pct) in enumerate(HOSTS))))

print(asyncio.run(main()))`,
	'w16-return-exceptions': `import asyncio

async def check(host: str) -> str:
    if host == 'srv-down':
        raise ConnectionError('unreachable')
    return f'{host}: UP'

async def collect_healthy(hosts: list[str]) -> list[str]:
    """Probe all hosts concurrently without aborting on connection errors; return only non-Exception results."""
    results = await asyncio.gather(*(check(h) for h in hosts), return_exceptions=True)
    return [r for r in results if not isinstance(r, Exception)]

print(asyncio.run(collect_healthy(['srv-01', 'srv-down', 'srv-02'])))`,
	'w16-semaphore-peak': `import asyncio

active = 0
peak = 0

async def step() -> None:
    global active, peak
    active += 1
    peak = max(peak, active)
    await asyncio.sleep(0.01)
    active -= 1

async def worker(sem: asyncio.Semaphore) -> None:
    """Execute step() while holding the concurrency slot in sem."""
    async with sem:
        await step()

async def main() -> None:
    sem = asyncio.Semaphore(2)
    await asyncio.gather(*(worker(sem) for _ in range(6)))
    print('Peak:', peak)

asyncio.run(main())`
};

export default solutions;
