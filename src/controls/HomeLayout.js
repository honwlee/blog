define([
    "dojo/on",
    "i18n!../nls/app",
    "qscript/lang/Class",
    "bundle!dependencies/services/iPopPage_lib#module",
    "utilhub/front/comctrls/LeftNavbar",
    "bundle!dependencies/services/topNavbar_ctrl",
    "text!../templates/layout.html",
    "./Layout",
    "./Discover",
    "./List",
    "./Preview",
    "./Ghostdown",
    "./NormalEdit",
    "./Setting"
], function(on, nlsApp, Class, IPopPageLib, LeftNavbar, TopNavbarCtrl, template, Layout,
    Discover, ItemsList, ItemPreview, Ghostdown, NormalEdit, Setting) {
    return Class.declare({
        "-parent-": Layout,
        "-interfaces-": [],
        "-protected-": {
            "-fields-": {},
            "-methods-": {
                initNav: function() {
                    this.navItemsData = {
                        discover: {
                            name: "发现",
                            "objClass": Discover,
                            container: this.centerNode,
                            callback: "discoverCbk"
                        },
                        list: {
                            name: "我的",
                            "objClass": ItemsList,
                            iconClass: this.fontAwesome.list,
                            hidden: false,
                            opts: {
                                blogData: this.blog
                            },
                            container: this.centerNode,
                            callback: "listCbk"
                        },
                        add: {
                            name: nlsApp.add,
                            // "objClass": NormalEdit,
                            "objClass": Ghostdown,
                            iconClass: this.fontAwesome.blogAdd,
                            hidden: false,
                            opts: {},
                            editing: true,
                            container: this.centerNode,
                            // callback: "initPageData"
                            callback: "contentCbk"
                        },
                        edit: {
                            name: nlsApp.edit,
                            "objClass": Ghostdown, //NormalEdit,
                            iconClass: this.fontAwesome.blogEdit,
                            display: "none",
                            opts: {
                                isEdit: true
                            },
                            hidden: true,
                            editing: true,
                            container: this.centerNode,
                            callback: "contentCbk"
                        },
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
                                actions: ["translate", "edit", "delete"]
                            },
                            container: this.centerNode,
                            callback: "initPageData"
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
                        },
                        show: {
                            name: "show",
                            "objClass": ItemsList,
                            hidden: true,
                            container: this.centerNode,
                            callback: "showCbk"
                        }
                    };
                    this.nav = TopNavbarCtrl.createInstance({
                        navItemsData: this.navItemsData,
                        host: this
                    });
                    this.selectPage("discover");
                    this.mainNode.addChild(this.nav);
                }
            }
        },
        "-public-": {
            "-attributes-": {

            },
            "-methods-": {

            }
        },
        "-constructor-": {
            initialize: function(params, srcNodeRef) {
                this.overrided(params, srcNodeRef);
            }
        }
    });
});
