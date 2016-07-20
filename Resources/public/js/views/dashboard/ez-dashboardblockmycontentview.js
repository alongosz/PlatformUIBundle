/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-dashboardblockmycontentview', function (Y) {
    'use strict';

    /**
     * Provides the My Content Dashboard Block View class
     *
     * @module ez-dashboardblockmycontentview
     */
    Y.namespace('eZ');

    var BLOCK_IDENTIFIER = 'my-content',
        events = {
            '.ez-edit-content-button': {
                'tap': '_checkExistingDraft'
            },
        };

    /**
     * The all content dashboard block view
     *
     * @namespace eZ
     * @class DashboardBlockMyContentView
     * @constructor
     * @extends eZ.DashboardBlockAsynchronousView
     */
    Y.eZ.DashboardBlockMyContentView = Y.Base.create('dashboardBlockMyContentView', Y.eZ.DashboardBlockAsynchronousView, [], {
        initializer: function () {
            this.events = Y.merge(this.events, events);
            this._set('identifier', BLOCK_IDENTIFIER);
        },

        _getTemplateItem: function (item) {
            return {
                contentType: item.contentType.toJSON(),
                location: item.location.toJSON(),
                contentInfo: item.location.get('contentInfo').toJSON(),
            };
        },

        //TODO comment
        _checkExistingDraft: function(e) {
            var contentId = e.target.getAttribute('data-content-id');

            //TODO figure out why it doesn't work
            console.log('in the view');

            //TODO comment
            this.fire('checkExistingDraft', {
                contentId: contentId
            });
        },


        /**
         * Fires a `locationSearch` event to search for the last modified
         * content under the root Location.
         *
         * @method _fireLoadDataEvent
         * @protected
         */
        _fireLoadDataEvent: function () {
            var user = this.get('currentUser');

            this.fire('locationSearch', {
                viewName: 'my-content-' + user.get('userId'),
                resultAttribute: 'items',
                loadContentType: true,
                search: {
                    criteria: { UserMetadataCriterion: {
                        Target: "modifier",
                        Value: user.get('userId'),
                    }},
                    sortClauses: {DateModified: 'descending'},
                    limit: 10
                }
            });
        }
    });
});
