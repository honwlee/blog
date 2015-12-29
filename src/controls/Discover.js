define([
    "dojo/on",
    "dojo/query",
    "dojo/topic",
    "dojo/string",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "qfacex/dijit/ITemplated",
    "utilhub/ItemsControl",
    "bundle!dependencies/services/masonry_ctrl",
    "bundle!dependencies/services/blog_srv",
    "text!../templates/blogItem.html",
    "qscript/lang/Class"
], function(on, query, topic, stringUtil, domClass, domStyle, domConstruct,
    ITemplated, ItemsControl, MasonryCtrl, blogSrv, template, Class) {
    var Item = Class.declare({
        "-parent-": ItemsControl,
        "-interfaces-": [ITemplated],
        "-protected-": {
            "-fields-": {
                item: null,
                fontAwesome: FontAwesome,
                templateString: template
            },
            "-methods-": {
                init: function() {
                    var self = this;
                    on(this.moreNode, "click", function() {
                        self.broadcast("blog:selectPage", {
                            pageName: "show",
                            blogData: self.item
                        });
                    });
                    this.item.posts.query({}).forEach(function(post, index) {
                        var innerClass = index % 2 === 0 ? "list-group-item-info" : "";
                        var li = domConstruct.create("li", {
                            "class": "list-group-item " + innerClass,
                            onclick: function() {

                            }
                        }, self.listNode);
                        domConstruct.create("h3", {
                            "class": "blogTitle",
                            innerHTML: post.title
                        }, li);
                        domConstruct.create("p", {
                            "class": "blogDesc",
                            innerHTML: "Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. "
                        }, li);
                    });
                }
            }
        },
        "-public-": {
            "-attributes-": {},
            "-methods-": {
                onItemClick: function() {},
                onMore: function() {}
            }
        },
        "-constructor-": {
            initialize: function(params) {
                if (params.item.user) {
                    this.avatar = params.item.user.avatar;
                    params.item.title = params.item.title || params.item.user.username + "的博客";
                } else {
                    params.item.title = params.item.title || params.item.group.name + "的博客";
                    this.avatar = params.item.group.avatar;
                }
                this.overrided(params);
                this.init();
            }
        }
    });

    return Class.declare({
        "-parent-": ItemsControl,
        "-interfaces-": [ITemplated],
        "-module-": "",
        "-protected-": {
            "-fields-": {
                memory: null,
                "_": {
                    pageNum: 2
                },
                templateString: "<div></div>",
                baseClass: "blog-discover"
            },
            "-methods-": {
                init: function() {
                    this.initList();
                    // this.memory.query({}).forEach(Function.hitch(this, "initItem"));
                },

                initList: function() {
                    var memory = blogSrv.getMemory();
                    this.list = MasonryCtrl.createInstance({
                        memory: memory,
                        isScrollPage: true,
                        masonryOpts: {
                            itemSelector: 'grid-item',
                            isAnimated: true
                        },
                        totalPage: blogSrv.getTotalPage(),
                        itemOpts: {
                            actions: ["select"],
                            classObj: Item
                        },
                        filterOpts: this.filterOpts,
                        loadNextFunc: Function.hitch(this, "loadNextPage")
                    });
                    this.list.region = "center";
                    this.addChild(this.list);
                },

                // initItem: function(itemData) {
                //     var self = this,
                //         item = new Item({
                //             item: itemData
                //         });
                //     this.addChild(item);
                // },

                loadNextPage: function() {
                    var deferred = new Deferred(),
                        self = this,
                        filter,
                        qOpts = this.filterOpts.queryOpts;
                    blogSrv.initByPage(this._.pageNum, filter).then(function(items) {
                        self._.pageNum += 1;
                        deferred.resolve(items);
                    });
                    return deferred.promise;
                }
            }
        },
        "-public-": {
            "-attributes-": {
                filterOpts: {
                    "default": {
                        sortOpts: {
                            name: "createdAt"
                        },
                        queryOpts: {},
                        newPaginate: true
                    },
                    setter: function(opts) {
                        this._.filterOpts = opts;
                    }
                }
            },
            "-methods-": {
                layoutStart: function() {
                    // domStyle.set(this.list.domNode, "height", this.layoutBox.h);
                    this.list.filter({});
                    this.list.resize(this.layoutBox);
                }
            }
        },
        "-constructor-": {
            initialize: function(params) {
                this.overrided(params);
                this.init();
            }
        }
    });
});
