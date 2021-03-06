'use strict';

angular.module('sound.controllers', [])
    .controller('soundDetailCtrl', ['$scope', '$window', 'config', '$routeParams', 'Sound', 'SoundUtilService', 'Storage', 'SoundSocial', 'SoundSocialList', 'UserService',
        '$location', '$anchorScroll', 'SoundSocialProSocial', 'SoundProSocial', 'UserSocial', 'Tag', 'WooicePlayer', 'WooiceWaver', 'storage',
        function ($scope, $window, config, $routeParams, Sound, SoundUtilService, Storage, SoundSocial, SoundSocialList, UserService, $location, $anchorScroll, SoundSocialProSocial, SoundProSocial, UserSocial, Tag, WooicePlayer, WooiceWaver, storage) {
            $scope.userService = UserService;
            $scope.config = config;
            $scope.mode = "default";
            if ($scope.$parent.mode) {
                $scope.mode = $scope.$parent.mode;
            }

            if ($scope.mode == "default") {
                var rewriteF5 = function (e) {
                    if (e.which === 116) {
                        $scope.loadSound();
                        return false;
                    }
                    if (e.which === 82 && e.ctrlKey) {
                        $scope.loadSound();
                        return false;
                    }
                };

                $(document).bind('keydown keyup', rewriteF5);
                $scope.$on('$destroy', function (e) {
                    $(document).unbind('keydown keyup', rewriteF5);
                });

                var scrollComments = $.proxy(function () {
                    if ($(window).height() + $(window).scrollTop() >= ($('#sound_streams').height())) {
                        $scope.reloadTarget();
                    }
                }, this);
                $(window).scroll(scrollComments);
                $scope.$on('$destroy', function (e) {
                    $(window).off("scroll", scrollComments);
                });
            }

            $scope.comments = [];
            $scope.commentsInsound = [];
            $scope.commentPageNum = 1;
            $scope.likes = [];
            $scope.likePageNum = 1;
            $scope.reposts = [];
            $scope.repostPageNum = 1;
            $scope.plays = [];
            $scope.playPageNum = 1;
            $scope.visits = [];
            $scope.visitPageNum = 1;
            $scope.loadClass = 'hide';

            $scope.newComment = {};
            $scope.newTag = "";

            $scope.togglePause = function (id) {
                WooicePlayer.toggle({
                    id: id
                });
            };

            $scope.toggleLike = function (id) {
                var sound = $scope.sound;
                if (sound.soundUserPrefer.like) {
                    var likesCount = SoundSocial.unlike({sound: sound.id}, null, function (count) {
                        sound.soundUserPrefer.like = 0;
                        sound.soundSocial.likesCount = parseInt(likesCount.liked);
                    });
                }
                else {
                    var likesCount = SoundSocial.like({sound: sound.id}, null, function (count) {
                        sound.soundUserPrefer.like = 1;
                        sound.soundSocial.likesCount = parseInt(likesCount.liked);
                    });
                }
                return false;
            };

            $scope.togglePromote = function () {
                if ($scope.sound.priority && $scope.sound.priority == 1) {
                    SoundProSocial.demote({soundId: $scope.sound.id}, null, function () {
                        $scope.sound.priority = 0;
                    });
                }
                else {
                    SoundProSocial.promote({soundId: $scope.sound.id}, null, function () {
                        $scope.sound.priority = 1;
                    });
                }
            };

            $scope.download = function () {
                var sound = SoundSocial.play({sound: $scope.sound.id}, null, function (count) {
                    var downloadUrl = sound.url + "&download/" + $scope.sound.alias + ".mp3";

                    var downloadFrame = document.createElement("iframe");
                    downloadFrame.src = downloadUrl;
                    downloadFrame.style.display = "none";
                    document.body.appendChild(downloadFrame);
                });
            }

            $scope.onImageHavor = function () {
                $("#sound_comment_in_sound_minor_" + this.comment.commentId).addClass("hide");
                $("#sound_comment_in_sound_" + this.comment.commentId).removeClass("hide");
            };

            $scope.comment = function () {
                $scope.newComment.pointAt = $('#sound_comment_point_' + $scope.sound.id).val();
                $scope.newComment.toUserAlias = $('#sound_comment_to_' + $scope.sound.id).val();
                var result = SoundSocial.comment({sound: $scope.sound.id}, $scope.newComment, function (count) {
                    $scope.sound.soundSocial.commentsCount = result.commentsCount;
                    $('#sound_commentbox_input_' + $scope.sound.id).val('');
                    $('#sound_commentbox_input_' + $scope.sound.id).attr("placeholder", "感谢您的留言!");
                    $('#sound_comment_point_' + $scope.sound.id).val(-1);

                    $scope.refreshTarget("comments");
                    loadCommentsInSound();
                });
            };

            $scope.deleteComment = function () {
                if (confirm('确定要删除这条评论吗?')) {
                    var result = SoundSocial.uncomment({sound: $scope.sound.id, commentId: this.comment.commentId}, {}, function () {
                        $.globalMessenger().post({
                            message: '评论删除成功',
                            hideAfter: 15,
                            showCloseButton: true
                        });

                        $scope.refreshTarget("comments");
                        loadCommentsInSound();
                        $scope.sound.soundSocial.commentsCount = result.commentsCount;
                    });
                }
            };

            $scope.refreshTarget = function (target) {
                $scope.target = target;
                $(".tab_li").removeClass("active");
                $("#" + target + "_li").addClass("active");
                $scope.reloadTarget(true);
            };

            $scope.follow = function () {
                if (this.repost.owner.userPrefer.following) {
                    var result = UserSocial.unfollow({toUserAlias: this.repost.owner.profile.alias}, null, function (count) {
                        this.repost.owner.userPrefer.following = false;
                    });
                }
                else {
                    var result = UserSocial.follow({ toUserAlias: this.repost.owner.profile.alias}, null, function (count) {
                        this.repost.owner.userPrefer.following = true;
                    });
                }
            };

            $scope.toggleRepost = function (id) {
                var sound = $scope.sound;
                if (sound.soundUserPrefer.repost) {
                    var repostsCount = SoundSocial.unrepost({sound: sound.id}, null, function (count) {
                        sound.soundUserPrefer.repost = 0;
                        sound.soundUserPrefer.repostWording = "转";
                        sound.soundSocial.reportsCount = parseInt(repostsCount.reposted);
                    });
                }
                else {
                    var repostsCount = SoundSocial.repost({sound: sound.id}, null, function (count) {
                        sound.soundUserPrefer.repost = 1;
                        sound.soundUserPrefer.repostWording = "";
                        sound.soundSocial.reportsCount = parseInt(repostsCount.reposted);
                    });
                }
                return false;
            };

            $scope.reportSound = function () {
                this.sound.reported = true;
                var result = SoundSocial.report({sound: this.sound.id}, {}, function () {
                    if (result.invalid) {
                        $location.url('/stream');
                        $.globalMessenger().post({
                            message: "声音" + this.sound.alias + "被大量举报，暂时无法继续访问。",
                            hideAfter: 15,
                            showCloseButton: true
                        });
                    }
                });
            }

            $scope.reply = function () {
                this.comment.showReply = !this.comment.showReply;
            };

            $scope.replyComment = function () {
                var postData = {};
                postData.comment = this.comment.reply;
                postData.pointAt = this.comment.pointAt;
                postData.toUserAlias = this.comment.owner.profile.alias;
                var result = SoundSocial.comment({sound: $scope.sound.id}, postData, $.proxy(function (count) {
                    $scope.sound.soundSocial.commentsCount = result.commentsCount;
                    $('#sound_comment_reply_input_' + this.$index).val('');
                    $('#sound_comment_reply_input_' + this.$index).attr("placeholder", "感谢您的回复!");

                    $scope.refreshTarget("comments");
                }, this));
            };

            $scope.replyInSound = function () {
                $('#sound_commentbox_' + $scope.sound.id).show();
                $('#sound_commentbox_input_' + $scope.sound.id).attr("placeholder", ("@" + this.comment.owner.profile.alias + ": ..."));
                $('#sound_commentbox_input_' + $scope.sound.id).focus();
                $('#sound_comment_to_' + $scope.sound.id).val(this.comment.owner.profile.alias);
            };

            $scope.editSoundAlias = function () {
                if (!$scope.sound.title.readonly && $scope.sound.id) {
                    var postData = {};
                    postData.name = $scope.sound.title.alias;
                    var sound = Sound.update({sound: $scope.sound.id}, postData, function () {
                        $scope.sound.alias = sound.profile.alias;
                        $scope.sound.title.route = '#/sound/' + $scope.sound.alias;
                        WooicePlayer.updateAlias({
                            id: $scope.sound.id,
                            alias: $scope.sound.alias
                        });
                        $location.url('/sound/' + sound.profile.alias);
                    });
                }
                $scope.sound.title.readonly = !$scope.sound.title.readonly;
            };

            $scope.editSoundDescription = function () {
                if (!$scope.sound.description.readonly && $scope.sound.id) {
                    var postData = {};
                    postData.description = $scope.sound.description.context;
                    var profile = Sound.update({sound: $scope.sound.id}, postData, function () {
                    });
                }
                $scope.sound.description.readonly = !$scope.sound.description.readonly;
            };

            $scope.editSoundStatus = function () {
                if (!$scope.sound.status.readonly && $scope.sound.id) {
                    var postData = {};
                    postData.status = $scope.sound.status.value;
                    var profile = Sound.update({sound: $scope.sound.id}, postData, function () {
                    });
                }
                $scope.sound.status.readonly = !$scope.sound.status.readonly;
            };

            $scope.editCommentMode = function () {
                if (!$scope.sound.comment.readonly && $scope.sound.id) {
                    var postData = {};
                    postData.commentMode = $scope.sound.comment.mode;
                    var profile = Sound.update({sound: $scope.sound.id}, postData, function () {
                    });
                }
                $scope.sound.comment.readonly = !$scope.sound.comment.readonly;
            };

            $scope.dettachTag = function () {
                Tag.dettach({action: $scope.sound.id, tag: this.tag.label}, {},
                    $.proxy(function () {
                        $scope.sound.tags = $.grep($scope.sound.tags, $.proxy(function (value) {
                            return value != this.tag;
                        }, this));
                    }, this));
            };

            $scope.uploadPosterUrl = "http://up.qiniu.com";
            $scope.isUploadingPoster = false;

            $scope.localLoad = function () {
                var sound = WooicePlayer.loadFromCache({
                    alias: $routeParams.soundId
                });

                if (sound) {
                    $scope.sound = sound;
                    $scope.$apply();

                    loadSoundData();

                    if ($scope.mode == 'default') {
                        $scope.reloadTarget();

                        var curSound = WooicePlayer.getCurSound();
                        if (curSound) {
                            $('#sound_player_button_' + curSound.id).addClass('icon-pause');
                            $('#cur_sound').attr('href', curSound.title.route);
                            $('#cur_sound').text(curSound.title.alias);
                        }
                    }

                    $('.hasTooltip').each(function () {
                        $(this).qtip({
                            content: {
                                text: $(this).next('div')
                            },
                            show: {
                                event: 'click'
                            },
                            hide: {
                                event: 'unfocus'
                            },
                            position: {
                                at: 'bottom left',
                                target: $(this)
                            },
                            style: {
                                def: false,
                                classes: 'tip qtip-rounded qtip-bootstrap'
                            }
                        });
                    });
                    return true;
                }
                else {
                    return false;
                }
            }

            $scope.loadSound = function () {
                var sound = Sound.load({sound: $routeParams.soundId}, function () {
                    $scope.sound = SoundUtilService.buildSound(sound);

                    //TODO
                    $scope.$apply();

                    //record sound info
                    WooicePlayer.addSound($scope.sound);

                    loadSoundData();

                    loadCommentsInSound();

                    if ($scope.mode == 'default') {
                        $scope.reloadTarget();

                        var curSound = WooicePlayer.getCurSound();
                        if (curSound) {
                            $('#sound_player_button_' + curSound.id).addClass('icon-pause');
                            $('#cur_sound').attr('href', curSound.title.route);
                            $('#cur_sound').text(curSound.title.alias);
                        }
                    }

                    $('.hasTooltip').each(function () {
                        $(this).qtip({
                            content: {
                                text: $(this).next('div')
                            },
                            show: {
                                event: 'click'
                            },
                            hide: {
                                event: 'unfocus'
                            },
                            position: {
                                at: 'bottom left',
                                target: $(this)
                            },
                            style: {
                                def: false,
                                classes: 'tip qtip-rounded qtip-bootstrap'
                            }
                        });
                    });
                });
            }

            $scope.reloadTarget = function (force) {
                switch ($scope.target) {
                    case 'comments':
                        if (($scope.sound.comment.mode == 'public' || $scope.sound.comment.mode == 'closed') && $scope.sound.owner.alias !== UserService.getCurUserAlias()) {
                            return;
                        }
                        loadComments(force);
                        break;
                    case 'likes':
                        loadLikes(force);
                        break;
                    case 'reposts':
                        loadReposts(force)
                        break;
                    case 'plays':
                        if (!UserService.validateRoleUser()) {
                            loadPlays(force);
                        }
                        break;
                    case 'visits':
                        if (UserService.validateRolesPro()) {
                            loadVisits(force);
                        }
                        break;
                    default :
                        loadComments(force);
                }
            }

            $scope.changeTarget = function (target) {
                $scope.target = target;
                $scope.reloadTarget();
            }

            function loadLikes(force) {
                if (force) {
                    $scope.likes = [];
                    $scope.likePageNum = 1;
                }
                $scope.loadClass = '';
                var likes = SoundSocialList.likes({sound: $scope.sound.id, pageNum: $scope.likePageNum}, null, function () {
                    $.each(likes, function (index, like) {
                        var added = false;
                        $.each($scope.likes, function (index, addedLike) {
                            if (addedLike.owner.profile.alias === like.owner.profile.alias) {
                                added = true;
                            }
                        });

                        if (!added) {
                            like.owner.route = config.userStreamPath + like.owner.profile.alias;
                            $scope.likes.push(like);
                        }
                    });

                    $scope.loadClass = 'hide';
                    if (likes.length >= config.likesPerPage) {
                        $scope.likePageNum++;
                    }
                });
            }

            function loadPlays(force) {
                if (force) {
                    $scope.plays = [];
                    $scope.playPageNum = 1;
                }
                $scope.loadClass = '';
                var plays = SoundSocialProSocial.plays({soundId: $scope.sound.id, pageNum: $scope.likePageNum}, null, function () {
                    $.each(plays, function (index, play) {
                        var added = false;
                        $.each($scope.plays, function (index, addedPlay) {
                            if (addedPlay.owner.profile.alias === play.owner.profile.alias) {
                                added = true;
                            }
                        });

                        if (!added) {
                            play.owner.route = config.userStreamPath + play.owner.profile.alias;
                            $scope.plays.push(play);
                        }

                    });

                    $scope.loadClass = 'hide';
                    if (plays.length >= config.playsPerPage) {
                        $scope.playPageNum++;
                    }
                });
            }

            function loadVisits(force) {
                if (force) {
                    $scope.visits = [];
                    $scope.visitPageNum = 1;
                }
                $scope.loadClass = '';
                var visits = SoundSocialProSocial.visits({soundId: $scope.sound.id, pageNum: $scope.likePageNum}, null, function () {
                    $.each(visits, function (index, visit) {
                        var added = false;
                        $.each($scope.visits, function (index, addedVisit) {
                            if (addedVisit.owner.profile.alias === visit.owner.profile.alias) {
                                added = true;
                            }
                        });

                        if (!added) {
                            visit.owner.route = config.userStreamPath + visit.owner.profile.alias;
                            $scope.visits.push(visit);
                        }

                    });

                    $scope.loadClass = 'hide';
                    if (visits.length >= config.visitsPerPage) {
                        $scope.visitPageNum++;
                    }
                });
            }

            function loadReposts(force) {
                if (force) {
                    $scope.reposts = [];
                    $scope.repostPageNum = 1;
                }

                $scope.loadClass = '';
                var reposts = SoundSocialList.reposts({sound: $scope.sound.id, pageNum: $scope.repostPageNum}, null, function () {
                    $.each(reposts, function (index, repost) {
                        var added = false;
                        $.each($scope.reposts, function (index, addedRepost) {
                            if (addedRepost.owner.profile.alias === repost.owner.profile.alias) {
                                added = true;
                            }
                        });

                        if (!added) {
                            repost.owner.route = config.userStreamPath + repost.owner.profile.alias;
                            $scope.reposts.push(repost);
                        }
                    });

                    $scope.loadClass = 'hide';
                    if (reposts.length >= config.repostsPerPage) {
                        $scope.repostPageNum++;
                    }
                });
            }

            function loadCommentsInSound() {
                $scope.commentsInsound = [];
                var comments = SoundSocialList.comment({sound: $scope.sound.id, justInSound: true}, function () {
                    var canvasWidth = $("#sound_wave_" + $scope.sound.id).width();
                    $.each(comments, function (index, comment) {
                        comment.showReply = false;
                        comment.owner.route = config.userStreamPath + comment.owner.profile.alias;
                        comment.top = '70%';
                        comment.left = (comment.pointAt * canvasWidth) / ($scope.sound.duration) + "px";

                        if (!comment.owner.profile.avatorUrl) {
                            comment.owner.profile.avatorUrl = "img/default_avatar.png";
                        }
                        else {
                            var avatorUrl = $.cookie(comment.owner.profile.alias + '_avator_small_url');

                            if (avatorUrl) {
                                comment.owner.profile.avatorUrl = avatorUrl;
                            }
                            else {
                                $.cookie(comment.owner.profile.alias + '_avator_small_url', comment.owner.profile.avatorUrl, {expires: config.imageAccessExpires});
                            }
                        }
                        $scope.commentsInsound.push(comment);

                        $scope.$apply();

                        $('#sound_comment_in_sound_' + comment.commentId).mouseleave(function () {
                            $(this).addClass('hide');
                            $("#sound_comment_in_sound_minor_" + comment.commentId).removeClass("hide");
                        });
                    });

                });
            }

            function loadComments(force) {
                if (force) {
                    $scope.comments = [];
                    $scope.commentPageNum = 1;
                }
                $scope.loadClass = '';
                var comments = SoundSocialList.comment({sound: $scope.sound.id, pageNum: $scope.commentPageNum}, function () {
                    $.each(comments, function (index, comment) {
                        var added = false;
                        $.each($scope.comments, function (index, addedComment) {
                            if (addedComment.commentId == comment.commentId) {
                                added = true;
                            }
                        });

                        if (!added) {
                            comment.showReply = false;
                            comment.owner.route = config.userStreamPath + comment.owner.profile.alias;
                            if (comment.to) {
                                comment.to.route = config.userStreamPath + comment.to.profile.alias;
                            }
                            if (!comment.owner.profile.avatorUrl) {
                                comment.owner.profile.avatorUrl = "img/default_avatar.png";
                            }
                            else {
                                var avatorUrl = $.cookie(comment.owner.profile.alias + '_avator_small_url');

                                if (avatorUrl) {
                                    comment.owner.profile.avatorUrl = avatorUrl;
                                }
                                else {
                                    $.cookie(comment.owner.profile.alias + '_avator_small_url', comment.owner.profile.avatorUrl, {expires: config.imageAccessExpires});
                                }
                            }
                            $scope.comments.push(comment);
                            $scope.$apply();
                        }
                    });

                    $scope.loadClass = 'hide';
                    if (comments.length >= config.commentsPerPage) {
                        $scope.commentPageNum++;
                    }
                });
            }

            function loadSoundData() {
                var sound = storage.get($scope.sound.id + "_wave");
                if (sound) {
                    sound.color = UserService.getColor();
                    sound.commentable = $scope.sound.commentMode !== 'closed';
                    WooiceWaver.render(sound);

                    var soundPlayStatus = storage.get($scope.sound.id + "_player");
                    if (soundPlayStatus && soundPlayStatus.playing)
                    {
                        WooicePlayer.play({id: $scope.sound.id});
                    }
                }
                else {
                    var toLoadList = [];
                    toLoadList.push($scope.sound.id);
                    var newDatas = Sound.loadData({}, toLoadList, function () {
                        $.each(newDatas, function (index, oneData) {
                            //render wave
                            WooiceWaver.render(
                                {
                                    id: oneData.soundId,
                                    waveData: oneData.wave[0],
                                    duration: oneData.duration * 1000,
                                    color: UserService.getColor(),
                                    commentable: oneData.commentMode !== 'closed',
                                    position: 0
                                }
                            );

                            storage.set(oneData.soundId + "_wave", {
                                id: oneData.soundId,
                                waveData: oneData.wave[0],
                                duration: oneData.duration * 1000,
                                position: 0
                            });
                            oneData.wave = null;
                        });
                    });
                }

                loadCommentsInSound();
            }

            $scope.$parent.$on("$includeContentLoaded", function (event) {
                if (event.currentScope.$id != event.targetScope.$id) {
                    return;
                }
                if (!$scope.localLoad()) {
                    $scope.loadSound();
                }
            });

            if ($scope.mode == 'default') {
                $('#poster_upload').change(function () {
                    var oFReader = new FileReader();
                    oFReader.onload = function (oFREvent) {
                        $("#poster_img").attr('src', oFREvent.target.result);
                    };
                    oFReader.readAsDataURL(this.files[0]);
                });

                $('#poster_upload').fileupload({
                    url: $scope.uploadPosterUrl,
                    dataType: 'json',
                    acceptFileTypes: /\.(gif|jpg|jpeg|tiff|png)$/i,
                    dropZone: null,

                    add: function (e, data) {
                        if (!(/\.(gif|jpg|jpeg|tiff|png)$/i).test(data.files[0].name)) {
                            $.globalMessenger().post({
                                message: '您上传的海报图片可能不正确，请上传以下格式中的一种:gif, jpg, jpeg, tiff, png。',
                                hideAfter: 15,
                                showCloseButton: true
                            });
                            return;
                        }
                        if (data.files[0].size > 10000000) {
                            $.globalMessenger().post({
                                message: '您上传的文件过大，请上传小于10MB的海报图片。',
                                hideAfter: 15,
                                showCloseButton: true
                            });
                            return;
                        }

                        if (!$scope.sound.posterPosterId) {
                            $scope.sound.posterPosterId = new Date().getTime();
                        }
                        $scope.posterInfo = Storage.getImageUploadURL({key: $scope.sound.posterPosterId}, function () {
                            data.formData = {key: $scope.sound.posterPosterId, token: $scope.posterInfo.token};
                            data.submit();
                        });
                    },
                    submit: function (e, data) {
                        $scope.isUploadingPoster = true;
                        $('#cancel_img_upload').click(function () {
                            data.abort();
                            $scope.$apply(function () {
                                $scope.isUploadingPoster = false;
                            });
                        });
                    },
                    progress: function (e, data) {
                        var progress = parseInt(data.loaded / data.total * 100, 10);
                        $scope.$apply(function () {
                            $scope.imgUploadMsg = '已上传' + progress + '%';
                        });
                    },
                    send: function (e, data) {
                        $scope.imgUploadMsgClass = "text-info";
                        $scope.imgUploadMsg = '已上传0%';
                    },
                    done: function (e, data) {
                        var soundProfile = {};
                        soundProfile.poster = {};
                        soundProfile.poster.posterId = $scope.sound.posterPosterId;
                        soundProfile.poster.extension = $scope.sound.posterExtension;
                        Sound.update({sound: $scope.sound.id}, soundProfile, function (count) {
                            $scope.isUploadingPoster = false;
                            $scope.imgUploadMsgClass = "hide";
                            $.globalMessenger().post({
                                message: "声音海报更新成功！",
                                hideAfter: 10,
                                showCloseButton: true
                            });
                        });
                    },
                    fail: function (e, data) {
                        $scope.isUploadingPoster = false;
                        if (data.errorThrown === 'abort') {
                            $scope.imgUploadMsgClass = "text-success";
                            $scope.imgUploadMsg = '海报上传已取消。';
                        }
                        else {
                            $.globalMessenger().post({
                                message: "海报图片上传失败，请稍后再试。",
                                hideAfter: 10,
                                showCloseButton: true
                            });
                        }
                    }
                });
            }
        }])
;

