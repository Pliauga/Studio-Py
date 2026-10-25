// Solutions for week 14 exercises.
// Keyed by the PyExercise id used in src/content/lessons/week-14.mdx.

const solutions: Record<string, string> = {
	'w14-default-factory': `from dataclasses import dataclass, field

@dataclass
class AlertBatch:
    region: str
    hosts: list[str] = field(default_factory=list)

b1 = AlertBatch('eu')
b2 = AlertBatch('us')
b1.hosts.append('srv-01')
b2.hosts.append('srv-09')
print(b1.hosts, b2.hosts)`,
	'w14-post-init-guard': `from dataclasses import dataclass

@dataclass
class HostReading:
    hostname: str
    used_gb: float
    limit_gb: float = 100.0

    def __post_init__(self):
        self.hostname = self.hostname.strip().lower()
        if self.limit_gb <= 0:
            raise ValueError('limit_gb must be positive')

ok = HostReading('  SRV-01 ', 50.0, 100.0)
try:
    HostReading('srv-01', 50.0, 0.0)
    guard = 'accepted'
except ValueError:
    guard = 'rejected zero limit'
print(ok.hostname, '|', guard)`,
	'w14-quarantine-batch': `raw_rows = [('srv-01', 80), ('', 95), ('srv-02', -5), ('srv-03', 100)]
clean = []
errors = 0
for host, pct in raw_rows:
    if host and (0 <= pct <= 100):
        clean.append((host, pct))
    else:
        errors += 1
print(len(clean), errors)`,
	'w14-type-contract': `def parse_percent(raw: str | None) -> float:
    if raw is None:
        return 0.0
    return float(raw.rstrip('%'))

print(parse_percent('92.5%'), parse_percent(None))`
};

export default solutions;
