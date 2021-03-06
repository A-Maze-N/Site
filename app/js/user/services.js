angular.module('profile.services', []).
    factory('UserProfile', ['$resource', 'config', function ($resource, config) {
        return $resource(config.service.url + '/user/:uri', {}, {
            updateBasic: {method: 'POST', params: {uri: "updateBasic"}, isArray: false},
            updateExternal: {method: 'POST', params: {uri: "updateSns"}, isArray: false}
        });
    }])
;