var app = angular.module('nfl_app', ['ui.router', 'ngCookies']);

app.factory("NFL_Api", function factoryFunction($http, $rootScope) {
  // Creates an object for the returned results to be stored to
  var service = {};
  // Makes a call to server.py to return all NFL teams
  service.displayAllTeams = function() {
    return $http({
      url: '/api/all_teams'
    });
  };
  // Returns the object after the call is made
  return service;
});

// Controller for the page that displays all NFL teams
app.controller('AllTeamsController', function($scope, NFL_Api) {
  // Service call for the data requested from the data base
  NFL_Api.displayAllTeams().success(function(results) {
    // The teams are stored in a $scope variable, and sorted into the two arrays using the $scope.sortTeams method
    $scope.allTeams = results;
    $scope.AFClist = [];
    $scope.NFClist = [];
    $scope.sortTeams();
  });

  // Function that sorts all of the teams into their respective conferences, and then divisions
  $scope.sortTeams = function () {
    for (var i = 0; i < $scope.allTeams.length; i++) {
      if ($scope.allTeams[i].conference_name === 'AFC') {
        $scope.AFClist.push($scope.allTeams[i]);
        $scope.afc = $scope.allTeams[i].conference_name;
      }
      else if ($scope.allTeams[i].conference_name === 'NFC') {
        $scope.NFClist.push($scope.allTeams[i]);
        $scope.nfc = $scope.allTeams[i].conference_name;
      }
    }
  };
});

app.controller('ScheduleGeneratorController', function($scope, NFL_Api, $rootScope, $cookies, $stateParams) {
  // Class instantiation. Where should I put this though?
  class Schedule {
    constructor(name, division, schedule) {
      this.name = name;
      this.division = division;
      this.schedule = schedule;
    }
  }
  $scope.schedule = [];
  $scope.weeksLeft = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

  // Makes a service call to return all teams. Results are stored in a $scope var, and passed on
  NFL_Api.displayAllTeams().success(function(res) {
    // This is the code for the original SINGLE team generation
    $scope.nflInfo = res;
    $scope.getTeamInfo($scope.nflInfo);
  });

  // Function that takes the week and opponent name, and pushes it into the schedule array with keys
  $scope.addToSched = function(week, opp) {
    $scope.schedule.push({'week': week, 'opponent': opp});
  };

  // Takes the user input, finds the team in the nflInfo object, and assigns that to the mainTeam var, which is the team the schedule will be created for
  $scope.getTeamInfo = function (nflInfo) {
    // This is the code for the original SINGLE team generation
    nflInfo.forEach(function(team) {
      if (team.team_name === $stateParams.team) {
        $scope.mainTeam = team;
        $scope.scheduleCreator(nflInfo);
      }
    });
  };

  // Main schedule-generating function
  $scope.scheduleCreator = function(nflInfo) {
    var divisionOpponents = [];
    var otherDivisionOpponents = [];
    var randNum;
    var weekPicked;
    var otherConferenceOpponents = [];
    var divisionNamesArray = [];
    var otherConfDivNamesArray = [];
    var divisionChosenArray = [];
    var otherConfDivChosenArray = [];
    var conferenceOpponents = [];
    var randTeamNum;
    var teamPicked;
    $scope.teams = [];

    // Sorts the NFL teams out into arrays based on their relation to the selected team, mainTeam. The first if statement isolates mainTeam's divisional opponents. The first elseif finds the remainder of the teams in mainTeams conference and pushes them into an array. The last statement finds and pushes the other cobference teams to an array.
    nflInfo.forEach(function(team) {
      if ((team.division_name === $scope.mainTeam.division_name) && (team.team_name !== $scope.mainTeam.team_name)) {
        divisionOpponents.push(team);
      }

      else if ((team.conference_name === $scope.mainTeam.conference_name) && (team.team_name !== $scope.mainTeam.team_name) && (team.division_name !== $scope.mainTeam.division_name)) {
        otherDivisionOpponents.push(team);
      }

      else if ((team.conference_name !== $scope.mainTeam.conference_name)) {
        otherConferenceOpponents.push(team);
      }
    });

    // First assignment to schedule. Picks a random number between 4 and 12 and assigns a bye to that week.
    var byeRandNum = (Math.floor(Math.random() * 9) + 3);
    var byeWeekPicked = $scope.weeksLeft[byeRandNum];
    $scope.weeksLeft.splice(byeRandNum, 1);
    $scope.addToSched(byeWeekPicked, 'Bye');

    // Assignment of divisional opponents occurs here. Each divisional opponent is scheduled for 2 games. Need to figure out the best way to not have the same div. opponent scheduled subsequently
    divisionOpponents.forEach(function(team) {
      for (var i = 0; i < 2; i++) {
        randNum = (Math.floor(Math.random() * ($scope.weeksLeft.length - 1)));
        weekPicked = $scope.weeksLeft[randNum];
        $scope.weeksLeft.splice(randNum, 1);
        $scope.addToSched(weekPicked, team.team_name);
      }
    });

    // Loops through the other conference divisions, and pushes the names to an array. One of these names will be randomly selected as the division that the other team will play against.
    for (var d = 0; d < 12; d+=4) {
      divisionNamesArray.push(otherDivisionOpponents[d].division_name);
    }

    var randDivPicker = (Math.floor(Math.random() * (divisionNamesArray.length)));
    var chosenDivision = divisionNamesArray[randDivPicker];
    otherDivisionOpponents.forEach(function(team) {
      if (team.division_name === chosenDivision) {
        divisionChosenArray.push(team);
      }
    });

    divisionChosenArray.forEach(function(team) {
      randNum = (Math.floor(Math.random() * ($scope.weeksLeft.length - 1)));
      weekPicked = $scope.weeksLeft[randNum];
      $scope.weeksLeft.splice(randNum, 1);
      $scope.addToSched(weekPicked, team.team_name);
    });

    for (var l = 0; l < 16; l+=4) {
      otherConfDivNamesArray.push(otherConferenceOpponents[l].division_name);
    }

    var randOtherConfPicker = (Math.floor(Math.random() * (otherConfDivNamesArray.length - 1)));
    var chosenDivisionOtherConf = otherConfDivNamesArray[randOtherConfPicker];
    otherConferenceOpponents.forEach(function(team) {
      if (team.division_name === chosenDivisionOtherConf) {
        otherConfDivChosenArray.push(team);
      }
    });

    otherConfDivChosenArray.forEach(function(team) {
      randNum = (Math.floor(Math.random() * ($scope.weeksLeft.length - 1)));
      weekPicked = $scope.weeksLeft[randNum];
      $scope.weeksLeft.splice(randNum, 1);
      $scope.addToSched(weekPicked, team.team_name);
    });

    nflInfo.forEach(function(team) {
      if ((team.conference_name === $scope.mainTeam.conference_name) && (team.division_name !== $scope.mainTeam.division_name) && (team.division_name !== chosenDivision)) {
        conferenceOpponents.push(team);
      }
    });

    for (var x = 0; x < 2; x++) {
      randNum = (Math.floor(Math.random() * ($scope.weeksLeft.length - 1)));
      randTeamNum = (Math.floor(Math.random() * (conferenceOpponents.length - 1)));
      weekPicked = $scope.weeksLeft[randNum];
      teamPicked = conferenceOpponents[randTeamNum];
      $scope.weeksLeft.splice(randNum, 1);
      $scope.addToSched(weekPicked, teamPicked.team_name);
      conferenceOpponents.splice(randTeamNum, 1);
    }

    $scope.team_name = $scope.mainTeam.team_name;

    function compare(a,b) {
      if (a.week < b.week)
        return -1;
      if (a.week > b.week)
        return 1;
      return 0;
    }

    $scope.schedule.sort(compare);

    $scope.teams[$scope.team_name] = new Schedule($scope.team_name, $scope.mainTeam.division_name, $scope.schedule);
  };
});

app.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state({
      name : 'all_teams',
      url : '/teams/nfl',
      templateUrl: 'all_teams.html',
      controller: 'AllTeamsController'
    })
    .state({
      name : 'schedule_generator',
      url : '/create_schedule/{team}',
      templateUrl: 'sched_gen.html',
      controller: 'ScheduleGeneratorController'
    });
});
