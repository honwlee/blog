define([
    "dojo/on",
    "dojo/query",
    "dojo/topic",
    "dojo/string",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "qscript/lang/String",
    "qscript/lang/Class",
    "qfacex/dijit/ITemplated",
    "utilhub/ItemsControl",
    "utilhub/front/comctrls/IGoTop",
    "./IActions",
    "./SlideConfig",
    "bundle!dependencies/services/blog_srv",
    "bundle!dependencies/services/post_srv",
    "text!../templates/list.html",
    "text!../templates/simpleListItem.html",
    "i18n!../nls/app"
], function(on, query, topic, stringUtil, domClass, domStyle, domConstruct, qString, Class, ITemplated,
    ItemsControl, IGoTop, IActions, SlideConfig, blogSrv, postSrv, template, simpleListItem, nlsApp) {
    var List = Class.declare({
        "-parent-": ItemsControl,
        "-interfaces-": [ITemplated, IActions, IGoTop],
        "-protected-": {
            "-fields-": {
                nls: nlsApp,
                templateString: template,
                baseClass: "list",
                postMemory: null,
                fontAwesome: FontAwesome,
                actions: ["delete", "translate", "edit", "normalEdit", "preview"],
                handleList: [],
                items: []
            },

            "-methods-": {
                init: function() {
                    this.overrided();
                    this.fillCenter();
                    this.initActions();
                    if (this.groupId) this.initNewPostBtn();
                },

                initImgPopup: function(imgObj, index) {
                    var self = this;
                    // thumb normal wallpaper
                    var url = imgObj.wallpaper || imgObj.url;
                    if (url[0] !== "/") url = "/" + url;
                    var img = query("img", self.contentPreviewNode)[index];
                    var a = domConstruct.create("a", {
                        href: runtime.hostName + url
                    }, img.parentNode);
                    a.appendChild(img);
                    $(a).magnificPopup({
                        type: 'image',
                        tLoading: 'Loading...',
                        gallery: {
                            enabled: true
                        },
                        image: {
                            verticalFit: false
                        },
                        zoom: {
                            enabled: true // By default it's false, so don't forget to enable it
                        }
                    });

                },

                initActions: function() {
                    var self = this,
                        section = domConstruct.create("section", {
                            "class": "list-preview-header clearfix"
                        }, this.headNode);
                    this.actions.forEach(function(action) {
                        var upperName = qString.upperFirstChar(action);
                        var a = domConstruct.create("a", {
                            "class": "btn btn-defautl btn-sm",
                            title: nlsApp[action] || action,
                            onclick: function() {
                                if (action === "delete") {
                                    self.deletePost(self.currentItem.data);
                                } else if (action === "slide") {
                                    self.addToSlide(self.currentItem.data);
                                } else {
                                    self.mainLayout.selectPage(action, {
                                        postData: self.currentItem.data
                                    });
                                }
                            }
                        }, section);

                        domConstruct.create("i", {
                            "class": FontAwesome["blog" + upperName]
                        }, a);
                    });
                },

                fillCenter: function() {
                    domConstruct.empty(this.centerNode);
                    var ol = domConstruct.create("ol", {
                        "class": "posts-list"
                    });

                    // query with options
                    this.postMemory.query(this.queryOpts, this.sortOpts).forEach(
                        Function.hitch(this, function(item, index) {
                            var listItem = this.createListItem(ol, item);
                            if (index === 0) this.currentItem = listItem;
                        })
                    );
                    this.centerNode.appendChild(ol);
                },

                createListItem: function(ol, item) {
                    var self = this;
                    var itemNode = domConstruct.toDom(stringUtil.substitute(simpleListItem, {
                        title: item.title,
                        postId: item.postId,
                        nls: nlsApp,
                        date: (new Date(item.createdAt)).toLocaleDateString(),
                        fAClass: item.usage ? self.fontAwesome.post : self.fontAwesome.rss,
                        tags: item.tagString,
                        tagClass: self.fontAwesome.tags
                    }));

                    var node = itemNode.firstChild;

                    on(node, "click", function() {
                        self.currentItem = {
                            li: this,
                            data: item
                        };
                    });
                    ol.appendChild(node);
                    return {
                        li: node,
                        data: item
                    };
                },

                initNewPostBtn: function() {
                    var a = domConstruct.create("a", {
                        "class": "pull-right",
                        "title": "New Post",
                        onclick: Function.hitch(this, function() {
                            this.mainLayout.selectPage("add");
                        })
                    }, this.topNode);
                    domConstruct.create("span", {
                        "class": "glyphicon glyphicon-plus",
                        title: this.nls.newPost,
                        style: "top:-55px;font-size:2em;padding:10px;"
                    }, a);
                },

                selectPostItem: function() {

                }
            }
        },

        "-public-": {
            "-attributes-": {
                mainLayout: {
                    setter: function(layout) {
                        this._.mainLayout = layout;
                        this.groupId = layout.groupId;
                    }
                },

                nls: {
                    getter: function() {
                        return nlsApp;
                    }
                },

                sortOpts: {
                    type: Object,
                    "default": {
                        sort: [{
                            attribute: "createdAt",
                            descending: true
                        }]
                    },
                    setter: function(opts) {
                        var _ = this._;
                        var desc = opts.direction === "asc" ? false : true;
                        _.sortOpts = {
                            sort: [{
                                attribute: opts.name,
                                descending: desc
                            }]
                        };
                    }
                },

                queryOpts: {
                    type: Object,
                    "default": {},
                    setter: function(opts) {
                        var _ = this._;
                        _.queryOpts = {};
                        var qName = Object.keys(opts)[0];
                        if (qName !== "") {
                            var qValue = opts[qName];
                            var qRegValue = new RegExp(qValue, "i");
                            _.queryOpts[qName] = qRegValue;
                        }
                    }
                },

                currentItem: {
                    type: Object,
                    "default": {
                        li: null,
                        data: {

                        }
                    },
                    setter: function(args) {
                        var _ = this._,
                            self = this,
                            olderItem = this.currentItem;
                        if (olderItem.li) domClass.remove(olderItem.li, "active");
                        _.currentItem = args;
                        domClass.add(_.currentItem.li, "active");
                        if (args.data) {
                            domConstruct.empty(this.contentPreviewNode);
                            this.postTitleNode.innerHTML = args.data.title;
                            this.postTitleNode.title = args.data.title;
                            this.contentPreviewNode.innerHTML += args.data.html;
                            this.authorNode.innerHTML = args.data.author || "";
                            this.mainLayout.currentPostData = args.data;
                        }
                        args.data.photos.forEach(function(item, index) {
                            self.initImgPopup(item.image, index);
                        });
                    }
                }
            },

            "-methods-": {
                start: function(){
                    this.initGoTop({
                        scrollContainer: this.previewNode
                    });
                },

                addToSlide: function(data) {
                    var self = this,
                        config = new SlideConfig({
                            itemData: data.slideConfig || {}
                        });
                    on(config, "save", function(formData) {
                        postSrv.addToSlide(data.id, formData).then(function(cBData) {
                            data.slideConfig = cBData.slideConfig;
                            self.mainLayout.popPage.hide();
                        });
                    });
                    on(config, "cancel", function() {
                        self.mainLayout.popPage.hide();
                    });
                    this.mainLayout.popPage.show(config.domNode);
                },

                refreshList: function() {
                    this.fillCenter();
                },

                searchItem: function(title) {
                    this.queryOpts = {
                        title: title
                    };
                    this.fillCenter();
                },

                sortItem: function(sortOpts) {
                    this.sortOpts = sortOpts;
                    this.fillCenter();
                }
            }
        },

        "-constructor-": {
            initialize: function(params, srcNodeRef) {
                this.overrided(params, srcNodeRef);
                var self = this;
                blogSrv.posts(params.blogId).then(function(memory) {
                    self.postMemory = memory;
                    self.init();
                });
            }
        }
    });
    return List;
});
