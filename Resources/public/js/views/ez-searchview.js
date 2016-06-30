/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-searchview', function (Y) {
    "use strict";
    
    Y.namespace('eZ');

    Y.eZ.SearchView = Y.Base.create('searchView', Y.eZ.TemplateBasedView, [], {
        events: {
            '.ez-form': {
                'submit': '_handleFormSubmit'
            },
        },

        initializer: function () {
            this.after('userSearchStringChange', function() {
                this.fire('searchRequest', {
                    searchString: this.get('userSearchString'),
                    limit: this.get('loadMoreAddingNumber'),
                });
            });
            this.after('searchListView:offsetChange', function(e) {
                this._set('limit', this.get('limit') + this.get('loadMoreAddingNumber'));
                this.fire('searchRequest', {
                    searchString: this.get('searchString'),
                    limit: this.get('limit'),
                });
            });
        },

        render: function () {
            this.get('container').setHTML(
                this.template({
                    "searchString": this.get("searchString"),
                })
            );
            this._uiSetMinHeight();

            if (this.get('searchString')) {
                this._renderSearchListView();
            }
            return this;
        },

        /**
         * Renders the view which handle the list results
         *
         * @private
         * @method _renderSearchListView
         */
        _renderSearchListView: function () {
            this.get('container').one('.ez-searchlist-content').append(
                this.get('searchListView').render().get('container')
            );
        },

        _handleFormSubmit: function (e) {
            var form = e.currentTarget,
                searchString = form.get('searchstring').get('value');

            e.preventDefault();
            this._set('userSearchString', searchString);
        },

        /**
         * Sets the minimum height of the view
         *
         * @private
         * @method _uiSetMinHeight
         */
        _uiSetMinHeight: function () {
            var container = this.get('container');

            container.one('.ez-searchview-content').setStyle(
                'minHeight', container.get('winHeight') + 'px'
            );
        },
    }, {
        ATTRS: {
            /**
             * The search string the user wants to search
             *
             * @attribute userSearchString
             * @default true
             * @type Boolean
             * @readOnly
             */
            userSearchString: {
                readOnly: true
            },

            /**
             * The limit of the results
             *
             * @attribute limit
             * @type Number
             */
            limit: {},

            /**
             * The number of elements that should increase the limit
             *  after loading more contents
             *
             * @attribute limit
             * @type Number
             */
            loadMoreAddingNumber: {},

            /**
             * The search string used for the search request
             *
             * @attribute searchString
             * @default true
             * @type String
             */
            searchString: {},

            /**
             * The search result list containing the items to display
             *
             * @attribute searchResultList
             * @type Array
             */
            searchResultList: {},

            /**
             * The number of item returned by the searchRequest
             *
             * @attribute searchResultCount
             * @type Number
             */
            searchResultCount: {},

            /**
             * The view which handle the result list
             *
             * @attribute searchListView
             * @type Y.ez.SearchListView
             */
            searchListView: {
                writeOnce: 'initOnly',
                valueFn: function () {
                    return new Y.eZ.SearchListView({
                        items: this.get('searchResultList'),
                        searchResultCount: this.get('searchResultCount'),
                        limit: this.get('loadMoreAddingNumber'),
                        offset: this.get('limit'),
                        bubbleTargets: this,
                    });
                },
            },
        }
    });
});
