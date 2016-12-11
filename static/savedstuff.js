var app = angular.module('nfl_app', ['ui.router', 'ngCookies']);

app.factory("NFL_Api", function factoryFunction($http, $rootScope) {
  var service = {};
  service.displayAllTeams = function() {
    return $http({
      url: '/api/all_teams'
    });
  };
  service.callForDivisionTeams = function(div_name) {
    return $http({
      url: '/api/div_search/' + div_name
    });
  };

  return service;
});

app.controller('AllTeamsController', function($scope, NFL_Api) {
  NFL_Api.displayAllTeams().success(function(results) {
    $scope.allTeams = results;
    $scope.AFClist = [];
    $scope.NFClist = [];
    $scope.sortTeams();
  });

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

class Schedule {
  constructor(name, division, schedule) {
    this.name = name;
    this.division = division;
    this.schedule = schedule;
  }
}

app.controller('ScheduleGeneratorController', function($scope, NFL_Api, $rootScope, $cookies) {
  $scope.createSchedule = function() {
  NFL_Api.displayAllTeams().success(function(res) {
    $rootScope.nflInfo = res;

    $scope.getDivOpps = function(div_name, teamToCreate) {
      // NFL_Api.callForDivisionTeams(div_name).success(function(res) {
      //   $scope.divOpps = res;
      // });

      $scope.addToSched = function(week, opp) {
        $scope.schedule.push({'week': week, 'opponent': opp});
      };

      $scope.scheduleConfOpps = function (teamToCreate, div_name) {
        var conf = teamToCreate.conference_name;
        var confTeams = [];
        var finalConfTeams = [];
        var divArray = [];
        var randDivPicker;
        var otherDivTeams = [];
        $scope.teams = {};
        var team_name = teamToCreate.team_name;

        $rootScope.nflInfo.forEach(function (team) {
          if ((team.conference_name === conf) && (team.division_name !== div_name)) {
            confTeams.push(team);
          }
        });

        for (var d = 0; d < 8; d+=4) {
          divArray.push(confTeams[d].division_name);
        }

        randDivPicker = (Math.floor(Math.random() * (divArray.length - 1)));
        var chosenDivision = divArray[randDivPicker];

        $rootScope.nflInfo.forEach(function (team) {
          if ((team.conference_name === conf) && (team.division_name === chosenDivision)) {
            otherDivTeams.push(team);
          }
        });

        for (var e = 0; e < 4; e++) {
          var randNewDivNum = (Math.floor(Math.random() * (otherDivTeams.length - 1)));
          randDivNum = (Math.floor(Math.random() * ($scope.weeksLeft.length - 1)));
          var newRandyDiv = $scope.weeksLeft[randDivNum];
          var newDivRand = otherDivTeams[randNewDivNum];
          $scope.picked.push(randDivNum);
          $scope.weeksLeft.splice(randDivNum, 1);
          // otherDivTeams.splice(randNewDivNum, 1);
          $scope.addToSched(newRandyDiv, newDivRand.team_name);
        }

        $rootScope.nflInfo.forEach(function (team) {
          if ((team.conference_name === conf) && (team.division_name !== div_name) &&       (team.division_name !== chosenDivision)) {
            finalConfTeams.push(team);
          }
        });

        var randDivNum;
        var randConfNum;
        for (var c = 0; c < 2; c++) {
          randDivNum = (Math.floor(Math.random() * ($scope.weeksLeft.length - 1)));
          randConfNum = (Math.floor(Math.random() * (finalConfTeams.length - 1)));
          var newRandDiv = $scope.weeksLeft[randDivNum];
          var newRandConf = finalConfTeams[randConfNum];
          $scope.picked.push(randDivNum);
          $scope.weeksLeft.splice(randDivNum, 1);
          finalConfTeams.splice(randConfNum, 1);
          $scope.addToSched(newRandDiv, newRandConf.team_name);
        }
        $scope.teams[team_name] = new Schedule(teamToCreate.team_name, div_name, $scope.schedule);
        console.log($scope.teams);
      };

      $scope.divOpps = $rootScope.nflInfo;
      $scope.divOpps.forEach(function(team) {
        if (teamToCreate.team_name === team.team_name) {
          $scope.divOpps.splice(team, 1);
        }
        else {
          if (team.division_name === div_name) {
            var randDivNum;
            for (var r = 0; r < 2; r++) {
              randDivNum = (Math.floor(Math.random() * ($scope.weeksLeft.length - 1)));
              var newRandDiv = $scope.weeksLeft[randDivNum];
              $scope.picked.push(randDivNum);
              $scope.weeksLeft.splice(randDivNum, 1);
              $scope.addToSched(newRandDiv, team.team_name);
            }
          }

        }
      });
      $scope.scheduleConfOpps(teamToCreate, div_name);
    };
        $scope.schedule = [];
        $scope.weeksLeft = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
        $scope.picked = [];
        for (var i = 0; i < $rootScope.nflInfo.length; i++) {
            var teamInfo = $rootScope.nflInfo[i];
            var team_name = $rootScope.nflInfo[i].team_name;
            var division = $rootScope.nflInfo[i].division_name;
            console.log(i);
            $scope.getDivOpps(division, teamInfo);
            $scope.schedule = [];
            $scope.weeksLeft = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
            $scope.picked = [];
        }
  });
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
      url : '/create_schedule',
      templateUrl: 'sched_gen.html',
      controller: 'ScheduleGeneratorController'
    });
});
