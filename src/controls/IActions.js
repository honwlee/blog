define([
    "bundle!context",
    "bundle!dependencies/services/blog_srv",
    "qscript/lang/Interface",
    "i18n!../nls/app",
    "toastr/toastr"
], function(context, blogsrv, Interface, nls, toastr) {
    return Interface.declare({
        "-parent-": Interface,
        "-protected-": {
            "-fields-": {},
            "-methods-": {}
        },

        "-public-": {
            "-attributes-": {},
            "-methods-": {
                deletePost: function(itemData) {
                    if (itemData) {
                        qfaceDialog.yesno({
                            message: nls.deleteConfirm
                        }).then(Function.hitch(this, function(yes) {
                            if (yes) {
                                var postId = itemData.id,
                                    self = this;
                                blogsrv.deletePost(postId).then(function(configData) {
                                    toastr.success(nls.deleteSuccessful);
                                    self.mainLayout.selectPage("list");
                                    self.mainLayout.refreshList();

                                });
                            }
                        }));
                    } else {
                        qfaceDialog.alert({
                            message: nls.selectFirst
                        });
                    }
                }
            }
        },

        "-constructor-": {
            instantiate: function() {}
        }
    });
});
