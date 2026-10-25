// Solutions for week 24 exercises.
// Keyed by the PyExercise id used in src/content/lessons/week-24.mdx.

const solutions: Record<string, string> = {
	'w24-domain-separation': `from dataclasses import dataclass

@dataclass(frozen=True)
class Reading:
    host: str
    pct: float

def over_limit_hosts(readings: list[Reading], threshold: float = 100.0) -> list[str]:
    """Return sorted hostnames for readings with pct >= threshold."""
    return sorted([r.host for r in readings if r.pct >= threshold])

sample = [Reading('srv-03', 105.0), Reading('srv-01', 88.0), Reading('srv-02', 100.0)]
print(over_limit_hosts(sample))`,
	'w24-entrypoint-parse': `import tomllib

PYPROJECT_TOML = """
[project]
name = "ops-console"
version = "1.2.0"

[project.scripts]
ops-scan = "ops_console.cli:main"
ops-worker = "ops_console.worker:run"
"""

def parse_script_entrypoint(raw_toml: str, command: str) -> tuple[str, str]:
    """Parse \`raw_toml\` with tomllib.loads and return (package_name, script_target) for \`command\` under [project.scripts]."""
    data = tomllib.loads(raw_toml)
    return data['project']['name'], data['project']['scripts'][command]

print(parse_script_entrypoint(PYPROJECT_TOML, 'ops-scan'))
print(parse_script_entrypoint(PYPROJECT_TOML, 'ops-worker'))`,
	'w24-settings-loader': `def load_port(env: dict[str, str], default: int = 8000) -> int:
    """Read PORT from \`env\` (or use \`default\`), convert to int, and raise ValueError unless 1 <= port <= 65535."""
    port = int(env.get('PORT', str(default)))
    if not (1 <= port <= 65535):
        raise ValueError(f'Invalid port: {port}')
    return port

results = []
for case in [{'PORT': '9090'}, {}, {'PORT': '0'}, {'PORT': '70000'}]:
    try:
        results.append(str(load_port(case)))
    except ValueError:
        results.append('ERR')
print(' '.join(results))`
};

export default solutions;
