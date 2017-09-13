## Overview

The experiment interface has be tweaked as detailed in the experiment design documents.

## Experiment Trials Generator

To generate the appropriate experiment branch and relative trials, navigate to py/experiment_generator.py. In this file, you would pass in the pid of the participant (running number) to generate the appropriate branch. Number of participants can also be adjusted via here.

## Third Independent Variable/ Dependent Variables Tracking

The third variable included varies the number of windows and this is done via changes made to the ACPToolKit.js to include new parameters to handle highlighting as the window number and granularity are varied.

All the dependent variables as reflected in the experiment design document.
Additionally, tracking of clicked windows is done in experiment.html using some jQuery. This is then included in the summarized CSV.
