'use strict';

/* Controllers */

angular.module('header.controllers', [])
    .controller('headerCtrl', ['$scope', '$location', '$routeParams', 'User', 'UserService','WooicePlayer', function ($scope, $location, $routeParams, User, UserService, WooicePlayer) {
        $scope.q = $routeParams.q;
        $scope.userAlias = UserService.getCurUserAlias();

        $scope.playMode = UserService.getPlayMode();
        $scope.playModes = ['顺序播放', '单曲循环', '随机播放', '播完即止'];

        $scope.logout = function () {
            User.logout({}, function () {
                UserService.setupUser(null);
                $.globalMessenger().post({
                    message: "感谢您的使用",
                    hideAfter: 10,
                    showCloseButton: true
                });

                $.removeCookie('curSound');
                $location.path('/guest/login');
            })
        };

        var curSound = WooicePlayer.getCurSound();
        if (curSound)
        {
            $('#sound_player_button_global').addClass('icon-pause');
        }

        $scope.goto = function (uri) {
            $location.url(uri);
        }

        $scope.togglePause = function (id) {
            WooicePlayer.toggle({});
        };

        $scope.playPre = function (id) {
            WooicePlayer.playSibling('pre');
        };

        $scope.playNext = function (id) {
            WooicePlayer.playSibling('next');
        };

        $scope.changePlayStyle = function() {
            $scope.playMode = ++$scope.playMode %  $scope.playModes.length;
            UserService.setPlayMode($scope.playMode);
        }

        $('#search_box').bind('keyup', function (event) {
            if (event.keyCode == 13) {
                $scope.$apply(function () {
                    $location.url('/stream/match/' + $scope.q);
                });
            }
        });

    }]);