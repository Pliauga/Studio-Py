// Solutions for week 6 exercises.
// Keyed by the PyExercise id used in src/content/lessons/week-06.mdx.

const solutions: Record<string, string> = {
	'w06-apply-classify': `import pandas as pd
servers = pd.DataFrame(dict(hostname=['srv-01', 'srv-03', 'srv-05'], percent=[87, 120, 101]))

def classify(percent):
    if percent >= 100:
        return 'OVER LIMIT'
    elif percent >= 90:
        return 'WARNING'
    else:
        return 'OK'

servers['status'] = servers['percent'].apply(classify)
print(servers['status'].iloc[0], servers['status'].iloc[1], servers['status'].iloc[2])`,
	'w06-dtype-arithmetic': `import pandas as pd
readings = pd.DataFrame(dict(count=['12', '45', '8'], limit=[50, 50, 50]))
readings['count'] = readings['count'].astype(float)
readings['percent'] = (readings['count'] / readings['limit']) * 100
print(readings['percent'].iloc[0])`,
	'w06-filter-percent': `import pandas as pd
servers = pd.DataFrame(dict(hostname=['srv-01', 'srv-03', 'srv-05'], percent=[87, 120, 101]))
over = servers['percent'] >= 100
print(len(servers[over]))`,
	'w06-scene-filter': `import pandas as pd
servers = pd.DataFrame(dict(host=['srv-01', 'srv-02', 'srv-03', 'srv-04'], status=['OK', 'OVER LIMIT', 'WARNING', 'OVER LIMIT']))
visualize_dataframe(servers.to_dict('records'))
over = servers['status'] == 'OVER LIMIT'
kept = servers[over]
filter_rows(kept.index.tolist())
print(len(kept))`
};

export default solutions;
