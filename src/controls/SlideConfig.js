define([
    "dojo/on",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "i18n!../nls/app",
    "i18n!utilhub/front/system/nls/common",
    "qscript/lang/Class",
    "qfacex/dijit/ITemplated",
    "utilhub/ItemsControl",
    "text!../templates/slideConfig.html",
    "dijit/form/Form",
    "dijit/form/TextBox",
    "dojo/parser",
    "dijit/form/HorizontalSlider",
    "dijit/form/HorizontalRule",
    "dijit/form/HorizontalRuleLabels"
], function(on, domClass, domStyle, domConstruct,nlsApp, nlsCommon, Class, ITemplated, ItemsControl, template) {
    return Class.declare({
        "-parent-": ItemsControl,
        "-interfaces-": [ITemplated],
        "-module-": "",
        "-protected-": {
            "-fields-": {
                 nls: nlsApp,
                itemData: {},
                templateString: template
            },
            "-methods-": {
                init: function() {
                    var self = this;
                    this.formNode.set("value", this.itemData);
                    on(this.saveNode, "click", function() {
                        var saveObj = Function.mixin(self.formNode.get("value"), {
                            "public": self.shareNode.checked
                        });
                        self.onSave(saveObj);
                    });
                    on(this.cancelNode, "click", function() {
                        self.onCancel();
                    });
                }
            }
        },
        "-public-": {
            "-attributes-": {
                nlsCommon: {
                    getter: function() {
                        return nlsCommon;
                    }
                }
            },
            "-methods-": {
                onCancel: function() {},
                onSave: function() {}
            }
        },
        "-constructor-": {
            initialize: function(params, srcNodeRef) {
                // this.item = Function.mixin({
                //     "x": params.itemData["data-x"] || "",
                //     "y": params.itemData["data-y"] || "",
                //     "z": params.itemData["data-z"] || "",
                //     "scale": params.itemData["data-scale"] || "",
                //     "rotate": params.itemData["data-rotate"] || "",
                //     "rotate_x": params.itemData["data-rotate-x"] || "",
                //     "rotate_y": params.itemData["data-rotate-y"] || "",
                //     "rotate_z": params.itemData["data-rotate-z"] || ""
                // }, params.itemData);
                this.overrided(params, srcNodeRef);
                this.init();
            }
        }
    });
});
