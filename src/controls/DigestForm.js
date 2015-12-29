define([
    "dojo/on",
    "dojo/string",
    "dojo/dom-construct",
    "qscript/lang/Class",
    "utilhub/front/comctrls/BaseDialog",
    "text!../templates/digestForm.html",
    "text!../templates/digest.html",
    "i18n!../nls/app",
    "qfacex/dijit/text/SimpleTextarea",
    "qfacex/dijit/text/TextBox",
    "qfacex/dijit/button/Button"
], function(on, stringUtil, domConstruct, Class, BaseDialog, formTemplate, digestItem, nlsApp) {
    return Class.declare({
        "-parent-": BaseDialog,

        "-protected-": {
            "-fields-": {
                "$$contentTemplate": formTemplate,
                mainClass: "digestForm",
                fontAwesome: FontAwesome,
                itemDom: null,
                "_": {
                    width: 400,
                    height: 200
                }
            },

            "-methods-": {
                init: function() {
                    this.overrided();
                    var self = this;
                    on(this.saveNode, function() {
                        this.close();
                    });

                    on(this.cancelNode, function() {
                        this.close();
                    });
                }
            }
        },

        "-public-": {
            "-attributes-": {
                mainLayout: {
                    type: Object,
                    writable: true,
                    "default": null
                },

                nls: {
                    getter: function() {
                        return nlsApp;
                    }
                },
                digestData: {
                    type: Object,
                    setter: function(data) {
                        var _ = this._;
                        _.digestData = data;
                        if (data.text) this.selectionNode.innerHTML = data.text;
                        // if (data.title) this["form-title"].set("value", data.title);
                        // if (data.text) this["form-text"].set("value", data.text);
                        var itemNode = domConstruct.toDom(stringUtil.substitute(digestItem, {
                            title: this.digestData.title || "",
                            text: this.digestData.text,
                        }));
                        this.itemDom = itemNode.firstChild;
                    }
                }
            },

            "-methods-": {

            }
        },

        "-constructor-": {
            initialize: function( /*Object*/ params, /*DomNode|String?*/ srcNodeRef) {
                params.width = this.width || 400;
                params.height = this.height || 200;
                params.app = params.mainLayout.app;
                this.overrided(params, srcNodeRef);
                this.init();
            }
        }
    });
});
