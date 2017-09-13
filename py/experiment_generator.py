### Experiments JSON Generator
# Generate JSON Structure for N participants

import json
from itertools import cycle

pid = 1
no_of_participants = 6
experiments_lst = []

techniques_lst = [
    ["AUTOCOMPASTE", "TRADITIONAL"],
    ["TRADITIONAL", "AUTOCOMPASTE"]
]

granularity_lst = cycle([
    ["phrase", "paragraph", "sentence"],
    ["sentence", "phrase", "paragraph"],
    ["paragraph", "sentence", "phrase"],
])
windows_lst = [4, 8, 12]
data_file = "data/texts.json"
number_of_trials_per_cond = 3

for idx in range(pid):
    granularity = next(granularity_lst)
    techniques = techniques_lst[0] if (idx < no_of_participants/2) else techniques_lst[1]

    for technique in techniques:
        for gran in granularity:
            for window in windows_lst:
                experiment = {
                    # "participant": idx,
                    "technique" : technique,
                    "granularity" : gran,
                    "windows" : window,
                    "data_file" : data_file
                }

                # add to experiment
                for _ in range(number_of_trials_per_cond):
                    experiments_lst.append(experiment)

# Trials Arrangment Generated
with open('../data/experiments.json', 'w') as outfile:
    json.dump({"experiments": experiments_lst}, outfile)

print("trials generated!")
