/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-editcontentplugin', function (Y) {
    "use strict";
    /**
     * Provides the edit content plugin
     *
     * @module ez-editcontentplugin
     */
    Y.namespace('eZ.Plugin');

    /**
     * Object user load plugin. It sets an event handler to load contents
     * in an object relation list field.
     * //TODO update
     * In order to use it you need to fire the `loadUser` event with two parameters:
     *  - `userId` of the user to be loaded
     *  - `attributeName` where to store the result
     *
     * @namespace eZ.Plugin
     * @class UserLoad
     * @constructor
     * @extends eZ.Plugin.ViewServiceBase
     */
    Y.eZ.Plugin.EditContent = Y.Base.create('editContentplugin', Y.eZ.Plugin.ViewServiceBase, [], {

        initializer: function () {
            this.onHostEvent('*:editContentRequest', this._editContent);
        },

        /**
         * editAction event handler, makes the application navigate to edit the
         * content available in the event facade
         *
         * @method _editContent
         * @protected
         * @param {Object} e event facade of the editAction event
         * //TODO need content
         * //TODO need languageCode
         */
        _editContent: function (e) {
            var service = this.get('host'),
                app = service.get('app'),
                content = e.content,
                languageCode = e.languageCode,
                callback = function(error, versions) {
                    app.set('loading', false);
                    if (error) {
                        return;
                    }

                    if (versions.DRAFT && versions.DRAFT.length > 1) {
                        service.fire('confirmBoxOpen', {
                            config: {
                                title: "Select an Open Draft",
                                view: new Y.eZ.DraftConflict({
                                    drafts: versions.DRAFT,
                                    content: content
                                }),
                                button: false,
                                confirmHandler: function (e) {
                                    app.navigate(e.route);

                                    //TODO comment
                                    service.fire('confirmBoxClose');
                                },
                            },
                        });
                    } else {
                        app.navigate(
                            app.routeUri('editContent', {
                                id: content.get('id'),
                                languageCode: languageCode
                            })
                        );
                    }
                };

            app.set('loading', true);

            /**
             * Fired when versions are about to be loaded
             *
             * @event loadVersions
             */
            service.fire('loadVersions',{
                content: content,
                callback: Y.bind(callback, service)
            });
        },
    }, {
        NS: 'editContent',

        ATTRS: {
            // /**
            //  * User Model constructor
            //  *
            //  * @attribute userModelConstructor
            //  * @default Y.eZ.User
            //  * @type Function
            //  */
            // userModelConstructor: {
            //     value: Y.eZ.User
            // }
        },
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.eZ.Plugin.EditContent, ['locationViewViewService']
    );
});
