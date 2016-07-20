/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-draftconflictview', function (Y) {
    "use strict";

    /**
     * The Draft conflict confirm box view.
     *
     * @namespace eZ
     * @class DraftConflict
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.DraftConflict = Y.Base.create('draftConflictView', Y.eZ.TemplateBasedView, [], {
        events: {
            '.ez-draft-conflict-link': {
                'tap': '_processLink',
            },
        },

        render: function () {
            var container = this.get('container');

            container.setHTML(this.template({
                drafts: this._prepareDraftForDisplay(),
                content: this.get('content').toJSON(),
            }));
            return this;
        },

        /**
         * Prepares the list of draft to be displayed
         *
         * @method _prepareDraftForDisplay
         * @protected
         * @return {Array} of JSONified eZ.VersionInfo
         */
        _prepareDraftForDisplay: function () {
            var drafts = [];

            this.get('drafts').forEach(function (draft) {
                drafts.push(draft.toJSON());
            });

            return drafts;
        },

        /**
         *  Processes the link provided by the event.
         *
         * @protected
         * @method _processLink
         */
        _processLink: function (e) {
            e.preventDefault();
            this.fire('confirm', {route: e.target.getAttribute('href')});
        },

    }, {
        ATTRS: {
            /**
             * Draft to be displayed in the conflict screen
             *
             * @attribute drafts
             * @default []
             * @type {Array}
             */
            drafts: {
                value: [],
            },

            /**
             * Content being displayed
             *
             * @attribute content
             * @default {}
             * @type {eZ.Content}
             */
            content: {
                value: {},
            }
        },
    });
});
