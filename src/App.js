define([
    "utilhub/Application",
    "bundle!dependencies/services/blog_srv",
    "bundle!dependencies/services/group_srv",
    "i18n!utilhub/front/system/nls/apps",
    "./controls/Layout"
], function(_App, blogSrv, groupSrv, nlsApps, Layout) {
    return Class.declare({
        "-parent-": _App,
        "-module-": "apps/Blog/App",
        "-protected-": {
            "-fields-": {
                isDeferred: true,
                winMaxed: false,
                width: 960,
                height: 600,
                title: nlsApps["blog"] || "Blog"
            }
        },

        "-public-": {
            "-methods-": {
                init: function(args) {
                    this.overrided();
                    var self = this,
                        obj = {
                            app: this
                        };
                    Function.mixin(obj, args || {});
                    if (args.groupId) {
                        groupSrv.initBlog(args.groupId).then(function(blog) {
                            obj.blog = blog;
                            self.mainLayout = new Layout(obj);
                            self.deferred.resolve();
                        });
                    } else {
                        blogSrv.init().then(function(memory) {
                            obj.blog = blogSrv.query({
                                userId: runtime.currentUserId
                            })[0];
                            self.mainLayout = new Layout(obj);
                            self.deferred.resolve();
                        });
                    }
                    return this.deferred.promise;
                },

                updateTitle: function(text) {
                    this.updateParentTitle(this.title + " - " + text);
                },

                onClose: function() {
                    this.mainLayout.closeCallback();
                },

                onMinimize: function() {
                    this.mainLayout.closeCallback();
                }
            }
        },

        "-constructor-": {
            initialize: function(args) {
                this.overrided(args);
            }
        }
    });
});
