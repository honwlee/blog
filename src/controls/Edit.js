define([
    "dojo/dom-construct",
    "dojo/on",
    "dojo/aspect",
    "dijit/Editor",
    "dijit/_editor/plugins/FullScreen",
    "dijit/_editor/plugins/ViewSource",
    "dijit/_editor/plugins/TextColor",
    "dijit/_editor/plugins/TabIndent",
    "dijit/_editor/plugins/FontChoice",
    "dojo/_base/declare",
    "qscript/lang/Class",
    "bundle!context",
    "utilhub/front/comctrls/BaseUi",
    "bundle!dependencies/services/markdown_lib#module",
    "bundle!dependencies/services/toMarkdown_lib#module",
    "bundle!dependencies/services/blog_srv",
    "text!../templates/edit.html",
    "i18n!../nls/app",
    "i18n!utilhub/front/system/nls/common",
    "qfacex/dijit/container/BorderContainer",
    "qfacex/dijit/container/ContentPane",
    "qfacex/dijit/text/SimpleTextarea",
    "qfacex/dijit/text/TextBox",
    "qfacex/dijit/container/TabContainer",
    "selectize"
], function(domConstruct, on, aspect, DijitEditor, PFullScreen, PViewSource, PTextColor, PTabIndent, PFontChoice,
    dojoDeclare, Class, context, BaseUi, markdownLib, toMarkdownLib, blogSrv, template, nlsApp,
    nlsCommon, BorderContainer, ContentPane, SimpleTextArea) {
    var toHTML = function(content) {
        return markdownLib.toHTML(content);
    };

    var toMarkdown = function(content) {
        return toMarkdownLib(content);
    };


    var Editor = dojoDeclare(null, {
        constructor: function(input, prev) {
            this.input = input;
            this.preview = prev;
        },
        update: function() {
            this.preview.innerHTML = toHTML(this.input.value);
        }
    });

    var BlogEdit = Class.declare({
        "-parent-": BaseUi,

        "-protected-": {
            "-fields-": {
                "$$contentTemplate": template,
                baseClass: "edit",
                footAwesome: FontAwesome,
                isMarkdown: true,
                nlsCommon: nlsCommon
            },

            "-methods-": {
                init: function() {
                    this.overrided();
                    var self = this;
                    $(this.tagsNode).selectize({
                        plugins: ['remove_button'],
                        persist: false,
                        create: true,
                        render: {
                            item: function(data, escape) {
                                return '<div>"' + escape(data.text) + '"</div>';
                            }
                        }
                    });
                    on(this.saveNode, "click", function() {
                        self.savePost();
                    });
                    on(this.backNode, "click", function() {
                        self.goBack();
                    });
                    this.centerNode.addChild(this.initMarkdown());
                    this.centerNode.addChild(this.initDijitEditor());
                    aspect.before(this.centerNode, "selectChild", function(page) {
                        if (page.editorType === "markdown") {
                            self.markdownArea.set("value", toMarkdown(self.dijitEditor.get("value")));
                        } else {
                            self.dijitEditor.set("value", self.previewNode.innerHTML);
                        }
                    });
                    this.dijitEditor.startup();
                },

                initMarkdown: function() {
                    var cp = new ContentPane({
                        title: "markdown",
                        region: "center"
                    });
                    cp.editorType = "markdown";
                    var text = this.markdownArea = new SimpleTextArea({
                        style: "height:100%",
                        "class": "markdownArea"
                    });
                    cp.set("content", text);
                    var editor = this.markdownEditor = new Editor(text.domNode, this.previewNode);
                    if (this.previewNode && this.usage != "translate") {
                        on(text.domNode, "input", Function.hitch(this, function() {
                            editor.update();
                        }));
                    }
                    return cp;
                },

                initDijitEditor: function() {
                    var self = this,
                        cp = new ContentPane({
                            title: "html",
                            region: "center"
                        }),
                        editor = this.dijitEditor = new DijitEditor({
                            extraPlugins: [
                                'foreColor', '|', 'createLink', 'insertImage', 'fullscreen', 'viewsource'
                            ]

                        });
                    cp.editorType = "html";
                    on(editor, "displayChanged", function() {
                        self.previewNode.innerHTML = editor.get("value");
                    });
                    cp.set("content", editor);
                    return cp;
                }
            }
        },

        "-public-": {
            "-attributes-": {
                mainLayout: {
                    setter: function(layout) {
                        this._.mainLayout = layout;
                        this.blogId = layout.blog.id;
                    }
                },
                isShare: {
                    getter: function() {
                        return this.shareNode.checked;
                    }
                },

                usage: {
                    writable: true,
                    type: String,
                    "default": "add"
                },

                nls: {
                    getter: function() {
                        return nlsApp;
                    }
                },

                itemData: {
                    type: Object,
                    setter: function(data) {
                        if (this.usage == "translate") return;
                        var _ = this._;
                        _.itemData = data;
                        if (data.html) {
                            this.dijitEditor.replaceValue(data.html);
                        }

                        if (data.markdown) {
                            this.markdownArea.set("value", data.markdown);
                        }
                        this.blogTitleNode.value = data.title || "";


                        if (data.tagString) {
                            this.tagsNode.value = data.tagString;
                        }
                    }
                }
            },

            "-methods-": {
                savePost: function() {
                    var title = this.blogTitleNode.value.trim();

                    if (title === "") {
                        var obj = {};
                        obj.message = this.nls.titleEmpty;
                        qfaceDialog.alert(obj);
                        return;
                    }

                    var markdownValue = "";
                    var html = "";
                    var type = "";

                    if (!this.isMarkdown) {
                        if (this.usage == "translate") {
                            markdownValue = this.markdownArea.value.trim();
                            html = toHTML(markdownValue);
                        } else {
                            markdownValue = this.markdownArea.value.trim();
                            html = this.previewNode.innerHTML;
                        }
                        type = "markdown";

                    } else {
                        html = this.dijitEditor.value;
                        type = "html";
                    }

                    var config = {
                        "title": title,
                        "markdown": markdownValue,
                        "html": html,
                        "blog_id": this.blogId,
                        "tagString": this.tagsNode.value.trim(),
                        "type": type
                    };

                    if (this.usage == "translate") {
                        config["transSourceId"] = this.mainLayout.currentPostData.postId;
                    } else {
                        if (this.itemData && this.itemData.id) {
                            config["id"] = this.itemData.id;
                        }
                    }

                    blogSrv.savePost(config).then(Function.hitch(this, function(data) {
                        var obj = {
                            message: this.nls.saveSuccessful
                        };
                        topic.publish("qface/toaster", obj);
                        this.itemData = data;
                        this.mainLayout.currentPostData = data;
                        this.mainLayout.refreshList();
                        if (this.isShare) {
                            runtime.doSharing({
                                id: data.id,
                                type: "Post",
                                text: nlsCommon.sharedWithBlog + data.title
                            });
                        }
                    }));
                },
                start: function() {
                    this.resize();
                },
                goBack: function() {
                    this.mainLayout.goBack();
                },
                resize: function(args) {
                    this.overrided(args);
                    this.mainNode.resize(args);
                }
            }
        },

        "-constructor-": {
            initialize: function(params, srcNodeRef) {
                this.overrided(params, srcNodeRef);
                this.init();
            }
        }
    });
    return BlogEdit;
});