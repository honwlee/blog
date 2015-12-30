define([
    "qscript/lang/primitives/utils",
    "dijit/TooltipDialog",
    "qscript/lang/Interface",
], function(qUtils, TooltipDialog, Interface) {
    return Interface.declare({
        "-parent-": Interface,
        "-interfaces-": [],
        "-module-": "",
        "-protected-": {
            "-fields-": {

            },
            "-methods-": {

            }
        },
        "-public-": {
            "-attributes-": {

            },
            "-methods-": {
                startInterface: function(){
                    qUtils.on(this.contentNode, "mouseup", function(e) {
                        var html = self.getSelectionHtml();
                        if (html) self.createDigestTooltip(html, e);
                    });
                },
                createDigestTooltip: function(html, e) {
                    var self = this,
                        cNode = e.target,
                        span = qUtils.domConstruct.create("span", {
                            "class": "digestSpan",
                            innerHTML: "...",
                            style: "border:1px solid #ccc;",
                            offsetY: e.y,
                            offsetX: e.x
                        }),
                        cDialog = new TooltipDialog({
                            style: "background:#ccc;",
                            onMouseLeave: function() {
                                popup.close(cDialog);
                            }
                        }),
                        spanDialog = new TooltipDialog({
                            style: "background:#ccc;",
                            onMouseLeave: function() {
                                popup.close(spanDialog);
                            }
                        });

                    qUtils.on(span, 'mouseover', function() {
                        popup.open({
                            popup: spanDialog,
                            around: span
                        });
                    });

                    var content = html.innerHTML ? html.outerText : html;
                    if (!content || content.innerHTML === "") return;
                    var a = qUtils.domConstruct.create("a", {
                        // innerHTML: "Add Notes",
                        style: "border:1px solid #ccc;cursor: pointer;text-decoration: none;outline-style: none;",
                        "class": "addNotes " + FontAwesome.addNotes,
                        // "class": "addNotes" + FontAwesome.addNotes,
                        onclick: function() {
                            var itemDom = self.createDigestForm(content);
                            qUtils.domConstruct.place(span, cNode, "first");
                            spanDialog.set("content", itemDom);
                        }
                    });

                    popup.open({
                        popup: cDialog,
                        around: cNode
                    });
                    cDialog.set("content", a);
                },

                createDigestForm: function(content) {
                    var digestForm = new DigestForm({
                        title: "Create Digest",
                        mainLayout: this.mainLayout
                    });
                    digestForm.digestData = {
                        text: content
                    };
                    this.mainLayout.popup(digestForm);
                    return digestForm.itemDom;
                },

                getSelectionHtml: function() {
                    var html;
                    if (typeof window.getSelection != "undefined") {
                        var sel = window.getSelection();
                        if (sel.rangeCount) {
                            var container = qUtils.domConstruct.create("div");
                            for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                                container.appendChild(sel.getRangeAt(i).cloneContents());
                            }
                            html = container;
                        }
                    } else if (typeof document.selection != "undefined") {
                        if (document.selection.type == "Text") {
                            html = document.selection.createRange().htmlText;
                        }
                    }
                    return html;
                },
            }
        },
        "-constructor-": {
            instantiate: function() {}
        }
    });
});
