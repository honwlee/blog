define([
    "dojo/dom-construct",
    "text!../templates/friend.html",
    "qfacex/dijit/ITemplated",
    "utilhub/ItemsControl",
    "qscript/lang/Class"
], function(domConstruct, template, ITemplated, ItemsControl, Class) {
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

                },

                fillCenter: function() {
                    this.centerNode.innerHTML = "";
                    var ol = domConstruct.create("ol", {
                        "class": "posts-list"
                    });

                    // query with options
                    this.item.list.forEach(function(item, index) {
                        var listItem = this.createListItem(ol, item);
                        if (index === 0) this.currentItem = listItem;
                    }, this);
                    this.centerNode.appendChild(ol);
                },

                createListItem: function(ol, item) {
                    var self = this;
                    var itemNode = domConstruct.toDom(stringUtil.substitute(simpleListItem, {
                        title: item.title,
                        date: (new Date(item.createDate)).toLocaleDateString(),
                        fAClass: item.usage ? self.fontAwesome.post : self.fontAwesome.rss,
                        tags: item.tagString,
                        tagClass: self.fontAwesome.tags
                    }));

                    var node = itemNode.firstChild;

                    on(node, "click", function() {
                        self.currentItem = {
                            li: this,
                            data: item
                        };
                    });
                    ol.appendChild(node);
                    return {
                        li: node,
                        data: item
                    };
                }
            }
        },

        "-public-": {
            "-attributes-": {
                item: {

                }
            },

            "-methods-": {

            }
        },

        "-constructor-": {
            initialize: function(params, srcNodeRef) {
                this.overrided(params, srcNodeRef);
            }
        }
    });
});
