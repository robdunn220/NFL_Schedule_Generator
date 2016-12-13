# NFL Schedule Generator

## Overview
The NFL Schedule Generator dynamically generates a schedule for a user-specified NFL team. 
The schedule is generated based on the specific NFL Schedule rules, which must be implemented dynamically 
based on which team the user chooses.

The NFL consists of two conferences, the AFC and the NFC. Each conference consists of four divisions: North, East, South, West.
Each division is prepended with the respective conference they belong to. For example, the West division of the AFC would be called the AFC West.

These rules include:

**-There are 17 weeks in a season**

**-Each team must have a bye-week between weeks 4 and 12. This is the only week in which a team does not play a game.**

**-Each team must play two games against each of the other three teams in their division, totalling six games.**

**-Each division is assigned another division in their conference in which the teams must play each other one time each, totalling 4 games.**

**-The two remaining conference division teams are pooled, and two teams from the group are assigned as opponent.**

**-The reaminaing four spots are filled by four teams from a division in the other conference, regardless of divisional affiliation.**

## Example implementation of the rules
For the example, I will choose the Atlanta Falcons, my favorite NFL team.

So, a schedule is being created for the Atlanta Falcons.

First, a bye week is chosen from weeks 4-12 and assigned.

Next, the divisional opponents must be assigned. The Falcons are in the NFC South, which is comprised of the Carolina Panthers, New Orleans Saints,
Tampa Bay Buccaneers, and, of course, Atlanta Falcons. The Falcons must play each of these teams twice, not including themselves.

This year, the interconference division that is chosen is the NFC West. So, each team in the NFC South and NFC West must play a game against each other.
This means the Falcons have to play the Cardinals, Seahawks, 49ers, and Rams one time each.

The two remaining NFC divisions are the NFC North and NFC East. Any of these 8 teams can be chosen as opponents, regardless of division, 
so lets pick the Packers and Bears.

Lastly, lets say that the other conference division chosen is the AFC West, which is comprised of the Chiefs, Chargers, Broncos, and Raiders.
The Falcons must play each of these teams one time.
