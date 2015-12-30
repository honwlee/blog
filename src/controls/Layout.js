define([
    "dojo/on",
    "dojo/mouse",
    "dojo/store/Memory",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "i18n!../nls/app",
    "qfacex/dijit/container/BorderContainer",
    "qfacex/dijit/container/ContentPane",
    "qscript/lang/Class",
    "qscript/lang/String",
    "qscript/lang/Deferred",
    "qscript/lang/Object",
    "qscript/utils/ITopicHub",
    "bundle!dependencies/services/iPopPage_lib#module",
    "utilhub/front/comctrls/BaseUi",
    "utilhub/front/comctrls/LeftNavbar",
    "bundle!dependencies/services/topNavbar_ctrl",
    "text!../templates/layout.html",
    "./Discover",
    "./List",
    "./Preview",
    "./Ghostdown",
    "./NormalEdit",
    "./Slide",
    "./Setting",
    "./Edit"
], function(on, mouse, Memory, domClass, domStyle, domConstruct, nlsApp, BorderContainer, ContentPane, Class, qString,
    Deferred, Object, ITopicHub, IPopPageLib, BaseUi, LeftNavbar, TopNavbarCtrl, template, Discover, ItemsList,
    ItemPreview, Ghostdown, NormalEdit, Slide, Setting, DojoEdit) {
    var Layout = Class.declare({
        "-parent-": BaseUi,
        "-interfaces-": [ITopicHub, IPopPageLib],
        "-protected-": {
            "-fields-": {
                "$$contentTemplate": template,
                nls: nlsApp,
                baseClass: "blog",
                fontAwesome: FontAwesome,
                _topicHubName: "blog",
                app: null,
                header: {
                    "className": FontAwesome.hideShow,
                    callback: "toggleMenu"
                }
            },

            "-methods-": {
                init: function() {
                    this.overrided();
                    this.popPage = this.initPopPage(true);
                    this.domNode.appendChild(this.popPage.domNode);
                    this.initTopics();
                    this.initNav();
                },

                initTopics: function() {
                    var self = this,
                        hubName = this._topicHubName;
                    this.receive(hubName + ":selectPage", function(args) {
                        var name = args.pageName;
                        delete args.pageName;
                        self.selectPage(name, args);
                    });

                    this.receive(hubName + ":showResharePage", function(articleInfo) {
                        var reshare = ReshareCtrl.createInstance({
                            itemData: articleInfo,
                            popPage: this.popPage,
                            tweetsMemory: this.memory
                        });
                        this.showPopPage(reshare.domNode);
                    });
                },

                initNav: function() {
                    this.navItemsData = {
                        list: {
                            name: nlsApp.list,
                            "objClass": ItemsList,
                            iconClass: this.fontAwesome.list,
                            hidden: false,
                            opts: {
                                // actions: ["delete", "translate", "edit", "normalEdit", "dojoEdit", "preview", "slide"],
                                actions: ["delete", "edit", "preview", "slide"],
                                blogId: this.blog.id
                            },
                            container: this.centerNode,
                            callback: "listCbk"
                        },
                        add: {
                            name: nlsApp.add,
                            "objClass": Ghostdown,
                            iconClass: this.fontAwesome.blogAdd,
                            hidden: false,
                            opts: {},
                            alwaysRefresh: true,
                            editing: true,
                            container: this.centerNode,
                            callback: "contentCbk"
                        },
                        // normalAdd: {
                        //     name: "normalAdd",
                        //     "objClass": NormalEdit,
                        //     iconClass: this.fontAwesome.blogAdd,
                        //     hidden: false,
                        //     opts: {},
                        //     editing: true,
                        //     container: this.centerNode,
                        //     callback: "initPageData"
                        // },
                        // dojoAdd: {
                        //     name: "DojoEdit",
                        //     "objClass": DojoEdit,
                        //     iconClass: this.fontAwesome.dojoEdit,
                        //     hidden: false,
                        //     opts: {},
                        //     editing: true,
                        //     container: this.centerNode,
                        //     callback: "initPageData"
                        // },
                        edit: {
                            name: nlsApp.edit,
                            "objClass": Ghostdown, //NormalEdit,
                            iconClass: this.fontAwesome.blogEdit,
                            opts: {
                                isEdit: true
                            },
                            hidden: true,
                            editing: true,
                            container: this.centerNode,
                            callback: "contentCbk"
                        },
                        // normalEdit: {
                        //     name: "normalEdit",
                        //     "objClass": NormalEdit,
                        //     iconClass: this.fontAwesome.blogEdit,
                        //     opts: {
                        //         isEdit: true
                        //     },
                        //     hidden: true,
                        //     editing: true,
                        //     container: this.centerNode,
                        //     callback: "initPageData"
                        // },
                        // dojoEdit: {
                        //     name: "normalEdit",
                        //     "objClass": DojoEdit,
                        //     iconClass: this.fontAwesome.blogEdit,
                        //     opts: {
                        //         isEdit: true
                        //     },
                        //     hidden: true,
                        //     editing: true,
                        //     container: this.centerNode,
                        //     callback: "initPageData"
                        // },
                        translate: {
                            name: nlsApp.translate,
                            "objClass": Ghostdown,
                            iconClass: this.fontAwesome.blogTranslate,
                            hidden: true,
                            opts: {
                                isTranslate: true
                            },
                            editing: true,
                            container: this.centerNode,
                            callback: "contentCbk"
                        },
                        preview: {
                            name: nlsApp.preview,
                            "objClass": ItemPreview,
                            iconClass: this.fontAwesome.post,
                            hidden: true,
                            opts: {
                                // actions: ["translate", "edit", "normalEdit", "delete"]
                                actions: ["edit", "delete"]
                            },
                            container: this.centerNode,
                            callback: "initPageData"
                        },
                        slide: {
                            name: nlsApp.slide,
                            "objClass": Slide,
                            iconClass: this.fontAwesome.slide,
                            hidden: false,
                            opts: {},
                            container: this.centerNode
                        },
                        setting: {
                            name: nlsApp.setting,
                            "objClass": Setting,
                            iconClass: this.fontAwesome.setting,
                            hidden: true,
                            opts: {},
                            editing: true,
                            container: this.centerNode,
                            callback: "initPageData"
                        }
                    };

                    this.nav = new LeftNavbar({
                        navItemsData: this.navItemsData,
                        hostSearch: false,
                        host: this
                    });
                    this.selectPage("list");
                    this.mainNode.addChild(this.nav);
                },

                closeViewSetting: function(pageItems, name) {
                    var previewPage = pageItems["preview"].page;
                    if (previewPage) previewPage.closeViewSetting();
                }
            }
        },

        "-public-": {
            "-attributes-": {
                memory: {
                    setter: function(memory) {
                        this._.memory = memory;
                    }
                },

                blog: {
                    setter: function(blog){
                        this._.blog = blog;
                    }
                },

                pageItems: {
                    getter: function() {
                        if (this.nav) return this.nav.navItems;
                    }
                },

                currentPageItem: {
                    type: Object,
                    getter: function() {
                        if (this.nav) return this.nav.currentItem;
                    }
                },

                currentPostData: {
                    type: Object,
                    setter: function(data) {
                        this._.currentPostData = data;
                    }
                },

                popOwner: {
                    type: Object,
                    getter: function() {
                        return this.mainNode.containerNode;
                    }
                },
                editing: {
                    type: Boolean,
                    writable: true
                }
            },
            "-methods-": {
                selectPage: function(name, args) {
                    // if (this.withoutNav) {
                    //     var page;
                    //     if (name === "add") {
                    //         page = new Ghostdown({
                    //             mainLayout: this
                    //         });
                    //         page.start().then(Function.hitch(this, function() {
                    //             page.itemData = {};
                    //         }));
                    //     } else if (name === "edit") {
                    //         page = new Ghostdown({
                    //             mainLayout: this
                    //         });
                    //         page.start().then(Function.hitch(this, function() {
                    //             page.itemData = this.currentPostData;
                    //         }));
                    //     } else if (name === "preview") {
                    //         page = new ItemPreview({
                    //             mainLayout: this
                    //         });
                    //         page.itemData = this.currentPostData;
                    //         page.start();
                    //     }
                    //     this.showPopPage(page.domNode);
                    // } else {
                    this.nav.selectItemByKey(name, args);
                    // }
                },

                onSelectPage: function(page) {},
                initPageData: function(pages, name) {
                    var page = pages[name].page;
                    this.closeViewSetting(pages, name);
                    if (page.start) {
                        page.itemData = name === "normalAdd" || name === "dojoAdd" ? {} : this.currentPostData;
                        page.start();
                    }
                },

                discoverCbk: function(pages, name, args) {

                },
                showCbk: function(pages, name, args) {

                },
                listCbk: function(pages, name) {
                    this.list = pages[name].page;
                    this.list.start();
                },

                contentCbk: function(pages, name) {
                    var page = pages[name].page;
                    this.closeViewSetting(pages, name);
                    page.start().then(Function.hitch(this, function() {
                        page.itemData = name === "add" ? {} : this.currentPostData;
                    }));
                },

                queryItems: function(qOpts, sOpts) {
                    return this.memory.query(qOpts, sOpts);
                },

                getItem: function(postId) {
                    return this.memory.get(postId);
                },

                getPageObj: function(name, pageName) {
                    // return the given name's page Obj
                    return this.pageItems[name].page;
                },

                findTranslatePost: function(postId) {
                    return this.memory.query({
                        transSourceId: postId
                    })[0];
                },

                refreshList: function() {
                    if (this.list) this.list.refreshList();
                },

                goBack: function() {
                    if (this.currentPageItem.prevPageName) this.selectPage(this.currentPageItem.prevPageName);
                },

                closeCallback: function() {
                    // this.closeViewSetting();
                }
            }
        },

        "-constructor-": {
            initialize: function(params) {
                this.overrided(params);
                this.pageItems = {};
                this.init();
            }
        }
    });
    return Layout;
});
