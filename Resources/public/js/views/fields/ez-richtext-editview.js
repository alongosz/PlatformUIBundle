/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-richtext-editview', function (Y) {
    "use strict";
    /**
     * Provides the field edit view for the RichText (ezrichtext) fields
     *
     * @module ez-richtext-editview
     */
    Y.namespace('eZ');

    var FIELDTYPE_IDENTIFIER = 'ezrichtext',
        L = Y.Lang,
        FOCUS_CLASS = 'is-focused',
        AlloyEditor = Y.eZ.AlloyEditor;

    /**
     * Rich Text edit view
     *
     * @namespace eZ
     * @class RichTextEditView
     * @constructor
     * @extends eZ.FieldEditView
     */
    Y.eZ.RichTextEditView = Y.Base.create('richTextEditView', Y.eZ.FieldEditView, [], {
        events: {
            '.ez-richtext-switch-focus': {
                'tap': '_setFocusMode',
            }
        },

        initializer: function () {
            this.after('activeChange', function (e) {
                if ( this.get('active') ) {
                    this._initEditor();
                } else {
                    this.get('editor').destroy();
                }
            });
            this.after('*:saveReturnAction', this._unsetFocusMode);
            this.after('focusModeChange', this._uiFocusMode);
        },

        destructor: function () {
            this.get('actionBar').destroy();
        },

        render: function () {
            Y.eZ.RichTextEditView.superclass.render.call(this);
            this.get('container').one('.ez-focusmodeactionbar-container').append(
                this.get('actionBar').render().get('container')
            );
            return this;
        },

        /**
         * `focusModeChange` event handler, it adds or removes the focused
         * class on the view container.
         *
         * @method _uiFocusMode
         * @protected
         */
        _uiFocusMode: function () {
            var container = this.get('container');

            if ( this.get('focusMode') ) {
                container.addClass(FOCUS_CLASS);
            } else {
                container.removeClass(FOCUS_CLASS);
            }
        },

        /**
         * tap event handler on the focus button.
         *
         * @method _setFocusMode
         * @protected
         * @param {EventFacade} e
         */
        _setFocusMode: function (e) {
            e.preventDefault();
            this._set('focusMode', true);
        },

        /**
         * `saveReturnAction` event handler.
         *
         * @method _unsetFocusMode
         * @protected
         */
        _unsetFocusMode: function () {
            this._set('focusMode', false);
        },

        /**
         * Initializes the editor
         *
         * @protected
         * @method _initEditor
         */
        _initEditor: function () {
            var editor, nativeEd, valid;

            editor = Y.eZ.AlloyEditor.editable(
                this._getEditableArea().getDOMNode(), {
                    toolbars: this.get('toolbarsConfig'),
                }
            );
            nativeEd = editor.get('nativeEditor');
            valid = Y.bind(this.validate, this);

            nativeEd.on('blur', valid);
            nativeEd.on('focus', valid);
            nativeEd.on('change', valid);
            this._set('editor', editor);
        },

        validate: function () {
            if ( !this.get('fieldDefinition').isRequired ) {
                this.set('errorStatus', false);
                return;
            }
            if ( this._isEmpty() ) {
                this.set('errorStatus', "This field is required");
            } else {
                this.set('errorStatus', false);
            }
        },

        /**
         * Checks whether the field is empty. The field is considered empty if:
         *   * there's no section element
         *   * or the section element has no child
         *   * or the section element has only child without content
         *
         * @method _isEmpty
         * @protected
         * @return {Boolean}
         */
        _isEmpty: function () {
            var section = Y.Node.create(this.get('editor').get('nativeEditor').getData()),
                hasChildNodes = function (element) {
                    return !!element.get('children').size();
                },
                hasChildWithContent = function (element) {
                    return element.get('children').some(function (node) {
                        return L.trim(node.get('text')) !== '';
                    });
                };

            return !section || !hasChildNodes(section) || !hasChildWithContent(section);
        },

        /**
         * Returns the editable area
         *
         * @method _getEditableArea
         * @protected
         * @return {Node}
         */
        _getEditableArea: function () {
            return this.get('container').one('.ez-richtext-editable');
        },

        _variables: function () {
            return {
                "isRequired": this.get('fieldDefinition').isRequired,
                "xhtml": this._serializeFieldValue(),
            };
        },

        /**
         * Returns a Document object or null if the parser failed to load the
         * xhtml5edit version of the rich text field.
         *
         * @method _getDOMDocument
         * @return {Document}
         */
        _getDOMDocument: function () {
            var doc = (new DOMParser()).parseFromString(this.get('field').fieldValue.xhtml5edit, "text/xml");

            if ( !doc || !doc.documentElement || doc.querySelector("parsererror") ) {
                console.warn(
                    "Unable to parse the content of the RichText field #" + this.get('field').id
                );
                return null;
            }
            return doc;
        },

        /**
         * Serializes the Document to a string
         *
         * @method _serializeFieldValue
         * @protected
         * @return {String}
         */
        _serializeFieldValue: function () {
            var doc = this._getDOMDocument();

            if ( !doc ) {
                return "";
            }
            if ( !doc.documentElement.hasChildNodes() ) {
                // making sure to have at least a paragraph element
                // otherwise CKEditor adds a br to make sure the editor can put
                // the caret inside the element.
                doc.documentElement.appendChild(doc.createElement('p'));
            }
            return (new XMLSerializer()).serializeToString(doc.documentElement);
        },

        /**
         * Returns the field value suitable for the REST API based on the
         * current input.
         *
         * @method _getFieldValue
         * @protected
         * @return String
         */
        _getFieldValue: function () {
            return {xml: this.get('editor').get('nativeEditor').getData()};
        },
    }, {
        ATTRS: {
            /**
             * The action bar displayed when in focus mode.
             *
             * @attribute actionBar
             * @type {eZ.RichTextFocusModeBarView}
             */
            actionBar: {
                valueFn: function () {
                    return new Y.eZ.RichTextFocusModeBarView({
                        content: this.get('content'),
                        bubbleTargets: this,
                    });
                },
            },

            /**
             * Stores the focus mode state. When true, the rich text UI is
             * supposed to be fullscreen with an action bar on the right.
             *
             * @attribute focusMode
             * @type {Boolean}
             * @readOnly
             */
            focusMode: {
                value: false,
                readOnly: true,
            },

            /**
             * The AlloyEditor
             *
             * @attribute editor
             * @type AlloyEditor.Core
             */
            editor: {
                value: null,
                readOnly: true,
            },

            /**
             * AlloyEditor toolbar configuration
             *
             * @attribute toolbarsConfig
             * @type {Object}
             */
            toolbarsConfig: {
                value: {
                    styles: {
                        selections: [{
                            name: 'link',
                            buttons: ['linkEdit'],
                            test: AlloyEditor.SelectionTest.link
                        }, {
                            name: 'text',
                            buttons: [
                                'bold', 'italic', 'underline',
                                'paragraphLeft', 'paragraphCenter', 'paragraphRight', 'paragraphJustify',
                                'ul', 'ol',
                                'link',
                            ],
                            test: AlloyEditor.SelectionTest.text
                        }, {
                            name: 'table',
                            buttons: ['tableRow', 'tableColumn', 'tableCell', 'tableRemove'],
                            getArrowBoxClasses: AlloyEditor.SelectionGetArrowBoxClasses.table,
                            setPosition: AlloyEditor.SelectionSetPosition.table,
                            test: AlloyEditor.SelectionTest.table
                        }],
                        tabIndex: 1
                    }
                }
            },
        }
    });

    Y.eZ.FieldEditView.registerFieldEditView(
        FIELDTYPE_IDENTIFIER, Y.eZ.RichTextEditView
    );
});
