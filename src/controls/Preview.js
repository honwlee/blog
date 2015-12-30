define([
    "dojo/on",
    "dojo/dom",
    "dojo/topic",
    "dijit/focus",
    "dijit/popup",
    "dojo/dom-class",
    "dojo/_base/event",
    "dojo/dom-style",
    "dojo/dom-geometry",
    "dojo/dom-construct",
    "qscript/lang/Class",
    "qscript/lang/String",
    "qfacex/dijit/ITemplated",
    "utilhub/ItemsControl",
    "utilhub/front/comctrls/IGoTop",
    "text!../templates/preview.html",
    "i18n!../nls/app",
    "./ViewSetting",
    "./IActions",
    "./IDigest",
    "./Comment",
    "dijit/TooltipDialog",
    "bundle!dependencies/services/like_srv",
    "bundle!dependencies/services/favourite_srv"
], function(on, dom, topic, focusUtil, popup, domClass, event, domStyle, domGeom, domConstruct, Class,
    qString, ITemplated, ItemsControl, IGoTop, template, nlsApp,
    ViewSetting, IActions, IDigest, Comment, TooltipDialog, likeSrv, favouriteSrv) {
    var Preview = Class.declare({
        "-parent-": ItemsControl,
        "-interfaces-": [ITemplated, IActions, IDigest, IGoTop],
        "-protected-": {
            "-fields-": {
                templateString: template,
                baseClass: "preview",
                fontAwesome: FontAwesome,
                hasSetting: false,
                mainLayout: null,
                nls: nlsApp,
                postData: null,
                intervalTime: null,
                lastTime: null
            },

            "-methods-": {
                init: function() {
                    var self = this;
                    var date = new Date();
                    this.lastTime = date.getTime();
                    this.overrided();
                    this.actions.forEach(function(action) {
                        var upperName = qString.upperFirstChar(action);
                        var a = domConstruct.create("a", {
                            "class": " btn btn-default",
                            title: nlsApp[action],
                            onclick: function() {
                                if (action === "delete") {
                                    self.deletePost(self.itemData);
                                } else {
                                    self.mainLayout.selectPage(action);
                                }
                            }
                        }, self.oprateNode);

                        domConstruct.create("i", {
                            "class": FontAwesome["blog" + upperName]
                        }, a);
                    });
                    on(this.centerNode, "click", Function.hitch(this, "closeViewSetting"));

                    var comment = new Comment({
                        itemData: self.postData
                    });
                    self.commentZoneNode.appendChild(comment.domNode);
                    on(this.likeLinkNode, "click", function() {
                        var date = new Date();
                        self.intervalTime = date.getTime() - self.lastTime;
                        self.lastTime = date.getTime();
                        if (self.isLiked && self.intervalTime > 1000) {
                            likeSrv.unlike({
                                target_id: self.itemData.id,
                                target_type: "post"
                            }).then(function() {
                                self.likeCountNode.innerHTML--;
                                self.itemData.likersCount--;
                                self.itemData.liked = false;
                                self.isLiked = false;
                                domClass.remove(self.likeLinkNode, "liked");
                            });
                        } else if (!self.isLiked && self.intervalTime > 1000) {
                            likeSrv.like({
                                target_id: self.itemData.id,
                                target_type: "post"
                            }).then(function() {
                                self.likeCountNode.innerHTML++;
                                self.itemData.likersCount++;
                                self.itemData.liked = true;
                                self.isLiked = true;
                                domClass.add(self.likeLinkNode, "liked");
                            });
                        }
                    });

                    on(this.favouriteLinkNode, "click", function() {
                        if (self.isFavourited && self.intervalTime > 1000) {
                            favouriteSrv.unFavourite({
                                target_id: self.itemData.id,
                                target_type: "post"
                            }).then(function() {
                                self.favouriteCountNode.innerHTML--;
                                self.itemData.favsCount--;
                                self.itemData.favourited = false;
                                self.isFavourited = false;
                                domClass.remove(self.favouriteLinkNode, "liked");
                            });
                        } else if (!self.isFavourited && self.intervalTime > 1000) {
                            favouriteSrv.favourite({
                                target_id: self.itemData.id,
                                target_type: "post"
                            }).then(function() {
                                self.favouriteCountNode.innerHTML++;
                                self.itemData.favsCount++;
                                self.itemData.favourited = true;
                                self.isFavourited = true;
                                domClass.add(self.favouriteLinkNode, "liked");
                            });
                        }
                    });
                },

                createTagsSpan: function(tags, container) {
                    container.innerHTML = "";
                    tags.forEach(Function.hitch(this, function(tag) {
                        var span = domConstruct.create("span", {
                            "class": "tagItem",
                            innerHTML: tag.name,
                            onClick: function() {}
                        });
                        container.appendChild(span);
                    }));
                },

                _updateContent: function(content) {
                    this.contentNode.innerHTML = "";
                    this.contentNode.innerHTML = content;
                }
            }
        },

        "-public-": {
            "-attributes-": {
                actions: {
                    writable: true,
                    "default": ["translate", "edit", "preview"],
                    setter: function(actions) {
                        var _ = this._;
                        _.actions = actions ? actions : this.actions;
                    }
                },
                uploadUrl: {
                    getter: function() {
                        return "/ubase/api/v1/photos/jq_uploader" + "?private_token=" + runtime.currentUser.token;
                    }
                },

                settingPopuped: {
                    type: Boolean,
                    "default": false,
                    setter: function(popuped) {
                        if (popuped) {
                            popup.open({
                                popup: this.settingDialog,
                                around: this.viewSettingNav
                            });
                        } else {
                            popup.close(this.settingDialog);
                        }
                        this._.settingPopuped = popuped;
                    }
                },

                itemData: {
                    type: Object,
                    setter: function(data) {
                        var content = null,
                            _ = this._;
                        _.itemData = data;
                        // if (data.username) {
                        //     this.avatarNode.title = data.username;
                        //     this.avatarNode.src = "/assets/no_avatar.png";
                        // }

                        if (data.html) {
                            this.updateContent(data.html);
                        }

                        if (data.title) {
                            this.titleNode.innerHTML = data.title;
                            this.titleNode.title = data.title;
                        }

                        var postMeta = "";
                        if (data.author) {
                            postMeta += nlsApp.writtenBy + data.author;
                        }

                        if (data.createDate) {
                            var time = (new Date(data.createDate)).toLocaleDateString();
                            postMeta += "on <time class=\"post-date\">" + time + "</time>";
                        }


                        // if (data.tags && data.tags.length) {
                        //     postMeta += " on";
                        //     data.tags.forEach(function(tag) {
                        //         postMeta += " <a href=\"javascript:void(0);\">" + tag.name + "</a>,";
                        //     });

                        //     postMeta = postMeta.substring(0, postMeta.length - 1);
                        // }

                        this.postMetaNode.innerHTML = postMeta;
                    }
                }
            },

            "-methods-": {

                start: function() {
                    var self = this;
                    this.createViewSetting();

                    this.initGoTop({
                        scrollContainer: this.centerNode
                    });

                    on(this.prevNode, "click", function() {
                        self.mainLayout.selectItem(self.itemData.index - 1);
                    });

                    on(this.nextNode, "click", function() {
                        self.mainLayout.selectItem(self.itemData.index + 1);
                    });
                },

                updateContent: function(content) {
                    this._updateContent(content);
                },

                hiddenBottom: function() {
                    domStyle.set(this.bottomNode, "display", "none");
                    this.mainNode.resize();
                },

                closeViewSetting: function() {
                    if (this.hasSetting) this.settingPopuped = false;
                },

                createViewSetting: function() {
                    this.settingDialog = new TooltipDialog({});
                    var self = this,
                        viewSetting = new ViewSetting({
                            region: "center",
                            mainLayout: this.mainLayout
                        });
                    this.settingDialog.addChild(viewSetting);
                    this.settingDialog.startup();
                    this.hasSetting = true;

                    this.viewSettingNav = domConstruct.create("a", {
                        "class": " btn btn-default",
                        title: nlsApp["viewSetting"],
                        onclick: function() {
                            self.settingPopuped = !self.settingPopuped;
                        }
                    }, self.oprateNode);

                    domConstruct.create("i", {
                        "class": FontAwesome["blogViewSetting"]
                    }, this.viewSettingNav);
                }
            }
        },

        "-constructor-": {
            initialize: function(params, srcNodeRef) {
                this.postData = params.postData;
                this.likersCount = params.postData.likersCount;
                this.favsCount = params.postData.favsCount;
                this.isLiked = params.postData.liked;
                this.isFavourited = params.postData.favourited;
                this.overrided(params, srcNodeRef);
                this.init();
            }
        }
    });
    return Preview;
});
