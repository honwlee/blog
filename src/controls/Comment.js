define([
    "dojo/on",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "i18n!../nls/app",
    "text!../templates/comment.html",
    "qscript/lang/Class",
    "qfacex/dijit/ITemplated",
    "utilhub/ItemsControl",
    "bundle!dependencies/services/comment_srv",
    "bundle!dependencies/services/postFrame_ctrl",
    "bundle!dependencies/services/comment_ctrl",
    "bundle!dependencies/services/post_srv"
], function(on, domClass, domStyle, domConstruct, nlsApp, template,
    Class, ITemplated, ItemsControl, commentSrv, postFrameCtrl, CommentCtrl, postSrv) {
    return Class.declare({
        "-parent-": ItemsControl,
        "-interfaces-": [ITemplated],
        "-protected-": {
            "-fields-": {
                nls: nlsApp,
                templateString: template,
                fontAwesome: FontAwesome,
                postFrame: null,
                postAvatar: runtime.currentUser.avatar,
                isExpanded: null,
                notiObj: null,
                isCommentInited: false,
                imageClass: "imageIcon",
                itemData: null
            },
            "-methods-": {
                init: function() {
                    this.eventBind();
                },

                comment: function(content) {
                    var self = this;
                    commentSrv.addComment({
                        target_id: self.itemData.id,
                        target_type: "Post",
                        text: content
                    }).then(Function.hitch(this, function(commentData) {
                        this.commentCallback({
                            commentData: commentData,
                            notiObj: {
                                targetType: "Post",
                                targetId: commentData.id
                            }
                        });
                        this.postFrame.postEnd(commentData);
                    }));
                },

                eventBind: function() {
                    var self = this;
                        self.expand();
                },

                initComments: function() {
                    this.commentsUl = domConstruct.create("ul", {
                        "class": "comments-ul"
                    });
                    this.initPostNode();
                    if (this.itemData.comments) {
                        this.itemData.comments.forEach(function(commentData) {
                            this.addCommentRow(commentData);
                        }, this);
                    }
                    this.commentsListNode.appendChild(this.commentsUl);
                    this.isCommentInited = true;
                },

                addCommentRow: function(args) {
                    // args: commentData, userInfo, notiObj
                    var li = domConstruct.create("li", {
                        "class": "comment-item"
                    });
                    var comment = this.commentNode = CommentCtrl.createInstance({
                        itemData: args,
                        subUserInfo: args.userInfo,
                        itemCaller: this
                    });
                    args.commentObj = comment;
                    // sub comment user @
                    on(comment, "subComment", Function.hitch(this, "commentCallback"));
                    li.appendChild(comment.domNode);
                    // try {
                    //     /////////////li is in the currentpage
                    //     domConstruct.place(li, MainLayout.commentPostLi, "after");
                    //     ///////////////////liNode is in the homepage
                    //     var liNode = lang.clone(li);
                    //     domConstruct.place(liNode, this.commentPostLi, "after");
                    // } catch (e) {
                    //     domConstruct.place(li, this.commentPostLi, "after");
                    // }
                    domConstruct.place(li, this.commentPostLi, "after");
                },

                initPostNode: function() {
                    if (this.postFrame) return;
                    var post = this.postFrame = postFrameCtrl.createInstance({
                        baseClass: "comment-post",
                        needHeader: false,
                        inputAnimation: true,
                        toolbarAttribute: {
                            toolbarContainer: this.domNode.parentNode,
                            toolbarPosition: {
                                top: 200,
                                left: 80
                            }
                        }
                    });

                    this.commentPostLi = domConstruct.create("li", {
                        "class": "post-item"
                    });

                    on(this.postFrame, "post", Function.hitch(this, "comment"));

                    this.commentPostLi.appendChild(post.domNode);
                    post.startup();
                    this.commentsUl.appendChild(this.commentPostLi);
                },

                expand: function() {
                    self = this;
                    if (!this.isCommentInited) {
                        domStyle.set(this.commentsWrapNode, "display", "block");
                        this.initComments();
                    } else {
                        domStyle.set(this.commentsWrapNode, "display", "block");
                        var nD = parseInt((new Date()).format("yyyymmdd"));
                        this.itemData.comments.forEach(function(comment) {
                            var tD = parseInt((new Date(comment.updatedAt)).format("yyyymmdd"));
                        });
                        this.isExpanded = true;
                        this.postFrame.inputNode.focus();
                    }
                },

                commentCallback: function(args) {
                    // args: commentData, userInfo, notiObj, text
                    if (this.itemData.comments) {
                        this.itemData.comments.push(args.commentData);
                    }
                    if (this.isCommentInited) this.addCommentRow(args.commentData);
                    // this.comment(args.comments.text);
                },

            }
        },

        "-public-": {
            "-attributes-": {

            },

            "-methods-": {},

        },

        "-constructor-": {
            initialize: function(params) {
                this.overrided(params);
                var self = this;
                postSrv.postComments(params.itemData.id).then(function(comments) {
                    Function.mixin(params.itemData, {
                        comments: comments
                    });
                    self.itemData = params.itemData;
                });
                this.init();
            }
        }
    });
});
