/**
 * Whiteboard directive definition
 *
 * @param $log
 * @constructor
 */

/* globals $ */

function WhiteboardDirective($log,
    $compile,
    dispatcherService,
    normalCoordinates,
    firebaseAppModel,
    remoteDispatcherService) {
    return {
        restrict: 'E',
        require: 'whiteboard',
        transclude: 'true',
        templateUrl: '/lightyear/modules/whiteboard/whiteboard.tpl.html',
        controller: 'WhiteboardController',

        link(scope, element) {
            $log.debug('[WhiteboardDirective] link function()');

            /* ******************************
             * Svg whiteboard elements
             ******************************/
            const svg = $(element).find('svg.whiteboard');
            scope.whiteboardModel.svgRoot = svg;
            const svgContent = $(element).find('.whiteboard-content');
            scope.whiteboardModel.svgContent = svgContent;

            /**
             * Communication with workspace
             */
            const workspaceFrame = document.getElementById('workspace').contentWindow;
            let listener = null;
            function refreshListener() {
                if (listener) {
                    remoteDispatcherService.deregisterListener(listener);
                }

                listener = remoteDispatcherService.registerListener(svg[0], workspaceFrame);
            }

            element.on('$destroy', () => {
                remoteDispatcherService.deregisterListener(listener);
            });

            function watchActivity() {
                if (firebaseAppModel.app.activeActivity) {
                    return firebaseAppModel.app.activeActivity.id;
                } else {
                    return null;
                }
            }

            scope.$watch(watchActivity, refreshListener);

            /* ******************************
             * Setup bindings
             *******************************/
            function setupListeners() {
                $log.debug('[WhiteboardDirective] setting up watch binding for elements.');
                dispatcherService.addListener(
                    'whiteboardChangeEvent', null, handleWhiteboardChange, this);
                dispatcherService.addListener(
                    'whiteboardSelectionChange', null, handleSelectionChange, this);
                dispatcherService.addListener(
                    'whiteboardInitialSelectionChange', null, handleInitialSelectionChange, this);
                dispatcherService.addListener(
                    'ShapeAnimationComplete', null, handleSelectionChange, this);
            }

            /* ******************************
             * Cursor
             *******************************/
            function contentCursorSrc() {
                return scope.whiteboardModel.whiteboard.contentCursor;
            }

            scope.$watch(contentCursorSrc, _.bind((newValue, oldValue) => {
                $log.debug(`[WhiteboardDirective] content cursor src has changed: ${newValue}`);
                if (oldValue !== newValue) {
                    updateContentCursor(newValue);
                }
            }, this));

            /* ******************************
             * Board Interaction Mode - If there is an active activity, if the user has a
             * non-pointer tool (drawing tool) or is using
             * a selector to move/resize/rotate something, or is using the pointer tool
             * with the shift key down, then their mouse events
             * should be handled by the board. Otherwise, pointer-events on the board as a
             * whole are disabled, and the events go "through"
             * the board to hit the workspace underneath.
             * (Shapes on the board always intercept mouse events)
             *******************************/
            scope.$watchGroup(
                ['whiteboardModel.whiteboard.selectedTool.name',
                'whiteboardSelectorModel.adjusting',
                'whiteboardModel.whiteboard.shiftDown',
                'whiteboardModel.whiteboard.selectedElements',
                'firebaseAppModel.app.activeActivity',
                'firebaseAppModel.app.widgetsboardActive',
            ], () => {
                scope.boardInteractionMode = (!(firebaseAppModel.app.activeActivity ||
                        firebaseAppModel.app.widgetsboardActive)) ||
                    scope.whiteboardModel.whiteboard.selectedTool.name !== 'LassoTool' ||
                    scope.whiteboardModel.whiteboard.selectedElements.length > 0 ||
                    scope.whiteboardSelectorModel.adjusting ||
                    scope.whiteboardModel.whiteboard.shiftDown;

                $log.debug(`[WhiteboardDirective] boardInteractionMode changed: \
                           ${scope.boardInteractionMode}`);
            });

            function pointerMode() {
                return scope.whiteboardModel.whiteboard.selectedTool.name === 'LassoTool';
            }

            scope.$watch(pointerMode, (newValue) => {
                // we're shimming SVG elements to support toggle class (in LanguageMixins.js)
                // so we need to do the .each() iteration here instead of chaining toggleClass
                // directly on the selector.
                $('.shape').each((index, item) => {
                    item.toggleClass('whiteboard-pointer-mode', newValue);
                });
            });

            /* ******************************
             * Whiteboard Deactivate
             *******************************/
            function whiteboardActive() {
                return firebaseAppModel.app.whiteboardActive;
            };

            scope.$watch(whiteboardActive, _.bind(function(newValue, oldValue) {
                $log.debug('[WhiteboardDirective] whiteboardActive has changed:' + newValue);
                if (oldValue !== newValue) {
                    if (newValue !== true) {
                        cancelDrawing();
                    }
                }

                if (!newValue) {
                    $('whiteboard').trigger('closeAllDropdowns');
                }
            }, this));

            /* ******************************
             * Mouse Event handlers
             *******************************/
            function mousedown(event) {
                if (scope.whiteboardModel.getMode() === 'normal' && scope.whiteboardModel.whiteboard.creationStatus === 'ready') {
                    $log.debug('[WhiteboardDirective] mousedown');
                    clearLasso();
                    if (scope.whiteboardModel.whiteboard.selectedTool !== undefined) {
                        // start initial action
                        const position = normalCoordinates.getNormalizedCoordinates(event, svg[0]);
                        addNewElement(position.x, position.y);
                        $log.debug('[WhiteboardDirective] shape is active and inprogess...');
                        scope.whiteboardModel.whiteboard.creationStatus = 'inProgress';
                        $log.debug('[WhiteboardDirective] adding mouse handlers');

                        // attach handlers
                        svg.on('mouseleave', mouseleave);
                        svg.on('mouseup', mouseup);
                        svg.on('mousemove', mousemove);
                    }
                }
            }

            function mouseleave(event) {
                mouseup(event);
            }

            function mousemove(event) {
                if (scope.whiteboardModel.getMode() === 'normal' ||
                    scope.whiteboardModel.whiteboard.shiftDown) {
                    const position = normalCoordinates.getNormalizedCoordinates(event, svg[0]);

                    //$log.debug('[WhiteboardDirective] move: ' + position.x + ' : ' + position.y);
                    scope.whiteboardModel.getActiveItem().updateShape(position.x, position.y, event.shiftKey);
                    update();
                }
            }

            function mouseup(event) {
                if (scope.whiteboardModel.getMode() === 'normal') {
                    $log.debug('[WhiteboardDirective] mouseup');
                    svg.off('mouseleave', mouseleave);
                    svg.off('mouseup', mouseup);
                    svg.off('mousemove', mousemove);

                    if (scope.whiteboardModel.whiteboard.selectedElements.length > 0) {
                        scope.whiteboardModel.clearSelection();
                    }

                    let activeItem = scope.whiteboardModel.getActiveItem();
                    if (activeItem) {
                        //LASSO TOOL BLOCK
                        if (scope.whiteboardModel.isWhiteboardSelectable()) {

                            let boundaryExtents = activeItem.getExtents();
                            let selectedShapes = [];
                            let intersectedShapes = [];
                            _.forEach(scope.whiteboardModel.whiteboard.elements, function(element) {
                                let controller = scope.whiteboardModel.getLocalReference(element.name);
                                let shapeExtents = controller.getExtents();
                                if (isShapeInBox(shapeExtents, boundaryExtents)) {
                                    selectedShapes.push(controller);
                                }

                                if (isPtInBox(shapeExtents, {
                                        x: boundaryExtents.x,
                                        y: boundaryExtents.y,
                                    })) {
                                    intersectedShapes.push(controller);
                                }
                            }, this);

                            scope.whiteboardModel.selectShapes(selectedShapes);
                            update();

                        } else {
                            //NORMAL SHAPES BLOCK
                            if (activeItem && activeItem.validateShape()) {
                                activeItem.getSvgElement().removeClass('shape-no-animate');
                                $log.debug('[WhiteboardDirective] mouseup: saving element');

                                //update the index again
                                activeItem.updateShapeProperty('index', scope.whiteboardModel.getIndex(), true);
                                try {
                                    scope.whiteboardModel.saveElement(activeItem.getShapeVO());
                                } catch (e) {
                                    //if there is an error saving an element, the only safe bet is to destroy it,
                                    //otherwise boards get out of sync. These errors are very sporadic, and seemed to
                                    //be caused by the fact that selection actions can occasionally lead to undefined
                                    //shape properties.
                                    $log.error('[WhiteboardDirective] Error saving element: ', activeItem.getShapeVO());
                                    $log.error('[WhiteboardDirective] with index: ', scope.whiteboardModel.getIndex());
                                    $log.error('[WhiteboardDirective] error: ', e);
                                    scope.whiteboardModel.destroyElement(activeItem);
                                    return;
                                }

                                $log.debug('[WhiteboardDirective] mouseup: selecting element');

                                if (scope.whiteboardModel.whiteboard.selectedTool.name === 'TextTool') {
                                    _.defer(_.bind(function() {
                                        scope.whiteboardModel.selectInitialShape(activeItem);
                                        update();

                                        _.defer(_.bind(function() {
                                            let shapeVO = activeItem.getShapeVO();
                                            if (shapeVO.type === 'text-shape') {
                                                startEditMode(activeItem);
                                            }
                                        }, this));
                                    }, this));
                                }

                                update();
                            } else {
                                $log.debug('[WhiteboardDirective] destroying invalid shape');
                                if (activeItem) {
                                    scope.whiteboardModel.removeLocalReference(activeItem);
                                    activeItem.destroyElement();
                                }
                            }
                        }
                    } else {
                        scope.whiteboardModel.clearSelection();
                    }

                    scope.whiteboardModel.whiteboard.creationStatus = 'ready';
                    scope.whiteboardModel.setActiveItemId(null);
                    clearLasso();
                }
            };

            let doubleclick = function(event) {
                $log.debug('[WhiteboardDirective] double click handler');
                if (event.target.nodeName === 'rect' && _.contains(event.target.classList, 'moveHandle')) {
                    let element = scope.whiteboardModel.whiteboard.selectedElements[0];
                    startEditMode(element);
                }

                update();
            };

            svg.on('mousedown', mousedown);
            svg.on('dblclick', doubleclick);

            let cancelDrawing = function() {
                $log.debug('[WhiteboardDirective] cancel drawing');
                svg.off('mouseleave', mouseleave);
                svg.off('mouseup', mouseup);
                svg.off('mousemove', mousemove);

                let activeItem = scope.whiteboardModel.getActiveItem();
                if (activeItem) {
                    scope.whiteboardModel.removeLocalReference(activeItem);
                    activeItem.destroyElement();
                } else {
                    scope.whiteboardModel.clearSelection();
                }

                scope.whiteboardModel.whiteboard.creationStatus = 'ready';
                scope.whiteboardModel.setActiveItemId(null);
                clearLasso();
            };

            /*******************************
             * Event handlers
             *******************************/
            let handleWhiteboardChange = function(event, data) {
                $log.debug('[WhiteboardDirective] whiteboard change event: ' + data.type + ' : ' + data.name);

                if (data.type === 'child_added') {
                    childAdded(data.element);
                } else if (data.type === 'child_removed') {
                    childRemoved(data.element);
                } else if (data.type === 'child_changed') {
                    childChanged(data.element, data.localChange);
                } else if (data.type === 'child_moved') {
                    childMoved(data.element, data.prevChildId);
                } else if (data.type === 'value') {
                    valueChanged(data.element);
                }
            };

            let handleSelectionChange = function(event) {
                //just redraw when the selector updates
                scope.whiteboardModel.updateSelector();

                update();
            };

            let handleInitialSelectionChange = function(event) {
                //just redraw when the selector updates
                scope.whiteboardModel.updateSelector(true);

                update();
            };

            /*******************************
             * Collection mutation handlers
             *******************************/
            let childAdded = function(element) {
                $log.debug('[WhiteboardDirective] child added: ' + element.name);

                //if there is no local object, then create one
                let elementRef = scope.whiteboardModel.getLocalReference(element.name);
                if (elementRef === undefined) {
                    addElement(element, true);
                } else {
                    elementRef.setShapeVO(element);
                }
            };

            let childRemoved = function(element) {
                $log.debug('[WhiteboardDirective] child removed: ' + element.name);

                //this data object has already been removed remotely so delete the local objects
                let elementRef = scope.whiteboardModel.getLocalReference(element.name);
                removeElement(elementRef);

                //deselect all shapes
                scope.whiteboardModel.selectShape(null);
            };

            let childChanged = function(element, localChange) {
                $log.debug('[WhiteboardDirective] child changed: ' + element);

                //get the local reference and update it
                let elementRef = scope.whiteboardModel.getLocalReference(element.name);

                //note: firebase child_remove can be followed by child_changed events on the deleted items
                //we'll ignore those changes since we handle them in child_remove
                if (elementRef) {
                    if (localChange) {
                        elementRef.setShapeVO(element);
                    } else {
                        elementRef.animateShapeVO(element);
                    }
                }

                //update the selector in case a selected element was changed
                _.defer(_.bind(function() {
                    if (localChange) {
                        scope.whiteboardModel.updateSelector();
                    } else {
                        scope.whiteboardModel.clearSelection();
                    }

                    update();
                }, this));

                update();
            };

            let childMoved = function(element, prevChild) {
                $log.debug('[WhiteboardDirective] child moved: ' + element.name);
                let prevElementData = scope.whiteboardModel.getElementData(prevChild);
                let elementRef = svgContent.find('#' + element.name);

                if (prevElementData) {
                    let prevElement = svgContent.find('#' + prevElementData.name);
                    elementRef.insertAfter(prevElement);
                } else {
                    svgContent.prepend(elementRef);
                }

                update();
            };

            let valueChanged = function(element) {
                $log.debug('[WhiteboardDirective] value changed: ' + element);
            };

            /*******************************
             * Dom manipulation api
             *******************************/
            /**
             * Add a new local element (created locally)
             * @param startX
             * @param startY
             */
            let addNewElement = function(startX, startY) {
                let selectedTool = scope.whiteboardModel.whiteboard.selectedTool;
                $log.debug('[WhiteboardDirective] creating new ' + selectedTool.name + ' element @ ' + startX + ':' + startY);
                let newScope = scope.$new();
                let data = {};

                _.defaults(data, _.clone(selectedTool.getDefaultSettings()));
                data.toolName = selectedTool.name;
                data.type = selectedTool.tagName;
                selectedTool.setStartPosition(data, startX, startY);
                data.name = scope.whiteboardModel.whiteboard.elements.generateId();
                data.index = scope.whiteboardModel.getIndex();
                newScope.data = data;
                $log.debug('[WhiteboardDirective] addNewElement data:' + JSON.stringify(data));
                scope.whiteboardModel.setActiveItemId(data.name);
                element = createElement(newScope);
                element[0].addClass('shape-no-animate');
                insertElement(newScope, element);

                update();
            };

            /**
             * Add a new element (created remotely)
             * @param data
             */
            let addElement = function(data, applyNow) {
                $log.debug('[WhiteboardDirective] creating element');
                let newScope = scope.$new();
                newScope.data = _.clone(data);

                let element = createElement(newScope);
                insertElement(data, element);
                if (applyNow) {
                    update();
                }

                //newScope.update();
            };

            /**
             * Remove element from the local ref store and destroy the element.
             * @param element
             */
            let removeElement = function(element) {
                if (element) {
                    $log.debug('[WhiteboardDirective] removing element: ' + element.getShapeVO().name);
                    scope.whiteboardModel.removeLocalReference(element);
                    element.destroyElement();
                }
            };

            let createElement = function(newScope) {
                let newElTmpl = _.template('<<%= tag %>></<%= tag %>>');
                let newEl = $(newElTmpl({
                    tag: newScope.data.type,
                }));
                let linkFn = $compile(newEl[0]);
                let element = linkFn(newScope);
                newScope.update();
                return element;
            };

            /**
             * Insert element into the appropriate index of the svg content area.
             * @param data
             * @param element
             */
            let insertElement = function(data, element) {
                let index = scope.whiteboardModel.getIndex(data.name);

                // $log.debug('[WhiteboardDirective] inserting new element with index: ' + index, element);
                let numElement = svgContent.children().length;
                if (pointerMode()) {
                    element[0].addClass('whiteboard-pointer-mode');
                }

                if (index === numElement) {
                    svgContent.append(element);
                } else {
                    element.insertAt(index, svgContent);
                }
            };

            /*******************************
             * Edit Mode
             *******************************/
            /**
             * Enter edit mode (text shapes)
             */
            let startEditMode = function(item) {
                //when we start text editing, send a remote event saying so, so that hotkey bindings in remote frames
                //can be disabled if necessary. PL-741
                let textevent = remoteDispatcherService.createCustomEventObject('textedit', {
                    editingText: true,
                });
                $(document).trigger(textevent);

                if (item && item.element && item.element[0].tagName === 'text') {
                    scope.whiteboardModel.setMode('textedit');
                    scope.whiteboardSelectorModel.showSelector(false);
                    let pt = normalCoordinates.getDenormalizedCoordinates(item, svg[0]);
                    let position = {
                        x: pt.x,
                        y: pt.y,
                    };
                    scope.whiteboardTextEditorModel.editShape(position, item);
                    $log.debug('[WhiteboardDirective] hiding svg shape');
                    $(item.getSvgElement()).hide();
                }

            };

            /*******************************
             * Cursor functions
             *******************************/
            let updateContentCursor = function(src) {
                $log.debug('[WBDirective] updating cursor');
                if (src === null) {
                    showDefaultCursor();
                    removeCursorListeners();
                } else {
                    addCursorListeners();
                }
            };

            let addCursorListeners = function() {
                svg.on('mouseout', showDefaultCursor);
                svg.on('mouseenter', showCustomCursor);
                svg.on('mouseover', showCustomCursor);
                svg.on('mouseleave', showCustomCursor);
            };

            let removeCursorListeners = function() {
                svg.off('mouseout', showDefaultCursor);
                svg.off('mouseenter', showCustomCursor);
                svg.off('mouseover', showCustomCursor);
                svg.off('mouseleave', showCustomCursor);
            };

            let showDefaultCursor = function() {
                let cursorCss = {
                    cursor: 'auto',
                };
                svg.css(cursorCss);
            };

            function showCustomCursor() {
                const customCursor = scope.whiteboardModel.whiteboard.contentCursor;
                let cursorCss;
                if (customCursor.type === 'img') {
                    cursorCss = {
                        cursor: `url(${scope.whiteboardModel.whiteboard.contentCursor}), pointer`,
                    };
                } else if (customCursor.type === 'css') {
                    cursorCss = {
                        cursor: customCursor.cursor,
                    };
                }

                svg.css(cursorCss);
            }

            /* ******************************
             * Misc utility functions
             *******************************/
            function clearLasso() {
                $('rect.lasso').remove();
            }

            function isPtInBox(targetExtents, pt) {
                if (pt.x > targetExtents.x && pt.x < targetExtents.x + targetExtents.width &&
                    pt.y > targetExtents.y && pt.y < targetExtents.y + targetExtents.height) {
                    return true;
                }

                return false;
            }

            function isShapeInBox(targetExtents, boundaryExtents) {
                if (targetExtents.x > boundaryExtents.x && targetExtents.y > boundaryExtents.y &&
                    targetExtents.x + targetExtents.width < boundaryExtents.x + boundaryExtents.width &&
                    targetExtents.y + targetExtents.height < boundaryExtents.y + boundaryExtents.height) {
                    return true;
                }

                return false;
            }

            function update() {
                scope.$evalAsync();
            }

            /* ******************************
             * Initialize instance
             *******************************/
            function init() {
                $log.debug('[WhiteboardDirective] initializing whiteboard directive');
                setupListeners();
            }

            init();
        },

    };
}

WhiteboardDirective.$inject = ['$log',
'$compile', 'dispatcherService',
'normalCoordinates', 'firebaseAppModel',
'remoteDispatcherService'];
module.exports = WhiteboardDirective;
