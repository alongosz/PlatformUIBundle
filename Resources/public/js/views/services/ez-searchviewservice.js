/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-searchviewservice', function (Y) {
    "use strict";
    Y.namespace('eZ');

    Y.eZ.SearchViewService = Y.Base.create('searchViewService', Y.eZ.ViewService, [], {
        initializer: function () {
            var app = this.get('app');

            app.on('*:searchRequest', function(e) {
                app.navigateTo("doSearch", {
                    searchString: e.searchString,
                    limit: e.limit,
                });
            })
        },

        /**
         * Set the searchString and limit from the URL,
         * If there is a searchString make a fulltext search, stores the results,
         * and calls `callback` once it's done.
         *
         * @method _load
         * @protected
         * @param {Function} callback
         */
        _load: function (callback) {
            this.set('searchString', this.get('request').params.searchString);
            this.set('limit', this.get('request').params.limit ? Number(this.get('request').params.limit) : this.get('loadMoreAddingNumber'));

            if (this.get('searchString')) {
                this.search.findLocations({
                    viewName: 'search-' + this.get('searchString'),
                    loadContent: true,
                    loadContentType: true,
                    criteria: {
                        "FullTextCriterion": this.get('searchString'),
                    },
                    limit: this.get('limit'),
                    offset: 0
                }, Y.bind(function (error, results, resultCount) {
                    this.set('searchResultList', results);
                    this.set('searchResultCount', resultCount);
                    callback();
                }, this));
            } else {
                callback();
            }
        },

        _getViewParameters: function () {
            return {
                searchString: this.get('searchString'),
                searchResultList: this.get('searchResultList'),
                searchResultCount: this.get('searchResultCount'),
                loadMoreAddingNumber: this.get('loadMoreAddingNumber'),
                limit: this.get('limit'),
            };
        },

    }, {
        ATTRS: {
            /**
             * The number of elements that should increase the limit
             *  after loading more contents
             *
             * @attribute limit
             * @default 10
             * @type Number
             */
            loadMoreAddingNumber: {
                value: 10,
            },
            
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
             * The limit of the results
             *
             * @attribute limit
             * @type Number
             */
            limit: {},

        }
    });
    Y.eZ.PluginRegistry.registerPlugin(
        Y.eZ.Plugin.Search, ['searchViewService']
    );
});
