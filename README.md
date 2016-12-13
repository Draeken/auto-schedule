[![CI status]
  (https://travis-ci.org/PBM42/auto-schedule.svg?branch=master)]
  (https://travis-ci.org/PBM42/auto-schedule) [![codecov]
  (https://codecov.io/gh/PBM42/auto-schedule/branch/master/graph/badge.svg)]
  (https://codecov.io/gh/PBM42/auto-schedule) [![dependency]
  (https://david-dm.org/PBM42/auto-schedule.svg)]
  (https://david-dm.org/PBM42/auto-schedule) [![devDependency]
  (https://david-dm.org/PBM42/auto-schedule/dev-status.svg)]
  (https://david-dm.org/PBM42/auto-schedule?type=dev)

# Project overview

## Goals

 - Have a schedule automatically generated and tolerant to the unexpected.
 - Help user to focus on a task, manage his priorities, achieve his projects.
 - Help user to make the good choice in unforeseen conditions.
 - Progressive Web App with offline support.

Ref | Description
--- | -----------
GL01 | Auto-generate base schedule with sleep, eat, wash, work and shopping slots
GL02 | Allow the user to add miscellaneous, generics activity/task
GL03 | Allow the user to self-track his use of time
GL04 | Let the app manage time allocation for more user’s activity, with third-party
GL05 | Task can be done with multiple person. Let the app be social
GL06 | More interaction: User could ask the consequences of doing what he wants, or he could share his state
GL07 | Let the user manage his periods with specific configuration for each agents per periods

## Project Phases

Ref | Name | Description
--- | ---- | -----------
PP01 | Proto | Prototype with only GL01 and GL02, no presentation
PP02 | Nice Proto | Add presentation and GL03, GL07
PP03 | Networked | Development of additional agents, GL04, GL05
PP04 | Interacted | GL06

# Application Layer Specification

## Features

### For Proto (PP01)

Ref | Description
--- | -----------
PP01F01 | Display information about current task/effect
PP01F02 | Button for adding miscellaneous task
PP01F03 | Display the whole planning
PP01F04 | Generic agent
PP01F05 | Agent free time
PP01F06 | Agent eat (dummy)
PP01F07 | Agent wash
PP01F08 | Agent shopping
PP01F09 | Agent sleep
PP01F10 | Agent transit (dummy)
PP01F11 | Conflict resolver
PP01F12 | Let the user configure base agent

### For Nice Proto (PP02)

Ref | Description
--- | -----------
PP02F01 | Onboarding - Quick Start
PP02F02 | Display and manage current task
PP02F04 | User can add activity (condition on weather or user state)
PP02F05 | View a chart of time allocation by activity
PP02F06 | Display a planning historic with search/filter capacity
PP02F07 | Agent eat
PP02F08 | Agent transit
PP02F09 | Agent finance
PP02F10 | Sync between multiple device
