define([
    "dojo/on",
    "dojo/dom-construct",
    "qscript/lang/Class",
    "utilhub/front/comctrls/BaseUi",
    "text!../templates/setting.html",
    "i18n!../nls/app"
], function(on, domConstruct, Class, BaseUi, template, nlsApp) {
    return Class.declare({
        "-parent-": BaseUi,
        "-protected-": {
            "-fields-": {
                "$$contentTemplate": template,
                baseClass: "setting",
                fontAwesome: FontAwesome
            },
            "-methods-": {}
        },

        "-public-": {
            "-attributes-": {
                title: {
                    type: String,
                    "default": ""
                },

                description: {
                    type: String,
                    "default": ""
                },

                mainLayout: {
                    writable: true,
                    "default": null
                },

                nls: {
                    getter: function() {
                        return nlsApp;
                    }
                }
            },

            "-methods-": {
                init: function() {
                    this.overrided();
                },

                start: function() {

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
});
