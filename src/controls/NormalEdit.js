define([
    "dojo/on",
    "dojo/dom-style",
    "dojo/dom-class",
    "dojo/dom-construct",
    "utilhub/front/comctrls/BaseUi",
    "qscript/lang/Class",
    "text!../templates/normalEdit.html",
    "i18n!../nls/app",
    "i18n!utilhub/front/system/nls/common",
    "bundle!dependencies/services/blog_srv",
    "bundle!dependencies/services/medium-insert_lib#module",
    "toastr/toastr",
    "bundle!dependencies/services/iReload_lib#module",
    "qfacex/dijit/container/BorderContainer",
    "qfacex/dijit/container/ContentPane"
], function(on, domStyle, domClass, domConstruct, BaseUi, Class,
    template, nlsApp, nlsCommon, blogSrv, MediumInsert, toastr, IReloadLib) {
    var NormalEdit = Class.declare({
        "-parent-": BaseUi,
        "-interfaces-": [IReloadLib],
        "-protected-": {
            "-fields-": {
                "$$contentTemplate": template,
                nls: nlsApp,
                nlsCommon: nlsCommon,
                handles: []
            },
            "-methods-": {
                init: function() {
                    this.overrided();
                    var self = this;
                    this.handles.push(this.addOnUnload(this, "unloadCallback"));
                    on(this.saveNode, "click", function() {
                        self.savePost();
                    });
                    on(this.backNode, "click", function() {
                        self.goBack();
                    });
                },

                initImgPopup: function(imgObj) {
                    // thumb normal wallpaper
                    var url = imgObj.wallpaper || imgObj.normal;
                    if (url[0] !== "/") url = "/" + url;
                    query("img", self.centerNode.domNode).forEach(function(img) {
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
                    }, this);
                }
            }
        },

        "-public-": {
            "-attributes-": {
                uploadUrl: {
                    getter: function() {
                        return "/ubase/api/v1/photos/jq_uploader" + "?private_token=" + runtime.currentUser.token;
                    }
                },

                deleteUrl: {
                    getter: function() {
                        return "/ubase/api/v1/photos/jq_uploader" + "?private_token=" + runtime.currentUser.token;
                    }
                },

                mainLayout: {
                    setter: function(layout) {
                        this._.mainLayout = layout;
                        this.blogId = layout.blog.id;
                    }
                },

                itemData: {
                    type: Object,
                    setter: function(data) {
                        this.centerNode.content = data.html || "";
                        this.tagsNode.value = (data.tag_list && data.tag_list.length && data.tag_list.join(",")) || "";
                        $(".blog-tags-input", this.domNode).selectize({
                            plugins: ['remove_button'],
                            persist: false,
                            create: true,
                            render: {
                                item: function(data, escape) {
                                    return '<div>"' + escape(data.text) + '"</div>';
                                }
                            }
                        });
                        this.titleNode.value = data.title || "";
                        this._.itemData = data;
                    }
                },
                isEdit: {
                    type: Boolean,
                    setter: function(isEdit) {
                        this._.isEdit = isEdit;
                    }
                },
                isShare: {
                    getter: function() {
                        return this.shareNode.checked;
                    }
                },
                editorFirstChange: {
                    writable: true,
                    "default": true
                },

                isChanging: {
                    writable: true,
                    "default": false
                },

                titleValue: {
                    getter: function() {
                        return this.titleNode ? this.titleNode.value : null;
                    }
                },

                tagsValue: {
                    getter: function() {
                        return this.tagsNode ? this.tagsNode.value : null;
                    }
                }
            },

            "-methods-": {
                unloadCallback: function() {
                    // turnonMessage function from IAddOnUnload inteface
                    if (this.isChanging) return this.turnonMessage("writing");
                },

                start: function() {
                    var deferred = new Deferred();
                    if (this._srvInited) return;
                    new MediumInsert({
                        selector: this.centerNode.domNode,
                        extensions: {
                            customHtml: {
                                buttonText: "<hr>",
                                htmlToInsert: "<hr class='someclass'>"
                            },
                            table: {
                                rows: 40,
                                columns: 40
                            }
                        },
                        toolbar: {
                            /* These are the default options for the toolbar,
                               if nothing is passed this is what is used */
                            allowMultiParagraphSelection: true,
                            buttons: [
                                'bold', 'italic', 'underline', 'anchor', 'header1', 'header2', 'quote',
                                'justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull',
                                'pre'
                            ],
                            diffLeft: 0,
                            diffTop: -10,
                            firstButtonClass: 'medium-editor-button-first',
                            lastButtonClass: 'medium-editor-button-last',
                            standardizeSelectionStart: false,
                            "static": false,
                            relativeContainer: null,

                            /* options which only apply when static is true */
                            align: 'center',
                            sticky: false,
                            updateOnEmptySelection: false
                        },
                        deleteUrl: null,
                        uploadUrl: this.uploadUrl
                    });
                    this._srvInited = true;
                    deferred.resolve();
                    return deferred.promise;
                },

                resize: function(args) {
                    this.overrided(args);
                    this.mainNode.resize(args);
                },

                savePost: function() {
                    var title = this.titleValue.trim();
                    if (title === "") {
                        toastr.warning(this.nls.titleEmpty);
                        return;
                    }

                    var config = {
                        "type": "normal",
                        "title": title,
                        "blog_id": this.blogId,
                        "html": this.centerNode.content,
                        "tagString": this.tagsValue.trim()
                    };

                    if (this.isEdit) config["id"] = this.itemData.id;
                    blogSrv.savePost(config).then(Function.hitch(this, function(data) {
                        toastr.success(this.nls.saveSuccessful);
                        this.isEdit = true;
                        this.itemData = data;
                        this.mainLayout.refreshList();
                        this.mainLayout.currentPostData = data;
                        this.isChanging = false;

                        if (this.isShare) {
                            runtime.doSharing({
                                id: data.id,
                                type: "Post",
                                text: nlsCommon.sharedWithBlog + data.title
                            });
                        }
                    }));
                },

                goBack: function() {
                    this.mainLayout.goBack();
                },

                uninitialize: function() {
                    this.handles.forEach(function(handle) {
                        handle.remove();
                    });
                    this.handles = [];
                }
            }
        },

        "-constructor-": {
            initialize: function(params, srcNodeRef) {
                this.overrided(params, srcNodeRef);
                this.init();
            }
        },

        "-destructor-": {
            "-finalize-": function() {
                this.handles.forEach(function(handle) {
                    handle.remove();
                });
                this.handles = [];
            }
        }
    });
    return NormalEdit;
});