'use strict';

/* Services */

angular.module('sound.services', ['ngResource'])
    .factory('Stream', ['$resource', 'config', function ($resource, config) {
        return $resource(config.service.url + '/sound/streams/:filter/:value', {}, {
            stream: {method: 'POST', params: { pageNum: 0, soundsPerPage: config.soundsPerPage}, isArray: true}
        });
    }
    ])
    .factory('Sound', ['$resource', 'config', function ($resource, config) {
        return $resource(config.service.url + '/sound/:sound/:userAlias/:action', {}, {
            load: {method: 'GET', params: {sound: 'current'}, isArray: false},
            loadData: {method: 'POST', params: { action: 'data'}, isArray: true},
            delete: {method: 'DELETE', params: {sound: 'current'}, isArray: false},
            save: {method: 'PUT', params: {}, isArray: false},
            update: {method: 'POST', params: {}, isArray: false },
            getSoundToUpload: {method: 'GET', params: {}, isArray: false},
            hasNew: {method: 'GET', params: {sound: 'hasNew'}, isArray: false},
            hasNewCreated: {method: 'GET', params: {sound: 'hasNewCreated'}, isArray: false}
        });
    }
    ])
    .factory('SoundUtilService', ['User', 'UserService','config', function (User, UserService, config) {
        return {
            buildSound: function (sound) {
                var newSound = {
                    id: sound.id,
                    alias: sound.profile.alias,
                    poster: sound.profile.poster.url,
                    posterPosterId: sound.profile.posterId,
                    title: {alias: sound.profile.name, route: 'index.html#/sound/' + sound.profile.alias, readonly: true},
                    owner: {alias: sound.profile.owner.profile.alias, route: config.userStreamPath + sound.profile.owner.profile.alias},
                    description: {context: sound.profile.description, readonly: true},
                    tags: sound.tags,
                    soundSocial: sound.soundSocial,
                    soundUserPrefer: sound.userPrefer,
                    status: {value: sound.profile.status, readonly: true},
                    color: UserService.getColor(),
                    comment: {mode: sound.profile.commentMode, readonly: true},
                    createdTime: sound.profile.createdTime,
                    priority: sound.profile.priority,
                    duration: sound.profile.duration,
                    played: false,
                    downloadable: sound.profile.downloadable
                };

                return  newSound;
            }
        };
    }])
    .factory('SoundSocial', ['$resource', 'config', function ($resource, config) {
        return $resource(config.service.url + '/soundActivity/:action/:sound/:commentId', {}, {
            play: {method: 'PUT', params: {action: 'play'}, isArray: false},
            like: {method: 'PUT', params: {action: 'like'}, isArray: false},
            unlike: {method: 'DELETE', params: {action: 'like'}, isArray: false},
            repost: {method: 'PUT', params: {action: 'repost'}, isArray: false},
            unrepost: {method: 'DELETE', params: {action: 'repost'}, isArray: false},
            comment: {method: 'PUT', params: {action: 'comment'}, isArray: false},
            uncomment: {method: 'DELETE', params: {action: 'comment'}, isArray: false},
            recommandSounds: {method: 'GET', params: {action:'recommand', sound: 'sounds', pageNum:1, pageSize: 5}, isArray: true}
        });
    }
    ])
    .factory('SoundSocialList', ['$resource', 'config', function ($resource, config) {
        return $resource(config.service.url + '/soundActivity/:sound/:action', {}, {
            comment: {method: 'GET', params: {action: 'comments', commentsPerPage: config.commentsPerPage}, isArray: true},
            likes: {method: 'GET', params: {action: 'likes', pageNum: 0, perPage: config.likesPerPage}, isArray: true},
            reposts: {method: 'GET', params: {action: 'reposts', pageNum: 0, perPage: config.repostsPerPage}, isArray: true}
        });
    }
    ])
;

angular.module('tag.services', []).
    factory('Tag', ['$resource', 'config', function ($resource, config) {
        return $resource(config.service.url + '/tag/:path/:action/:tag', {}, {
            query: {method: 'GET', params: {path: 'list'}, isArray: false},
            attach: {method: 'PUT', params: {path: 'sound'}, isArray: true},
            dettach: {method: 'DELETE', params: {path: 'sound'}, isArray: false},
            curated: {method: 'GET', params: {path:'list', action:'curated'}, isArray: true},
            categories: {method: 'GET', params: {path:'list', action:'categories'}, isArray: true}
        });
    }])
;

angular.module('storage.services', []).
    factory('Storage', ['$resource', 'config', function ($resource, config) {
        return $resource(config.service.url + '/storageV2/:action/:type/:key', {}, {
            getSoundUploadURL: {method: 'GET', params: { action: 'upload', type: 'sound'}, isArray: false},
            getImageUploadURL: {method: 'GET', params: { action: 'upload', type: 'image'}, isArray: false},
            getDownloadURL: {method: 'GET', params: { action: 'download'}, isArray: false},
            upload: {method: 'POST', params: { action: 'upload'}, isArray: false}
        });
    }])

angular.module('util.services', []).
    factory('Util', ['$http', 'config', function ($http, config) {
        return {
            checkLocation: function() {
                $http.jsonp('http://int.dpool.sina.com.cn/iplookup/iplookup.php?format=js').
                    success(function(data, status, headers, config) {
                        console.log(data);
                    }).
                    error(function(data, status, headers, config) {
                        $scope.error = true;
                    });
            }
        };
    }])
;

