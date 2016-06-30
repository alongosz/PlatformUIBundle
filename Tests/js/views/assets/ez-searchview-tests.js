/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-searchview-tests', function (Y) {
    var viewTest, minimizeTest, attributesTest, restoreTest, updateDisableTest,
        Mock = Y.Mock, Assert = Y.Assert;

    viewTest = new Y.Test.Case({
        name: "eZ Search view tests",

        setUp: function () {
            var that = this,
                RenderedView = Y.Base.create('searchListView', Y.View, [], {
                render: function () {
                    this.set('rendered', true);
                    return this;
                },
            }, {
                ATTRS: {
                    offset: {
                        value: 10,
                    },
                    bubbleTargets: that.view,
                }
            });

            this.items = [{}];

            this.searchListView = new RenderedView();

            this.view = new Y.eZ.SearchView({
                searchResultList: this.items,
                searchListView: this.searchListView,
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should render the view": function () {
            var templateCalled = false,
                origTpl,
                container = this.view.get('container');

            origTpl = this.view.template;
            this.view.template = function () {
                templateCalled = true;
                return origTpl.apply(this, arguments);
            };
            this.view.render();
            Assert.isTrue(
                templateCalled,
                "The template should have used to render the view"
            );

            Assert.isUndefined(
                this.view.get('searchListView').get('rendered'),
                "The search List view should Not have been rendered"
            );

            Assert.areNotEqual(
                "", this.view.get('container').getHTML(),
                "View container should contain the result of the view"
            );

            Assert.areEqual(
                container.one('.ez-searchview-content').getStyle('min-height'),
                container.get('winHeight') + 'px'
            );

        },

        "Should render the searchListView if View contains a searchString": function () {
            this.view.set('searchString', 'AnySearch');

            this.view.render();

            Assert.isTrue(
                this.view.get('searchListView').get('rendered'),
                "The search List view should have been rendered"
            );
        },

        "Should fire a search request after changing userSearchString": function () {
            var searchRequestFired = false,
                userSearchString = "AnySearch",
                limit = 10;

            this.view.on('*:searchRequest', function(e) {
                searchRequestFired = true;
                Assert.areSame(
                    e.searchString, userSearchString,
                    "the searchRequest should have the userSearchString in param"
                );
                Assert.areSame(
                    e.limit, limit,
                    "the searchRequest should have the limit in param"
                );
            });
            this.view.set('loadMoreAddingNumber', limit);
            this.view.render();

            this.view.set('userSearchString', 'AnySearch');
            Assert.isTrue(
                searchRequestFired,
                "searchRequest should have been fired after userSearchStringChange"
            );
        },

        "Should set the limit and fire a search request": function () {
            var searchRequestFired = false,
                searchString = "AnySearch",
                limit = 10,
                loadMoreAddingNumber = 42,
                that = this;

            this.view.on('*:searchRequest', function(e) {
                searchRequestFired = true;
                Assert.areSame(
                    e.searchString, searchString,
                    "the searchRequest should have the userSearchString in param"
                );
                Assert.areSame(
                    e.limit, that.view.get('limit'),
                    "the searchRequest should have the limit in param"
                );
            });
            this.view.set('searchString', 'AnySearch');

            this.view.set('limit', limit);
            this.view.set('loadMoreAddingNumber', loadMoreAddingNumber);

            this.view.render();

            this.view.get('searchListView').set('offset', '12');
            this.view.fire('searchListView:offsetChange');

            Assert.isTrue(
                searchRequestFired,
                "searchRequest should have been fired after offsetChange"
            );
            Assert.areSame(
                that.view.get('limit'), limit + loadMoreAddingNumber,
                "The limit should be updated"
            );
        },

        "Should set the userSearchString after submitting form": function () {
            var container = this.view.get('container');

            this.view.render();

            container.one('.ez-form-input').set('value', 'SomeResearch');
            container.one('form button[type="submit"]').focus();
            container.one('form button[type="submit"]').simulate('click');
            Assert.areSame(
                this.view.get('userSearchString'),
                'SomeResearch',
                'Submitting form should set userSearchString'
            )
        },
    });

    Y.Test.Runner.setName("eZ Search view tests");
    Y.Test.Runner.add(viewTest);

}, '', {requires: ['test', 'event-valuechange', 'node-event-simulate', 'ez-searchview', 'ez-searchlistview']});
