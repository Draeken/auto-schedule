# Project overview

## Goals

 - Have a schedule automatically generated and tolerant to the unexpected. Avoid decision fatigue.
 - Help user to focus on a task, manage his priorities, achieve his projects.
 - Help user to make the good choice in unforeseen conditions.
 - Progressive Web App with offline support (limited use due to Internet necessity for requesting agents).

Ref | Description
--- | -----------
GL01 | Allow agents to allocate time with a conflict resolver.
GL03 | Allow the user to self-track his use of time
GL05 | Task can be done with multiple person. Let the app be social
GL06 | More interaction: User could ask the consequences of doing what he wants, or he could share his state
GL07 | Let the user manage his periods with specific configuration for each agents per periods

## Project Phases

Ref | Name | Description
--- | ---- | -----------
PP01 | Proto | Prototype with only GL01, no presentation
PP02 | Nice Proto | Add presentation and GL03, GL07
PP03 | Networked | Development of additional agents, GL05
PP04 | Interacted | GL06

### Proto (PP01)

The main goal is to develop a solid backend base for agents, coordination and conflict resolution. Views are minimal. Agent development must be done in the same time.

# Application Layer Specification

## Features

### For Proto (PP01)

Ref | Description
--- | -----------
PP01F01 | Display information about current task
PP01F03 | Display the whole planning
PP01F04 | Generic agent
PP01F11 | Conflict resolver
PP01F12 | Let the user configure base agent
PP01F13 | User login/signup

### For Nice Proto (PP02)

Ref | Description
--- | -----------
PP02F01 | Onboarding - Quick Start
PP02F02 | Display and manage current task - pause/done...
PP02F05 | View a chart of time allocation by activity
PP02F06 | Display a planning historic with search/filter capacity
PP02F10 | Sync between multiple device
