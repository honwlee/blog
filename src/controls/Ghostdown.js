// dropzone for outer file drag upload
// drag for Filesystem file drag upload

define([
    "dojo/on",
    "dojo/query",
    "dojo/topic",
    "dojo/dom-style",
    "dojo/dom-class",
    "dojo/dom-construct",
    "qfacex/dijit/ITemplated",
    "utilhub/ItemsControl",
    "qscript/lang/Class",
    "text!../templates/ghost.html",
    "i18n!../nls/app",
    "i18n!utilhub/front/system/nls/common",
    "bundle!dependencies/services/blog_srv",
    "bundle!dependencies/services/codemirror_lib#module",
    "bundle!dependencies/services/medium-insert_lib#module",
    "bundle!dependencies/services/iReload_lib#module",
    "bundle!dependencies/services/iDrag_lib#module",
    "bundle!dependencies/services/showdown_lib#module",
    "toastr/toastr",
    "dropzone",
    "selectize"
], function(on, query, topic, domStyle, domClass, domConstruct, ITemplated, ItemsControl, Class, template, nlsApp,
    nlsCommon, blogSrv, CodeMirror, MediumInsert, IReloadLib, IDrag, ShowdownLib, toastr) {
    var BlogGhost = Class.declare({
        // this Class is shared by add, edit and translate page
        "-parent-": ItemsControl,
        "-interfaces-": [ITemplated, IReloadLib, IDrag],
        "-protected-": {
            "-fields-": {
                templateString: template,
                groupId: null,
                handles: [],
                photos: null,
                converter: null
            },
            "-methods-": {
                updateWordCount: function() {
                    /* if (this.markdown.length) {
                        this.wordCountNode.innerHTML = this.markdown.match(/\S+/g).length + ' words';
                    } else {
                        this.wordCountNode.innerHTML = '0 words';
                    }*/
                },

                updatePreview: function() {
                    this.previewNode.innerHTML = this.html;
                    this.updateWordCount();
                },

                syncScroll: function(e) {
                    // vars
                    var $codeViewport = $(e.target),
                        $previewViewport = $('#' + this.id + ' .entry-preview-content'),
                        $codeContent = $('#' + this.id + ' .CodeMirror-sizer'),
                        $previewContent = $('#' + this.id + ' .rendered-markdown'),

                        // calc position
                        codeHeight = $codeContent.height() - $codeViewport.height(),
                        previewHeight = $previewContent.height() - $previewViewport.height(),
                        ratio = previewHeight / codeHeight,
                        previewPostition = $codeViewport.scrollTop() * ratio;

                    // apply new scroll
                    $previewViewport.scrollTop(previewPostition);
                },

                initDropZone: function() {
                    var options = {
                            // previewTemplate: dropzoneTemplate,
                            previewsContainer: null,
                            parallelUploads: 1,
                            uploadMultiple: true,
                            url: this.url
                        },
                        self = this,
                        dropzone = this.dropzone = new Dropzone(this.uploadForm, options);
                    Dropzone.options.myAwesomeDropzone = false;
                    Dropzone.autoDiscover = false;
                    dropzone.on('complete', function(file) {
                        file.previewElement.classList.add('dz-complete');
                        if (file.status == "success" && file.xhr.response) {
                            var obj = $.parseJSON(file.xhr.response);
                            var filter = self.photos.filter(function(photo) {
                                return photo.id === obj.id;
                            });
                            if (filter.length === 0) self.photos.push(obj);
                            self.initImgMarkdown(obj.image.normal);
                            $(".dz-preview").css("opacity", "0");
                            self.initImgPopup(obj.image);
                        }
                    });
                },

                initImgPopup: function(imgObj) {
                    // thumb normal wallpaper
                    var url = imgObj.wallpaper || imgObj.url;
                    if (url[0] !== "/") url = "/" + url;
                    query("img", this.previewNode).forEach(function(img) {
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
                },

                initImgMarkdown: function(url, style) {
                    this.addNewLine();
                    this.replaceRange("![alt](" + url + ")");
                    this.addNewLine();
                    // var editorValue = this.editor.getValue();
                    // return editorValue + "![alt](" + runtime.hostName + url + ")";
                },

                replaceRange: function(content) {
                    var doc = this.editor.getDoc();
                    var cursor = doc.getCursor(); // gets the line number in the cursor position
                    var word = this.editor.findWordAt(cursor);
                    var line = doc.getLine(cursor.line); // get the line contents
                    var pos = word.head;
                    if (line.match(/([^\w])+$/)) pos.ch = word.ch + 1;
                    doc.replaceRange(content, word.head); // adds a new line
                },

                addNewLine: function() {
                    var doc = this.editor.getDoc();
                    var cursor = doc.getCursor(); // gets the line number in the cursor position
                    doc.replaceRange('\n', cursor); // adds a new line
                },

                getCursorWord: function() {
                    var word = this.editor.findWordAt(this.editor.getCursor());
                    this.editor.getRange(word.anchor, word.head);
                }
            }
        },

        "-public-": {
            "-attributes-": {
                draggerOpts: {
                    getter: function() {
                        return {
                            container: this.uploadForm,
                            itemDrag: { // file item can also drag
                                key: "itemId", // using name to kown which item is dragged,
                                doItemDrag: Function.hitch(this, function(fromItem, toItem) {
                                    this.editor.setValue(this.initImgMarkdown(fromItem.item.imagePath));
                                })
                            }
                        };
                    }
                },
                url: {
                    getter: function() {
                        return "/ubase/api/v1/photos" + "?private_token=" + runtime.currentUser.token;
                    }
                },
                imageUploaderOpts: {
                    getter: function() {
                        return {
                            url: "/ubase/api/v1/photos" + "?private_token=" + runtime.currentUser.token,
                            paramName: "image",
                            container: this.uploadBtnWrapNode
                        };
                    }
                },

                photos: {
                    getter: function() {
                        if(!this.itemData.photos) return [];
                        if (this.itemData.photos.length == 0) {
                            this.itemData.photos = [];
                        }
                        return this.itemData.photos;
                    }
                },

                itemData: {
                    type: Object,
                    "default": {},
                    setter: function(data) {
                        data = data || {};
                        var title, editorValue;
                        // a translated post or fork post is editing
                        // using transSourceId and parentId to find post data
                        //  save in translates or origins
                        if (!data.photos) data.photos = [];

                        if (data.parentId) this.origins = data.parentId;

                        if (this.isTranslate) {
                            // traslate post is saved  treated as edit
                            if (this.isEdit) {
                                title = data.title;
                                editorValue = data.markdown;
                            } else {
                                this.translates = data.postId;
                                // first find exsit translate data
                                this.translateItem = this.findTranslatePost(data.postId) || {};
                                title = this.translateItem.title || "";
                                editorValue = this.translateItem.markdown || "";
                            }
                            this.titleNode.value = title;
                            this.editor.setValue(editorValue);
                            this.showTranslate();
                        } else {
                            this.titleNode.value = data.title || "";
                            this.editor.setValue(data.markdown || "");
                            this.updatePreview();
                        }
                        this.tagsNode.value = (data.tag_list && data.tag_list.length && data.tag_list.join(",")) || "";
                        $(".blog-tags-input", this.domNode).selectize({
                            plugins: ['remove_button'],
                            persist: false,
                            create: true,
                            render: {
                                item: function(data, escape) {
                                    return '<div>' + escape(data.text) + '</div>';
                                }
                            }
                        });
                        this._.itemData = data;
                    }
                },

                isShare: {
                    getter: function() {
                        return this.shareNode.checked;
                    }
                },

                mainLayout: {
                    setter: function(layout) {
                        this._.mainLayout = layout;
                        this.blogId = layout.blog.id;
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

                nls: {
                    getter: function() {
                        return nlsApp;
                    }
                },

                nlsCommon: {
                    getter: function() {
                        return nlsCommon;
                    }
                },

                html: {
                    getter: function() {
                        return this.converter ? this.converter.makeHtml(this.markdown) : "";
                    }
                },

                markdown: {
                    getter: function() {
                        return this.editor ? this.editor.getValue() : "";
                    }
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
                },

                translates: {
                    // useing transSourceId to get data
                    setter: function(transSourceId) {
                        if (!transSourceId) return;
                        var data = this.mainLayout.getItem(transSourceId),
                            html = "<h4>" + data.title + "</h4>";
                        this._.translates = html + (data.markdown ? data.markdown : data.html);
                    }
                },

                origins: {
                    // useing parentId to get data
                    setter: function(parentId) {
                        if (!parentId) return;
                        var data = this.mainLayout.getItem(parentId);
                        this._.origins = data.markdown ? data.markdown : data.html;
                    }
                },

                isTranslate: {
                    type: Boolean,
                    setter: function(isTranslate) {
                        this._.isTranslate = isTranslate;
                        if (isTranslate) domStyle.set(this.originBtn, "display", "");
                    }
                },

                status: {
                    setter: function(status){
                        this._.status = status;
                    }
                },

                isEdit: {
                    type: Boolean,
                    setter: function(isEdit) {
                        this._.isEdit = isEdit;
                    }
                },

                hasOrigin: {
                    type: Boolean,
                    setter: function(hasOrigin) {
                        this._.hasOrigin = hasOrigin;
                        var display = hasOrigin ? "none" : "";
                        domStyle.set(this.originBtn, "display", display);
                    }
                },

                hasTranslate: {
                    type: Boolean,
                    seter: function(hasTranslate) {
                        this._.hasTranslate = hasTranslate;
                        var display = hasTranslate ? "none" : "";
                        domStyle.set(this.originBtn, "display", display);
                    }
                }
            },

            "-methods-": {
                init: function() {
                    var self = this;
                    this.handles.push(this.addOnUnload(this, "unloadCallback"));
                    domStyle.set(this.originBtn, "display", "none");
                    on(this.saveNode, "click", function() {
                        self.savePost();
                    });
                    on(this.backNode, "click", function() {
                        self.goBack();
                    });
                    this.initDropZone();
                    self._initDrag(this.draggerOpts);
                },

                unloadCallback: function() {
                    // turnonMessage function from IAddOnUnload inteface
                    if (this.isChanging) return this.turnonMessage("writing");
                },

                start: function() {
                    var deferred = new Deferred(),
                        self = this;
                    if (self._srvInited) return deferred.promise;
                    self.editor = CodeMirror.fromTextArea(self.markdownNode, {
                        mode: 'markdown',
                        tabMode: 'indent',
                        dragDrop: false,
                        lineWrapping: true
                    });

                    // new MediumInsert({
                    //     selector: ".CodeMirror-lines", //this.previewNode,
                    //     uploadUrl: "/ubase/api/v1/photos/jq_uploader" + "?private_token=" + runtime.currentUser.token
                    // });

                    self.editor.on("change", function() {
                        // when edit is loaded it will get a change event
                        // use editorFirstChange to shield this first change
                        if (!self.editorFirstChange) self.isChanging = true;
                        self.editorFirstChange = false;
                        if (self.isTranslate) return;
                        self.updatePreview();
                    });

                    self.bindEvents();
                    deferred.resolve();

                    this._srvInited = true;
                    return deferred.promise;
                },

                bindEvents: function() {
                    var self = this;
                    // $('#' + this.id + ' .entry-markdown').addClass('mermaid');
                    // $('#' + this.id + ' .entry-preview').addClass('mermaid');

                    $('#' + this.id + ' .entry-markdown header, ' + '#' + this.id + ' .entry-preview header').click(function(e) {
                        $('.entry-markdown, .entry-preview').removeClass('active');
                        $(e.target).closest('section').addClass('active');
                    });

                    // this.updatePreview();
                    // TODO: Debounce
                    $('#' + this.id + ' .CodeMirror-scroll').on('scroll', function(e) {
                        self.syncScroll(e);
                    });
                    // // this._initMediumEditor(this.previewNode);
                    $('#' + this.id + ' .CodeMirror-code').click(function() {
                        this.setAttribute('data-medium-focused', true);
                    });
                    // this._initMediumEditor($('#' + this.id + ' .CodeMirror-code')[0]);
                    // Shadow on Markdown if scrolled
                    $('#' + this.id + ' .CodeMirror-scroll').scroll(function() {
                        if ($('#' + self.id + ' .CodeMirror-scroll').scrollTop() > 10) {
                            $('#' + self.id + ' .entry-markdown').addClass('scrolling');
                        } else {
                            $('#' + self.id + ' .entry-markdown').removeClass('scrolling');
                        }
                    });
                    // Shadow on Preview if scrolled
                    $('#' + this.id + ' .entry-preview-content').scroll(function() {
                        if ($('#' + self.id + ' .entry-preview-content').scrollTop() > 10) {
                            $('#' + self.id + ' .entry-preview').addClass('scrolling');
                        } else {
                            $('#' + self.id + ' .entry-preview').removeClass('scrolling');
                        }
                    });

                    if (this.isTranslate) {
                        domStyle.set(this.originBtn, "display", "");
                        this.handles.push(on(this.originBtn, "click", function() {
                            self.showTranslate();
                        }));

                        this.handles.push(on(this.previewBtn, "click", function() {
                            self.showPreview();
                        }));
                    }
                    on(this.publicNode,"click",function(){
                        self.statusNode.innerHTML = this.firstChild.innerHTML;
                        domClass.add(this,"active");
                        domClass.remove(self.privateNode,"active");
                        self.status = "public";
                    });
                    on(this.privateNode,"click",function(){
                        self.statusNode.innerHTML = this.firstChild.innerHTML;
                        self.status = "private";
                        domClass.add(this,"active");
                        domClass.remove(self.publicNode,"active");
                    });
                },

                savePost: function() {

                    var title = this.titleValue.trim();

                    if (title === "") {
                        toastr.warning(this.nls.titleEmpty);
                        return;
                    }

                    var config = {
                        "title": title,
                        "markdown": this.markdown,
                        "html": this.html,
                        "blog_id": this.blogId,
                        "status": this.status,
                        "tagString": this.tagsValue.trim()
                    };
                    var photoIds = this.photos.map(function(photo) {
                        return photo.id;
                    });
                    if (photoIds.length > 0) config.photos = photoIds;

                    if (this.isEdit) config["id"] = this.itemData.id;

                    var postCbk = Function.hitch(this, function(data) {
                        toastr.success(this.nls.saveSuccessful);

                        // after translate or add content is saved
                        // set isEdit to true
                        // so the next change is treated as edit.
                        this.isEdit = true;

                        this.itemData = data;
                        this.mainLayout.refreshList();
                        this.mainLayout.currentPostData = data;
                        this.isChanging = false;

                        if (this.isShare) {
                            var obj = {
                                id: data.id,
                                groupId: this.groupId,
                                type: "Post",
                                text: nlsCommon.sharedWithBlog + data.title,
                                sharedWith: "blog"
                            };
                            if (photoIds.length > 0) obj.photoIds = photoIds;
                            runtime.doSharing(obj);
                        }
                    });
                    if (this.isTranslate && !this.isEdit) {
                        // when action is edit just edit it not translate it
                        // save exsit traslate post
                        if (this.translateItem.id) config["id"] = this.translateItem.id;
                        config.type = "translate";

                        config.transSourceId = this.itemData.id;
                        blogSrv.translate(config).then(postCbk);
                    } else {
                        if (!this.isEdit) config.type = "normal";
                        blogSrv.savePost(config).then(postCbk);
                    }
                },

                goBack: function() {
                    this.mainLayout.goBack();
                },

                findTranslatePost: function(postId) {
                    // use this method to find given post's translate post
                    // because one user only can have one post's translate post
                    if (!this.isTranslate) return;
                    return this.mainLayout.findTranslatePost(postId);
                },

                showTranslate: function() {
                    this.previewNode.innerHTML = this.converter.makeHtml(this.translates);
                    domClass.add(this.originBtn, "active");
                    domClass.remove(this.previewBtn, "active");
                    var pW = this.previewNode.offsetWidth,
                        pH = this.previewNode.offsetHeight,
                        mW = this.markdownNode.offsetWidth,
                        mH = this.markdownNode.offsetHeight;
                    domStyle.set(this.markdownNode, {
                        width: (pW > mW ? pW : mW) + "px",
                        height: (pH > mH ? pH : mH) + "px"
                    });
                },

                showPreview: function() {
                    this.previewNode.innerHTML = this.converter.makeHtml(this.markdown);
                    domClass.add(this.previewBtn, "active");
                    domClass.remove(this.originBtn, "active");
                },

                getPhotos: function() {
                    return this.photos;
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
                var self = this;
                this.overrided(params, srcNodeRef);
                require(['showdown'], function(showdown) {
                    self.converter = showdown.Converter();
                    self.init();
                });
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
    return BlogGhost;
});
