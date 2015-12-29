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
    "bundle!dependencies/services/medium-insert_lib#module",
    "text!../templates/preview.html",
    "text!../templates/digest.html",
    "i18n!../nls/app",
    "./DigestForm",
    "./ViewSetting",
    "./IActions",
    "./Comment",
    "dijit/TooltipDialog",
    "bundle!dependencies/services/like_srv",
    "bundle!dependencies/services/favourite_srv"
], function(on, dom, topic, focusUtil, popup, domClass, event, domStyle, domGeom, domConstruct, Class,
    qString, ITemplated, ItemsControl, MediumInsert, template, digestItem, nlsApp,
    DigestForm, ViewSetting, IActions, Comment, TooltipDialog, likeSrv, favouriteSrv) {
    var Preview = Class.declare({
        "-parent-": ItemsControl,
        "-interfaces-": [ITemplated, IActions],
        "-protected-": {
            "-fields-": {
                templateString: template,
                baseClass: "preview",
                fontAwesome: FontAwesome,
                hasSetting: false,
                mainLayout: null,
                nls: nlsApp,
                blogData: null,
                intervalTime: null,
                lastTime: null
            },

            "-handlers-": {
                /* centerNode_mouseUp: function() {
                    // dom.setSelectable(dom.byId(this.centerNode), true);
                    // focusUtil.focus(dom.byId(this.centerNode.id));
                    var html = this.getSelectionHtml();
                    if (html) this.createDigestTooltip(html, e);
                }*/
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
                        itemData: self.blogData
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

                initSideComments: function() {
                    var currentUser = runtime.currentUser,
                        user = {
                            id: currentUser.id,
                            name: currentUser.username,
                            avatarUrl: currentUser.avatar
                        },
                        comments = [{
                            "sectionId": "1",
                            "comments": [{
                                "authorAvatarUrl": "http://f.cl.ly/items/1W303Y360b260u3v1P0T/jon_snow_small.png",
                                "authorName": "Jon Sno",
                                "comment": "I'm Ned Stark's bastard. Related: I know nothing."
                            }, {
                                "authorAvatarUrl": "http://f.cl.ly/items/2o1a3d2f051L0V0q1p19/donald_draper.png",
                                "authorName": "Donald Draper",
                                "comment": "I need a scotch."
                            }]
                        }, {
                            "sectionId": "3",
                            "comments": [{
                                "authorAvatarUrl": "http://f.cl.ly/items/0l1j230k080S0N1P0M3e/clay-davis.png",
                                "authorName": "Senator Clay Davis",
                                "comment": "These Side Comments are incredible. Sssshhhiiiiieeeee."
                            }]
                        }];
                    this.sideComments = new SideComments(this.contentNode, user, comments);
                },

                createDigestTooltip: function(html, e) {
                    var self = this,
                        cNode = e.target,
                        span = domConstruct.create("span", {
                            "class": "digestSpan",
                            innerHTML: "...",
                            style: "border:1px solid #ccc;",
                            offsetY: e.y,
                            offsetX: e.x
                        }),
                        cDialog = new TooltipDialog({
                            style: "background:#ccc;",
                            onMouseLeave: function() {
                                popup.close(cDialog);
                            }
                        }),
                        spanDialog = new TooltipDialog({
                            style: "background:#ccc;",
                            onMouseLeave: function() {
                                popup.close(spanDialog);
                            }
                        });

                    on(span, 'mouseover', function() {
                        popup.open({
                            popup: spanDialog,
                            around: span
                        });
                    });

                    var content = html.innerHTML ? html.outerText : html;
                    if (!content || content.innerHTML === "") return;
                    var a = domConstruct.create("a", {
                        // innerHTML: "Add Notes",
                        style: "border:1px solid #ccc;cursor: pointer;text-decoration: none;outline-style: none;",
                        "class": "addNotes " + FontAwesome.addNotes,
                        // "class": "addNotes" + FontAwesome.addNotes,
                        onclick: function() {
                            var itemDom = self.createDigestForm(content);
                            domConstruct.place(span, cNode, "first");
                            spanDialog.set("content", itemDom);
                        }
                    });

                    popup.open({
                        popup: cDialog,
                        around: cNode
                    });
                    cDialog.set("content", a);
                },

                createDigestForm: function(content) {
                    var digestForm = new DigestForm({
                        title: "Create Digest",
                        mainLayout: this.mainLayout
                    });
                    digestForm.digestData = {
                        text: content
                    };
                    this.mainLayout.popup(digestForm);
                    return digestForm.itemDom;
                },

                getSelectionHtml: function() {
                    var html;
                    if (typeof window.getSelection != "undefined") {
                        var sel = window.getSelection();
                        if (sel.rangeCount) {
                            var container = domConstruct.create("div");
                            for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                                container.appendChild(sel.getRangeAt(i).cloneContents());
                            }
                            html = container;
                        }
                    } else if (typeof document.selection != "undefined") {
                        if (document.selection.type == "Text") {
                            html = document.selection.createRange().htmlText;
                        }
                    }
                    return html;
                },

                autoScroll: function(node) {
                    if (node) {
                        dojox.fx.smoothScroll({
                            node: node,
                            win: this.centerNode,
                            duration: 300
                        }).play();
                    }
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
                    "default": ["translate", "edit", "normalEdit", "preview"],
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
                    on(this.centerNode, "scroll", function() {
                        var scrollTop = self.centerNode.scrollTop;
                        var scrollLeft = self.centerNode.scrollLeft;

                        //show or display the "go to top" button
                        if (scrollTop > 200) {
                            domStyle.set(self.goTopNode, {
                                display: "block"
                            });
                        } else {
                            domStyle.set(self.goTopNode, {
                                display: "none"
                            });
                        }
                    });
                    // new MediumInsert({
                    //     selector: this.contentNode,
                    //     uploadUrl: this.uploadUrl,
                    //     deleteUrl: "/ucenter/api/v1/posts/" + this.itemData.id + "/photos?private_token=" + runtime.currentUser.token
                    // });
                    on(this.goTopNode, "click", function() {
                        domStyle.set(self.goTopNode, {
                            display: "none"
                        });
                        self.autoScroll(self.topPlaceNode);
                    });

                    on(this.prevNode, "click", function() {
                        self.mainLayout.selectItem(self.itemData.index - 1);
                    });

                    on(this.nextNode, "click", function() {
                        self.mainLayout.selectItem(self.itemData.index + 1);
                    });

                    // on(this.contentNode, "mouseup", function(e) {
                    //     var html = self.getSelectionHtml();
                    //     if (html) self.createDigestTooltip(html, e);
                    // });

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
                this.blogData = params.blogData;
                this.likersCount = params.blogData.likersCount;
                this.favsCount = params.blogData.favsCount;
                this.isLiked = params.blogData.liked;
                this.isFavourited = params.blogData.favourited;
                this.overrided(params, srcNodeRef);
                this.init();
            }
        }
    });
    return Preview;
});