/**
 * The course manifest. One entry per MDX lesson in src/content/lessons; the
 * dashboard and the lesson route both read from here so titles and slugs
 * cannot drift apart.
 */
export type LessonModule = {
	/** Route slug, matching the MDX frontmatter id. */
	slug: string;
	/** Lesson number, 0..24. */
	week: number;
	title: string;
	/** One sentence, shown on the module card. */
	summary: string;
	estimatedMinutes: number;
	/** The filter a reader looks for: systems work, data work, or network work. */
	track: 'ops' | 'data' | 'web';
};

export const MODULES: LessonModule[] = [
	{
		slug: 'week-00-setup-and-first-script',
		week: 0,
		title: 'Setup and the First Script',
		summary:
			'It is 3:14 AM, srv-07 is at 96%, and your own terminal answers command not found. Install the interpreter, install an editor, and run one script that proves the machine is ready.',
		estimatedMinutes: 12,
		track: 'ops'
	},
	{
		slug: 'week-01-variables-types-and-output',
		week: 1,
		title: 'Variables, Types, and Output',
		summary:
			'It is 2:47 AM and srv-07 is filling up. Hold two numbers, divide them without lying about the types, and print one clean status line.',
		estimatedMinutes: 16,
		track: 'ops'
	},
	{
		slug: 'week-02-decisions-and-loops',
		week: 2,
		title: 'Conditionals and Loops',
		summary:
			'It is 3:14 AM and srv-07 is at 95% disk. Write a script that decides for itself when a number crosses the line, and keeps checking until the list runs out.',
		estimatedMinutes: 18,
		track: 'ops'
	},
	{
		slug: 'week-03-functions-and-modules',
		week: 3,
		title: 'Functions and Modules',
		summary:
			'The same disk check is pasted into a third script. Define it once, name it, and import it from anywhere.',
		estimatedMinutes: 18,
		track: 'ops'
	},
	{
		slug: 'week-04-lists-dictionaries-and-files',
		week: 4,
		title: 'Lists, Dictionaries, and Files',
		summary:
			'A few hundred lines of records.txt, addressable by field name instead of by guesswork, and a script that survives the file going missing at 4 AM.',
		estimatedMinutes: 20,
		track: 'data'
	},
	{
		slug: 'week-05-classes-and-objects',
		week: 5,
		title: 'Classes and Objects',
		summary:
			'Status and the rule that judges it live in two places. Put them in one object, then let a list of those objects be the fleet.',
		estimatedMinutes: 20,
		track: 'ops'
	},
	{
		slug: 'week-06-pandas',
		week: 6,
		title: 'Data Wrangling with Pandas',
		summary:
			'Three thousand rows, a loop inside a loop, and forty seconds to answer one question. Hand the whole table to pandas instead.',
		estimatedMinutes: 20,
		track: 'data'
	},
	{
		slug: 'week-07-strings-and-text',
		week: 7,
		title: 'String Manipulation',
		summary:
			'The auth log spells one host four different ways. Normalise the text before a single line gets counted.',
		estimatedMinutes: 20,
		track: 'data'
	},
	{
		slug: 'week-08-pulling-real-data',
		week: 8,
		title: 'Web APIs and JSON',
		summary:
			'The inventory is a CSV on someone else’s server and the incident metadata is behind an API. Ask for it, and read the status code before the body.',
		estimatedMinutes: 22,
		track: 'web'
	},
	{
		slug: 'week-09-hashing-and-auth',
		week: 9,
		title: 'Hashing and Authentication',
		summary:
			'The password file is worth stealing. Make what is inside it useless to whoever takes it, without ever storing the password itself.',
		estimatedMinutes: 22,
		track: 'web'
	},
	{
		slug: 'week-10-sql-and-databases',
		week: 10,
		title: 'SQL and Databases',
		summary:
			'Forty thousand log lines and grep is returning line numbers instead of answers. Move the events into ops.db and ask real questions.',
		estimatedMinutes: 20,
		track: 'data'
	},
	{
		slug: 'week-11-streamlit-dashboard',
		week: 11,
		title: 'The Rerun Mental Model',
		summary:
			'Three people are on call and one will not open a terminal at 3 AM. Build the state machine behind every UI before adding a UI library.',
		estimatedMinutes: 18,
		track: 'ops'
	},
	{
		slug: 'week-12-intelligence-and-deployment',
		week: 12,
		title: 'Calling an LLM API',
		summary:
			'Call a real model with a key that may be missing, handle a rate limit, mock the network in tests, and ship the pass that does it.',
		estimatedMinutes: 20,
		track: 'web'
	},
	{
		slug: 'week-13-command-line-interfaces',
		week: 13,
		title: 'CLI Tools and File Paths',
		summary:
			'Cron cannot click a selectbox at 3:14 AM. Give the scanner a real command line, pathlib paths and exit codes automation can read.',
		estimatedMinutes: 20,
		track: 'ops'
	},
	{
		slug: 'week-14-dataclasses-and-validation',
		week: 14,
		title: 'Dataclasses and Type Validation',
		summary:
			'Six scripts, three names for the same key, and a used value that arrives as text. Declare the shape once so bad records fail at the door.',
		estimatedMinutes: 20,
		track: 'data'
	},
	{
		slug: 'week-15-rest-apis-with-fastapi',
		week: 15,
		title: 'REST APIs with FastAPI',
		summary:
			'Twenty agents across three regions need to push readings. Stand up an HTTP service that validates payloads before they touch the database.',
		estimatedMinutes: 22,
		track: 'web'
	},
	{
		slug: 'week-16-async-io-and-concurrency',
		week: 16,
		title: 'Async I/O and Concurrency',
		summary:
			'Two hundred hosts at 250 ms each is a minute spent waiting for packets. Run the health sweep concurrently instead of in a line.',
		estimatedMinutes: 22,
		track: 'ops'
	},
	{
		slug: 'week-17-generators-and-streaming',
		week: 17,
		title: 'Generators and Data Streams',
		summary:
			'A 14 GB access log will not fit in a list. Stream it with yield and itertools and count the 502s in constant memory.',
		estimatedMinutes: 20,
		track: 'data'
	},
	{
		slug: 'week-18-decorators-and-context-managers',
		week: 18,
		title: 'Decorators and Context Managers',
		summary:
			'Retries, timing logs and cleanup are pasted into twenty functions. Extract them into decorators and context managers instead.',
		estimatedMinutes: 20,
		track: 'ops'
	},
	{
		slug: 'week-19-logging-and-observability',
		week: 19,
		title: 'Logging and Monitoring',
		summary:
			'Ten thousand print statements and no timestamps when the API returns 500. Replace them with structured logs, request IDs and metrics.',
		estimatedMinutes: 20,
		track: 'ops'
	},
	{
		slug: 'week-20-background-queues-and-workers',
		week: 20,
		title: 'Task Queues and Workers',
		summary:
			'A four-second webhook holds every agent POST open. Put the slow delivery on a queue and let a worker own the retries.',
		estimatedMinutes: 22,
		track: 'ops'
	},
	{
		slug: 'week-21-database-indexing-and-transactions',
		week: 21,
		title: 'Database Indexing and Caching',
		summary:
			'Two million rows and a four-second refresh. Add indexes, wrap the migration in one transaction, and cache the read-heavy queries.',
		estimatedMinutes: 22,
		track: 'data'
	},
	{
		slug: 'week-22-api-security-and-rate-limiting',
		week: 22,
		title: 'API Security and Rate Limiting',
		summary:
			'Someone is guessing passwords at 200 requests per second and spoofing your webhook. Verify signatures, compare in constant time, rate-limit.',
		estimatedMinutes: 22,
		track: 'web'
	},
	{
		slug: 'week-23-advanced-testing-and-fixtures',
		week: 23,
		title: 'Testing: Fixtures and Mocks',
		summary:
			'Forty tests copy the same setup and stay green while production breaks. Replace the boilerplate with fixtures and parameterized tables.',
		estimatedMinutes: 20,
		track: 'ops'
	},
	{
		slug: 'week-24-packaging-and-architecture',
		week: 24,
		title: 'Architecture and Deployment',
		summary:
			'Twenty-four weeks of scripts only run from the right terminal. Package them, declare the entrypoint, and wire the release.',
		estimatedMinutes: 22,
		track: 'ops'
	}
];

export function findModule(slug: string): LessonModule | undefined {
	return MODULES.find((entry) => entry.slug === slug);
}
