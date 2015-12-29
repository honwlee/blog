define([
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/query",
    "dojo/on",
    "dijit/popup",
    "i18n!../nls/app",
    "text!../templates/viewSetting.html",
    "dijit/ColorPalette",
    "qscript/lang/Class",
    "qfacex/dijit/ITemplated",
    "utilhub/ItemsControl",
    "qfacex/dijit/selection/Select"
], function(domClass, domStyle, query, on, popup, nlsApp, template, ColorPalette, Class, ITemplated, ItemsControl) {
    return Class.declare({
        "-parent-": ItemsControl,

        "-interfaces-": [ITemplated],

        "-protected-": {
            "-fields-": {
                templateString: template,
                fontAwesome: FontAwesome,
                item: null,
                baseClass: "blogPreSetPop"
            },

            "-methods-": {
                initStyle: function(attr, value) {
                    query(".post-content", this.mainLayout.domNode).forEach(function(div) {
                        domStyle.set(div, attr, value);
                    });
                }
            }
        },

        "-public-": {
            "-attributes-": {
                mainLayout: {
                    writable: true
                },

                nls: {
                    getter: function() {
                        return nlsApp;
                    }
                },
            },

            "-methods-": {

                init: function() {
                    on(this.colorPickerNode, "change", Function.hitch(this, "colorPicker"));
                    on(this.ffSelectorNode, "change", Function.hitch(this, "fontFamilyChange"));
                    on(this.fsSelectorNode, "change", Function.hitch(this, "fontSizeChange"));
                    // on(this.closeNode, "click", Function.hitch(this, "close"));
                },
                colorPicker: function() {
                    // if (this.isLoad) {
                    var color = this.colorPickerNode.value;
                    this.initStyle("color", color);
                    // }
                    // this.isLoad = true;
                },

                fontFamilyChange: function() {
                    var fontFamily = this.ffSelectorNode.value;
                    this.initStyle("fontFamily", fontFamily);
                },

                fontSizeChange: function() {
                    var fontSize = this.fsSelectorNode.value;
                    this.initStyle("fontSize", fontSize);
                },


                close: function() {
                    if (this.mainLayout) {
                        popup.close(this.mainLayout.settingDialog);
                        this.mainLayout.settingPopuped = false;
                    }
                }
            }
        },

        "-constructor-": {
            initialize: function( /*Object*/ params, /*DomNode|String?*/ srcNodeRef) {
                this.overrided(params, srcNodeRef);
                this.init();
            }
        }
    });
});
