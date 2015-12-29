define([
    "dojo/on",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "qscript/lang/Class",
    "qfacex/dijit/ITemplated",
    "utilhub/ItemsControl",
    "text!../templates/slide.html",
    "qfacex/dijit/infomation/WebFrame"
], function(on, domClass, domStyle, domConstruct, Class, ITemplated, ItemsControl, template) {
    return Class.declare({
        "-parent-": ItemsControl,
        "-interfaces-": [ITemplated],
        "-module-": "",
        "-protected-": {
            "-fields-": {
                templateString: template
            },
            "-methods-": {
                init: function() {
                    var url = "/" + runtime.currentUser.username + "/blog";
                    this.frameNode.url = window.location.protocol + "//" + window.location.host + url;
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
                this.init();
            }
        }
    });
});
