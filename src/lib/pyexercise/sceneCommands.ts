// Wire format between the Python scene API (`pyodide.worker.ts`) and the 3D
// sandbox. Python emits one JSON object per call; the store stamps a `seq`.
export type Vec3 = [number, number, number];

/** One row of the Week 6 data sculpture: two Troika labels per block. */
export type DataFrameRow = { host: string; status: string };

export type SceneCommand =
	| { type: 'spawn'; position: Vec3; color: string; size: number }
	| { type: 'drop' }
	| { type: 'stack_push'; value: string }
	| { type: 'stack_pop' }
	| { type: 'clear' }
	| { type: 'sort_init'; values: number[] }
	| { type: 'sort_swap'; i: number; j: number }
	| { type: 'sort_mark'; index: number };

export type SequencedSceneCommand = SceneCommand & { seq: number };

/** Week 6 data-sculpture commands. Kept separate so the bridge diff stays additive. */
export type DataFrameCommand =
	| { type: 'df_init'; rows: DataFrameRow[] }
	| { type: 'df_filter'; keep: number[] }
	| { type: 'df_clear' };

export type SequencedDataFrameCommand = DataFrameCommand & { seq: number };

/** Week 16 conveyor commands. Kept separate so the bridge diff stays additive. */
export type ConveyorCommand =
	| { type: 'conveyor_start' }
	| { type: 'conveyor_yield'; label: string }
	| { type: 'conveyor_stop' };

export type SequencedConveyorCommand = ConveyorCommand & { seq: number };

/** Week 16 switchyard commands. Three lanes, one active task per lane. */
export type AsyncCommand =
	| { type: 'async_start' }
	| { type: 'async_launch'; id: string; lane: number }
	| { type: 'async_pause'; id: string }
	| { type: 'async_finish'; id: string };

export type SequencedAsyncCommand = AsyncCommand & { seq: number };

export type SceneBridgeCommand = SceneCommand | DataFrameCommand | ConveyorCommand | AsyncCommand;
export type SequencedSceneBridgeCommand = SceneBridgeCommand & { seq: number };
