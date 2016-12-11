var app = angular.module('nfl_app', ['ui.router', 'ngCookies']);

app.factory("NFL_Api", function factoryFunction($http, $rootScope) {
  var service = {};
  // Makes a call to server.py to return all NFL teams
  service.displayAllTeams = function() {
    return $http({
      url: '/api/all_teams'
    });
  };
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

  NFL_Api.displayAllTeams().success(function(res) {
    $scope.nflInfo = res;
    $scope.getTeamInfo($scope.nflInfo);
  });

  $scope.addToSched = function(week, opp) {
    $scope.schedule.push({'week': week, 'opponent': opp});
  };

  $scope.getTeamInfo = function (nflInfo) {
    nflInfo.forEach(function(team) {
      if (team.team_name === $stateParams.team) {
        $scope.mainTeam = team;
        $scope.scheduleCreator(nflInfo);
      }
    });
  };

  $scope.scheduleCreator = function(nflInfo) {
    var divisionOpponents = [];
    var otherDivisionOpponents = [];
    var randNum;
    var weekPicked;
    var otherConferenceOpponents = [];
    var divisionNamesArray = [];
    var divisionChosenArray = [];
    var conferenceOpponents = [];
    var randTeamNum;
    var teamPicked;
    $scope.teams = [];

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

    var byeRandNum = Math.floor(3 + Math.random() * 11);
    weekPicked = $scope.weeksLeft[byeRandNum];
    $scope.weeksLeft.splice(byeRandNum, 1);
    $scope.addToSched(weekPicked, 'Bye');

    divisionOpponents.forEach(function(team) {
      for (var i = 0; i < 2; i++) {
        randNum = (Math.floor(Math.random() * ($scope.weeksLeft.length - 1)));
        weekPicked = $scope.weeksLeft[randNum];
        $scope.weeksLeft.splice(randNum, 1);
        $scope.addToSched(weekPicked, team.team_name);
      }
    });

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

    for (var a = 0; a < 4; a++) {
      randNum = (Math.floor(Math.random() * ($scope.weeksLeft.length - 1)));
      weekPicked = $scope.weeksLeft[randNum];
      $scope.weeksLeft.splice(randNum, 1);
      $scope.addToSched(weekPicked, divisionChosenArray[a].team_name);
    }

    nflInfo.forEach(function(team) {
      if ((team.conference_name === $scope.mainTeam.conference_name) && (team.division_name !== $scope.mainTeam.division_name) && (team.division_name !== chosenDivision)) {
        conferenceOpponents.push(team);
      }
    });

    for (var x = 0; x < 4; x++) {
      randNum = (Math.floor(Math.random() * ($scope.weeksLeft.length - 1)));
      randTeamNum = (Math.floor(Math.random() * (conferenceOpponents.length - 1)));
      weekPicked = $scope.weeksLeft[randNum];
      teamPicked = conferenceOpponents[randTeamNum];
      $scope.weeksLeft.splice(randNum, 1);
      $scope.addToSched(weekPicked, teamPicked.team_name);
      conferenceOpponents.splice(randTeamNum, 1);
    }

    for (var c = 0; c < 2; c++) {
      randNum = (Math.floor(Math.random() * ($scope.weeksLeft.length - 1)));
      randTeamNum = (Math.floor(Math.random() * (otherConferenceOpponents.length - 1)));
      weekPicked = $scope.weeksLeft[randNum];
      teamPicked = otherConferenceOpponents[randTeamNum];
      $scope.weeksLeft.splice(randNum, 1);
      $scope.addToSched(weekPicked, teamPicked.team_name);
      otherConferenceOpponents.splice(randTeamNum, 1);
    }

    $scope.team_name = $scope.mainTeam.team_name;

    $scope.teams[$scope.team_name] = new Schedule($scope.team_name, $scope.mainTeam.division_name, $scope.schedule);
    console.log($scope.teams[$scope.team_name].schedule);
    function compare(a,b) {
      if (a.week < b.week)
        return -1;
      if (a.week > b.week)
        return 1;
      return 0;
    }

    $scope.schedule.sort(compare);
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
