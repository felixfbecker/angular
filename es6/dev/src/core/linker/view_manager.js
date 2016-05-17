var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Inject, Injectable } from 'angular2/src/core/di';
import { isPresent, isBlank } from 'angular2/src/facade/lang';
import { ListWrapper, StringMapWrapper } from 'angular2/src/facade/collection';
import { BaseException } from 'angular2/src/facade/exceptions';
import { flattenNestedViewRenderNodes, findLastRenderNode } from './view';
import { RootRenderer, RenderComponentType } from 'angular2/src/core/render/api';
import { wtfCreateScope, wtfLeave } from '../profile/profile';
import { APP_ID } from 'angular2/src/core/application_tokens';
import { ViewType } from './view_type';
/**
 * Service exposing low level API for creating, moving and destroying Views.
 *
 * Most applications should use higher-level abstractions like {@link DynamicComponentLoader} and
 * {@link ViewContainerRef} instead.
 */
export class AppViewManager {
}
export let AppViewManager_ = class AppViewManager_ extends AppViewManager {
    constructor(_renderer, _appId) {
        super();
        this._renderer = _renderer;
        this._appId = _appId;
        this._nextCompTypeId = 0;
        /** @internal */
        this._createRootHostViewScope = wtfCreateScope('AppViewManager#createRootHostView()');
        /** @internal */
        this._destroyRootHostViewScope = wtfCreateScope('AppViewManager#destroyRootHostView()');
        /** @internal */
        this._createEmbeddedViewInContainerScope = wtfCreateScope('AppViewManager#createEmbeddedViewInContainer()');
        /** @internal */
        this._createHostViewInContainerScope = wtfCreateScope('AppViewManager#createHostViewInContainer()');
        /** @internal */
        this._destroyViewInContainerScope = wtfCreateScope('AppViewMananger#destroyViewInContainer()');
        /** @internal */
        this._attachViewInContainerScope = wtfCreateScope('AppViewMananger#attachViewInContainer()');
        /** @internal */
        this._detachViewInContainerScope = wtfCreateScope('AppViewMananger#detachViewInContainer()');
    }
    getViewContainer(location) {
        return location.internalElement.getViewContainerRef();
    }
    getHostElement(hostViewRef) {
        var hostView = hostViewRef.internalView;
        if (hostView.proto.type !== ViewType.HOST) {
            throw new BaseException('This operation is only allowed on host views');
        }
        return hostView.appElements[0].ref;
    }
    getNamedElementInComponentView(hostLocation, variableName) {
        var appEl = hostLocation.internalElement;
        var componentView = appEl.componentView;
        if (isBlank(componentView)) {
            throw new BaseException(`There is no component directive at element ${hostLocation}`);
        }
        for (var i = 0; i < componentView.appElements.length; i++) {
            var compAppEl = componentView.appElements[i];
            if (StringMapWrapper.contains(compAppEl.proto.directiveVariableBindings, variableName)) {
                return compAppEl.ref;
            }
        }
        throw new BaseException(`Could not find variable ${variableName}`);
    }
    getComponent(hostLocation) {
        return hostLocation.internalElement.getComponent();
    }
    createRootHostView(hostViewFactoryRef, overrideSelector, injector, projectableNodes = null) {
        var s = this._createRootHostViewScope();
        var hostViewFactory = hostViewFactoryRef.internalHostViewFactory;
        var selector = isPresent(overrideSelector) ? overrideSelector : hostViewFactory.selector;
        var view = hostViewFactory.viewFactory(this._renderer, this, null, projectableNodes, selector, null, injector);
        return wtfLeave(s, view.ref);
    }
    destroyRootHostView(hostViewRef) {
        var s = this._destroyRootHostViewScope();
        var hostView = hostViewRef.internalView;
        hostView.renderer.detachView(flattenNestedViewRenderNodes(hostView.rootNodesOrAppElements));
        hostView.destroy();
        wtfLeave(s);
    }
    createEmbeddedViewInContainer(viewContainerLocation, index, templateRef) {
        var s = this._createEmbeddedViewInContainerScope();
        var contextEl = templateRef.elementRef.internalElement;
        var view = contextEl.embeddedViewFactory(contextEl.parentView.renderer, this, contextEl, contextEl.parentView.projectableNodes, null, null, null);
        this._attachViewToContainer(view, viewContainerLocation.internalElement, index);
        return wtfLeave(s, view.ref);
    }
    createHostViewInContainer(viewContainerLocation, index, hostViewFactoryRef, dynamicallyCreatedProviders, projectableNodes) {
        var s = this._createHostViewInContainerScope();
        // TODO(tbosch): This should be specifiable via an additional argument!
        var viewContainerLocation_ = viewContainerLocation;
        var contextEl = viewContainerLocation_.internalElement;
        var hostViewFactory = hostViewFactoryRef.internalHostViewFactory;
        var view = hostViewFactory.viewFactory(contextEl.parentView.renderer, contextEl.parentView.viewManager, contextEl, projectableNodes, null, dynamicallyCreatedProviders, null);
        this._attachViewToContainer(view, viewContainerLocation_.internalElement, index);
        return wtfLeave(s, view.ref);
    }
    destroyViewInContainer(viewContainerLocation, index) {
        var s = this._destroyViewInContainerScope();
        var view = this._detachViewInContainer(viewContainerLocation.internalElement, index);
        view.destroy();
        wtfLeave(s);
    }
    // TODO(i): refactor detachViewInContainer+attachViewInContainer to moveViewInContainer
    attachViewInContainer(viewContainerLocation, index, viewRef) {
        var viewRef_ = viewRef;
        var s = this._attachViewInContainerScope();
        this._attachViewToContainer(viewRef_.internalView, viewContainerLocation.internalElement, index);
        return wtfLeave(s, viewRef_);
    }
    // TODO(i): refactor detachViewInContainer+attachViewInContainer to moveViewInContainer
    detachViewInContainer(viewContainerLocation, index) {
        var s = this._detachViewInContainerScope();
        var view = this._detachViewInContainer(viewContainerLocation.internalElement, index);
        return wtfLeave(s, view.ref);
    }
    /** @internal */
    onViewCreated(view) { }
    /** @internal */
    onViewDestroyed(view) { }
    /** @internal */
    createRenderComponentType(encapsulation, styles) {
        return new RenderComponentType(`${this._appId}-${this._nextCompTypeId++}`, encapsulation, styles);
    }
    _attachViewToContainer(view, vcAppElement, viewIndex) {
        if (view.proto.type === ViewType.COMPONENT) {
            throw new BaseException(`Component views can't be moved!`);
        }
        var nestedViews = vcAppElement.nestedViews;
        if (nestedViews == null) {
            nestedViews = [];
            vcAppElement.nestedViews = nestedViews;
        }
        ListWrapper.insert(nestedViews, viewIndex, view);
        var refNode;
        if (viewIndex > 0) {
            var prevView = nestedViews[viewIndex - 1];
            refNode = prevView.rootNodesOrAppElements.length > 0 ?
                prevView.rootNodesOrAppElements[prevView.rootNodesOrAppElements.length - 1] :
                null;
        }
        else {
            refNode = vcAppElement.nativeElement;
        }
        if (isPresent(refNode)) {
            var refRenderNode = findLastRenderNode(refNode);
            view.renderer.attachViewAfter(refRenderNode, flattenNestedViewRenderNodes(view.rootNodesOrAppElements));
        }
        // TODO: This is only needed when a view is destroyed,
        // not when it is detached for reordering with ng-for...
        vcAppElement.parentView.changeDetector.addContentChild(view.changeDetector);
        vcAppElement.traverseAndSetQueriesAsDirty();
    }
    _detachViewInContainer(vcAppElement, viewIndex) {
        var view = ListWrapper.removeAt(vcAppElement.nestedViews, viewIndex);
        if (view.proto.type === ViewType.COMPONENT) {
            throw new BaseException(`Component views can't be moved!`);
        }
        vcAppElement.traverseAndSetQueriesAsDirty();
        view.renderer.detachView(flattenNestedViewRenderNodes(view.rootNodesOrAppElements));
        // TODO: This is only needed when a view is destroyed,
        // not when it is detached for reordering with ng-for...
        view.changeDetector.remove();
        return view;
    }
};
AppViewManager_ = __decorate([
    Injectable(),
    __param(1, Inject(APP_ID)), 
    __metadata('design:paramtypes', [RootRenderer, String])
], AppViewManager_);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld19tYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC13M3czekFVcS50bXAvYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL3ZpZXdfbWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7T0FBTyxFQUVMLE1BQU0sRUFFTixVQUFVLEVBR1gsTUFBTSxzQkFBc0I7T0FDdEIsRUFBQyxTQUFTLEVBQUUsT0FBTyxFQUFVLE1BQU0sMEJBQTBCO09BQzdELEVBQUMsV0FBVyxFQUFFLGdCQUFnQixFQUFDLE1BQU0sZ0NBQWdDO09BQ3JFLEVBQUMsYUFBYSxFQUFDLE1BQU0sZ0NBQWdDO09BQ3JELEVBQTJCLDRCQUE0QixFQUFFLGtCQUFrQixFQUFDLE1BQU0sUUFBUTtPQWExRixFQUFDLFlBQVksRUFBRSxtQkFBbUIsRUFBQyxNQUFNLDhCQUE4QjtPQUN2RSxFQUFDLGNBQWMsRUFBRSxRQUFRLEVBQWEsTUFBTSxvQkFBb0I7T0FDaEUsRUFBQyxNQUFNLEVBQUMsTUFBTSxzQ0FBc0M7T0FFcEQsRUFBQyxRQUFRLEVBQUMsTUFBTSxhQUFhO0FBRXBDOzs7OztHQUtHO0FBQ0g7QUFnSkEsQ0FBQztBQUdELDJEQUFxQyxjQUFjO0lBR2pELFlBQW9CLFNBQXVCLEVBQTBCLE1BQWM7UUFBSSxPQUFPLENBQUM7UUFBM0UsY0FBUyxHQUFULFNBQVMsQ0FBYztRQUEwQixXQUFNLEdBQU4sTUFBTSxDQUFRO1FBRjNFLG9CQUFlLEdBQVcsQ0FBQyxDQUFDO1FBbUNwQyxnQkFBZ0I7UUFDaEIsNkJBQXdCLEdBQWUsY0FBYyxDQUFDLHFDQUFxQyxDQUFDLENBQUM7UUFZN0YsZ0JBQWdCO1FBQ2hCLDhCQUF5QixHQUFlLGNBQWMsQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO1FBVS9GLGdCQUFnQjtRQUNoQix3Q0FBbUMsR0FDL0IsY0FBYyxDQUFDLGdEQUFnRCxDQUFDLENBQUM7UUFhckUsZ0JBQWdCO1FBQ2hCLG9DQUErQixHQUMzQixjQUFjLENBQUMsNENBQTRDLENBQUMsQ0FBQztRQWtCakUsZ0JBQWdCO1FBQ2hCLGlDQUE0QixHQUFHLGNBQWMsQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1FBVTFGLGdCQUFnQjtRQUNoQixnQ0FBMkIsR0FBRyxjQUFjLENBQUMseUNBQXlDLENBQUMsQ0FBQztRQVl4RixnQkFBZ0I7UUFDaEIsZ0NBQTJCLEdBQUcsY0FBYyxDQUFDLHlDQUF5QyxDQUFDLENBQUM7SUFySFEsQ0FBQztJQUVqRyxnQkFBZ0IsQ0FBQyxRQUFvQjtRQUNuQyxNQUFNLENBQWUsUUFBUyxDQUFDLGVBQWUsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO0lBQ3ZFLENBQUM7SUFFRCxjQUFjLENBQUMsV0FBb0I7UUFDakMsSUFBSSxRQUFRLEdBQWMsV0FBWSxDQUFDLFlBQVksQ0FBQztRQUNwRCxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksS0FBSyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUMxQyxNQUFNLElBQUksYUFBYSxDQUFDLDhDQUE4QyxDQUFDLENBQUM7UUFDMUUsQ0FBQztRQUNELE1BQU0sQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztJQUNyQyxDQUFDO0lBRUQsOEJBQThCLENBQUMsWUFBd0IsRUFBRSxZQUFvQjtRQUMzRSxJQUFJLEtBQUssR0FBaUIsWUFBYSxDQUFDLGVBQWUsQ0FBQztRQUN4RCxJQUFJLGFBQWEsR0FBRyxLQUFLLENBQUMsYUFBYSxDQUFDO1FBQ3hDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDM0IsTUFBTSxJQUFJLGFBQWEsQ0FBQyw4Q0FBOEMsWUFBWSxFQUFFLENBQUMsQ0FBQztRQUN4RixDQUFDO1FBQ0QsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxhQUFhLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQzFELElBQUksU0FBUyxHQUFHLGFBQWEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDN0MsRUFBRSxDQUFDLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMseUJBQXlCLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN2RixNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQztZQUN2QixDQUFDO1FBQ0gsQ0FBQztRQUNELE1BQU0sSUFBSSxhQUFhLENBQUMsMkJBQTJCLFlBQVksRUFBRSxDQUFDLENBQUM7SUFDckUsQ0FBQztJQUVELFlBQVksQ0FBQyxZQUF3QjtRQUNuQyxNQUFNLENBQWUsWUFBYSxDQUFDLGVBQWUsQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUNwRSxDQUFDO0lBS0Qsa0JBQWtCLENBQUMsa0JBQXNDLEVBQUUsZ0JBQXdCLEVBQ2hFLFFBQWtCLEVBQUUsZ0JBQWdCLEdBQVksSUFBSTtRQUNyRSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztRQUN4QyxJQUFJLGVBQWUsR0FBeUIsa0JBQW1CLENBQUMsdUJBQXVCLENBQUM7UUFDeEYsSUFBSSxRQUFRLEdBQUcsU0FBUyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsZ0JBQWdCLEdBQUcsZUFBZSxDQUFDLFFBQVEsQ0FBQztRQUN6RixJQUFJLElBQUksR0FBRyxlQUFlLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxRQUFRLEVBQ3RELElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztRQUN2RCxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDL0IsQ0FBQztJQUtELG1CQUFtQixDQUFDLFdBQW9CO1FBQ3RDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO1FBQ3pDLElBQUksUUFBUSxHQUFjLFdBQVksQ0FBQyxZQUFZLENBQUM7UUFDcEQsUUFBUSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsNEJBQTRCLENBQUMsUUFBUSxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQztRQUM1RixRQUFRLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDbkIsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2QsQ0FBQztJQU1ELDZCQUE2QixDQUFDLHFCQUFpQyxFQUFFLEtBQWEsRUFDaEQsV0FBd0I7UUFDcEQsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLG1DQUFtQyxFQUFFLENBQUM7UUFDbkQsSUFBSSxTQUFTLEdBQWtCLFdBQVksQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDO1FBQ3ZFLElBQUksSUFBSSxHQUNKLFNBQVMsQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUM5QyxTQUFTLENBQUMsVUFBVSxDQUFDLGdCQUFnQixFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDM0YsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksRUFBZ0IscUJBQXNCLENBQUMsZUFBZSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQy9GLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBTUQseUJBQXlCLENBQUMscUJBQWlDLEVBQUUsS0FBYSxFQUNoRCxrQkFBc0MsRUFDdEMsMkJBQStDLEVBQy9DLGdCQUF5QjtRQUNqRCxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsK0JBQStCLEVBQUUsQ0FBQztRQUMvQyx1RUFBdUU7UUFDdkUsSUFBSSxzQkFBc0IsR0FBZ0IscUJBQXFCLENBQUM7UUFDaEUsSUFBSSxTQUFTLEdBQUcsc0JBQXNCLENBQUMsZUFBZSxDQUFDO1FBQ3ZELElBQUksZUFBZSxHQUF5QixrQkFBbUIsQ0FBQyx1QkFBdUIsQ0FBQztRQUN4RixJQUFJLElBQUksR0FBRyxlQUFlLENBQUMsV0FBVyxDQUNsQyxTQUFTLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsVUFBVSxDQUFDLFdBQVcsRUFBRSxTQUFTLEVBQzFFLGdCQUFnQixFQUFFLElBQUksRUFBRSwyQkFBMkIsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMvRCxJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxFQUFFLHNCQUFzQixDQUFDLGVBQWUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNqRixNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDL0IsQ0FBQztJQUtELHNCQUFzQixDQUFDLHFCQUFpQyxFQUFFLEtBQWE7UUFDckUsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLDRCQUE0QixFQUFFLENBQUM7UUFDNUMsSUFBSSxJQUFJLEdBQ0osSUFBSSxDQUFDLHNCQUFzQixDQUFlLHFCQUFzQixDQUFDLGVBQWUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM3RixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDZixRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDZCxDQUFDO0lBS0QsdUZBQXVGO0lBQ3ZGLHFCQUFxQixDQUFDLHFCQUFpQyxFQUFFLEtBQWEsRUFDaEQsT0FBZ0I7UUFDcEMsSUFBSSxRQUFRLEdBQWEsT0FBTyxDQUFDO1FBQ2pDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQywyQkFBMkIsRUFBRSxDQUFDO1FBQzNDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUNQLHFCQUFzQixDQUFDLGVBQWUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN6RixNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBS0QsdUZBQXVGO0lBQ3ZGLHFCQUFxQixDQUFDLHFCQUFpQyxFQUFFLEtBQWE7UUFDcEUsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLDJCQUEyQixFQUFFLENBQUM7UUFDM0MsSUFBSSxJQUFJLEdBQ0osSUFBSSxDQUFDLHNCQUFzQixDQUFlLHFCQUFzQixDQUFDLGVBQWUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM3RixNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDL0IsQ0FBQztJQUVELGdCQUFnQjtJQUNoQixhQUFhLENBQUMsSUFBYSxJQUFHLENBQUM7SUFFL0IsZ0JBQWdCO0lBQ2hCLGVBQWUsQ0FBQyxJQUFhLElBQUcsQ0FBQztJQUVqQyxnQkFBZ0I7SUFDaEIseUJBQXlCLENBQUMsYUFBZ0MsRUFDaEMsTUFBNkI7UUFDckQsTUFBTSxDQUFDLElBQUksbUJBQW1CLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxlQUFlLEVBQUUsRUFBRSxFQUFFLGFBQWEsRUFDekQsTUFBTSxDQUFDLENBQUM7SUFDekMsQ0FBQztJQUVPLHNCQUFzQixDQUFDLElBQWEsRUFBRSxZQUF3QixFQUFFLFNBQWlCO1FBQ3ZGLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQzNDLE1BQU0sSUFBSSxhQUFhLENBQUMsaUNBQWlDLENBQUMsQ0FBQztRQUM3RCxDQUFDO1FBQ0QsSUFBSSxXQUFXLEdBQUcsWUFBWSxDQUFDLFdBQVcsQ0FBQztRQUMzQyxFQUFFLENBQUMsQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztZQUN4QixXQUFXLEdBQUcsRUFBRSxDQUFDO1lBQ2pCLFlBQVksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBQ3pDLENBQUM7UUFDRCxXQUFXLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDakQsSUFBSSxPQUFPLENBQUM7UUFDWixFQUFFLENBQUMsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsQixJQUFJLFFBQVEsR0FBRyxXQUFXLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQzFDLE9BQU8sR0FBRyxRQUFRLENBQUMsc0JBQXNCLENBQUMsTUFBTSxHQUFHLENBQUM7Z0JBQ3RDLFFBQVEsQ0FBQyxzQkFBc0IsQ0FBQyxRQUFRLENBQUMsc0JBQXNCLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztnQkFDM0UsSUFBSSxDQUFDO1FBQ3JCLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLE9BQU8sR0FBRyxZQUFZLENBQUMsYUFBYSxDQUFDO1FBQ3ZDLENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZCLElBQUksYUFBYSxHQUFHLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ2hELElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLGFBQWEsRUFDYiw0QkFBNEIsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDO1FBQzNGLENBQUM7UUFDRCxzREFBc0Q7UUFDdEQsd0RBQXdEO1FBQ3hELFlBQVksQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDNUUsWUFBWSxDQUFDLDRCQUE0QixFQUFFLENBQUM7SUFDOUMsQ0FBQztJQUVPLHNCQUFzQixDQUFDLFlBQXdCLEVBQUUsU0FBaUI7UUFDeEUsSUFBSSxJQUFJLEdBQUcsV0FBVyxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ3JFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQzNDLE1BQU0sSUFBSSxhQUFhLENBQUMsaUNBQWlDLENBQUMsQ0FBQztRQUM3RCxDQUFDO1FBQ0QsWUFBWSxDQUFDLDRCQUE0QixFQUFFLENBQUM7UUFFNUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsNEJBQTRCLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQztRQUVwRixzREFBc0Q7UUFDdEQsd0RBQXdEO1FBQ3hELElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDN0IsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNkLENBQUM7QUFDSCxDQUFDO0FBNUxEO0lBQUMsVUFBVSxFQUFFO2VBSW1DLE1BQU0sQ0FBQyxNQUFNLENBQUM7O21CQUpqRDtBQTRMWiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIEluamVjdG9yLFxuICBJbmplY3QsXG4gIFByb3ZpZGVyLFxuICBJbmplY3RhYmxlLFxuICBSZXNvbHZlZFByb3ZpZGVyLFxuICBmb3J3YXJkUmVmXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7aXNQcmVzZW50LCBpc0JsYW5rLCBpc0FycmF5fSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtMaXN0V3JhcHBlciwgU3RyaW5nTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7QXBwVmlldywgSG9zdFZpZXdGYWN0b3J5LCBmbGF0dGVuTmVzdGVkVmlld1JlbmRlck5vZGVzLCBmaW5kTGFzdFJlbmRlck5vZGV9IGZyb20gJy4vdmlldyc7XG5pbXBvcnQge0FwcEVsZW1lbnR9IGZyb20gJy4vZWxlbWVudCc7XG5pbXBvcnQge0VsZW1lbnRSZWYsIEVsZW1lbnRSZWZffSBmcm9tICcuL2VsZW1lbnRfcmVmJztcbmltcG9ydCB7XG4gIEhvc3RWaWV3RmFjdG9yeVJlZixcbiAgSG9zdFZpZXdGYWN0b3J5UmVmXyxcbiAgRW1iZWRkZWRWaWV3UmVmLFxuICBIb3N0Vmlld1JlZixcbiAgVmlld1JlZixcbiAgVmlld1JlZl9cbn0gZnJvbSAnLi92aWV3X3JlZic7XG5pbXBvcnQge1ZpZXdDb250YWluZXJSZWZ9IGZyb20gJy4vdmlld19jb250YWluZXJfcmVmJztcbmltcG9ydCB7VGVtcGxhdGVSZWYsIFRlbXBsYXRlUmVmX30gZnJvbSAnLi90ZW1wbGF0ZV9yZWYnO1xuaW1wb3J0IHtSb290UmVuZGVyZXIsIFJlbmRlckNvbXBvbmVudFR5cGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3JlbmRlci9hcGknO1xuaW1wb3J0IHt3dGZDcmVhdGVTY29wZSwgd3RmTGVhdmUsIFd0ZlNjb3BlRm59IGZyb20gJy4uL3Byb2ZpbGUvcHJvZmlsZSc7XG5pbXBvcnQge0FQUF9JRH0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvYXBwbGljYXRpb25fdG9rZW5zJztcbmltcG9ydCB7Vmlld0VuY2Fwc3VsYXRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL21ldGFkYXRhL3ZpZXcnO1xuaW1wb3J0IHtWaWV3VHlwZX0gZnJvbSAnLi92aWV3X3R5cGUnO1xuXG4vKipcbiAqIFNlcnZpY2UgZXhwb3NpbmcgbG93IGxldmVsIEFQSSBmb3IgY3JlYXRpbmcsIG1vdmluZyBhbmQgZGVzdHJveWluZyBWaWV3cy5cbiAqXG4gKiBNb3N0IGFwcGxpY2F0aW9ucyBzaG91bGQgdXNlIGhpZ2hlci1sZXZlbCBhYnN0cmFjdGlvbnMgbGlrZSB7QGxpbmsgRHluYW1pY0NvbXBvbmVudExvYWRlcn0gYW5kXG4gKiB7QGxpbmsgVmlld0NvbnRhaW5lclJlZn0gaW5zdGVhZC5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEFwcFZpZXdNYW5hZ2VyIHtcbiAgLyoqXG4gICAqIFJldHVybnMgYSB7QGxpbmsgVmlld0NvbnRhaW5lclJlZn0gb2YgdGhlIFZpZXcgQ29udGFpbmVyIGF0IHRoZSBzcGVjaWZpZWQgbG9jYXRpb24uXG4gICAqL1xuICBhYnN0cmFjdCBnZXRWaWV3Q29udGFpbmVyKGxvY2F0aW9uOiBFbGVtZW50UmVmKTogVmlld0NvbnRhaW5lclJlZjtcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUge0BsaW5rIEVsZW1lbnRSZWZ9IHRoYXQgbWFrZXMgdXAgdGhlIHNwZWNpZmllZCBIb3N0IFZpZXcuXG4gICAqL1xuICBhYnN0cmFjdCBnZXRIb3N0RWxlbWVudChob3N0Vmlld1JlZjogSG9zdFZpZXdSZWYpOiBFbGVtZW50UmVmO1xuXG4gIC8qKlxuICAgKiBTZWFyY2hlcyB0aGUgQ29tcG9uZW50IFZpZXcgb2YgdGhlIENvbXBvbmVudCBzcGVjaWZpZWQgdmlhIGBob3N0TG9jYXRpb25gIGFuZCByZXR1cm5zIHRoZVxuICAgKiB7QGxpbmsgRWxlbWVudFJlZn0gZm9yIHRoZSBFbGVtZW50IGlkZW50aWZpZWQgdmlhIGEgVmFyaWFibGUgTmFtZSBgdmFyaWFibGVOYW1lYC5cbiAgICpcbiAgICogVGhyb3dzIGFuIGV4Y2VwdGlvbiBpZiB0aGUgc3BlY2lmaWVkIGBob3N0TG9jYXRpb25gIGlzIG5vdCBhIEhvc3QgRWxlbWVudCBvZiBhIENvbXBvbmVudCwgb3IgaWZcbiAgICogdmFyaWFibGUgYHZhcmlhYmxlTmFtZWAgY291bGRuJ3QgYmUgZm91bmQgaW4gdGhlIENvbXBvbmVudCBWaWV3IG9mIHRoaXMgQ29tcG9uZW50LlxuICAgKi9cbiAgYWJzdHJhY3QgZ2V0TmFtZWRFbGVtZW50SW5Db21wb25lbnRWaWV3KGhvc3RMb2NhdGlvbjogRWxlbWVudFJlZixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhcmlhYmxlTmFtZTogc3RyaW5nKTogRWxlbWVudFJlZjtcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgY29tcG9uZW50IGluc3RhbmNlIGZvciB0aGUgcHJvdmlkZWQgSG9zdCBFbGVtZW50LlxuICAgKi9cbiAgYWJzdHJhY3QgZ2V0Q29tcG9uZW50KGhvc3RMb2NhdGlvbjogRWxlbWVudFJlZik6IGFueTtcblxuICAvKipcbiAgICogQ3JlYXRlcyBhbiBpbnN0YW5jZSBvZiBhIENvbXBvbmVudCBhbmQgYXR0YWNoZXMgaXQgdG8gdGhlIGZpcnN0IGVsZW1lbnQgaW4gdGhlIGdsb2JhbCBWaWV3XG4gICAqICh1c3VhbGx5IERPTSBEb2N1bWVudCkgdGhhdCBtYXRjaGVzIHRoZSBjb21wb25lbnQncyBzZWxlY3RvciBvciBgb3ZlcnJpZGVTZWxlY3RvcmAuXG4gICAqXG4gICAqIFRoaXMgYXMgYSBsb3ctbGV2ZWwgd2F5IHRvIGJvb3RzdHJhcCBhbiBhcHBsaWNhdGlvbiBhbmQgdXBncmFkZSBhbiBleGlzdGluZyBFbGVtZW50IHRvIGFcbiAgICogSG9zdCBFbGVtZW50LiBNb3N0IGFwcGxpY2F0aW9ucyBzaG91bGQgdXNlIHtAbGluayBEeW5hbWljQ29tcG9uZW50TG9hZGVyI2xvYWRBc1Jvb3R9IGluc3RlYWQuXG4gICAqXG4gICAqIFRoZSBDb21wb25lbnQgYW5kIGl0cyBWaWV3IGFyZSBjcmVhdGVkIGJhc2VkIG9uIHRoZSBgaG9zdFByb3RvQ29tcG9uZW50UmVmYCB3aGljaCBjYW4gYmVcbiAgICogb2J0YWluZWRcbiAgICogYnkgY29tcGlsaW5nIHRoZSBjb21wb25lbnQgd2l0aCB7QGxpbmsgQ29tcGlsZXIjY29tcGlsZUluSG9zdH0uXG4gICAqXG4gICAqIFVzZSB7QGxpbmsgQXBwVmlld01hbmFnZXIjZGVzdHJveVJvb3RIb3N0Vmlld30gdG8gZGVzdHJveSB0aGUgY3JlYXRlZCBDb21wb25lbnQgYW5kIGl0J3MgSG9zdFxuICAgKiBWaWV3LlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZVxuICAgKlxuICAgKiBgYGBcbiAgICogQG5nLkNvbXBvbmVudCh7XG4gICAqICAgc2VsZWN0b3I6ICdjaGlsZC1jb21wb25lbnQnXG4gICAqIH0pXG4gICAqIEBuZy5WaWV3KHtcbiAgICogICB0ZW1wbGF0ZTogJ0NoaWxkJ1xuICAgKiB9KVxuICAgKiBjbGFzcyBDaGlsZENvbXBvbmVudCB7XG4gICAqXG4gICAqIH1cbiAgICpcbiAgICogQG5nLkNvbXBvbmVudCh7XG4gICAqICAgc2VsZWN0b3I6ICdteS1hcHAnXG4gICAqIH0pXG4gICAqIEBuZy5WaWV3KHtcbiAgICogICB0ZW1wbGF0ZTogYFxuICAgKiAgICAgUGFyZW50ICg8c29tZS1jb21wb25lbnQ+PC9zb21lLWNvbXBvbmVudD4pXG4gICAqICAgYFxuICAgKiB9KVxuICAgKiBjbGFzcyBNeUFwcCBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gICAqICAgdmlld1JlZjogbmcuVmlld1JlZjtcbiAgICpcbiAgICogICBjb25zdHJ1Y3RvcihwdWJsaWMgYXBwVmlld01hbmFnZXI6IG5nLkFwcFZpZXdNYW5hZ2VyLCBjb21waWxlcjogbmcuQ29tcGlsZXIpIHtcbiAgICogICAgIGNvbXBpbGVyLmNvbXBpbGVJbkhvc3QoQ2hpbGRDb21wb25lbnQpLnRoZW4oKHByb3RvVmlldzogbmcuUHJvdG9Db21wb25lbnRSZWYpID0+IHtcbiAgICogICAgICAgdGhpcy52aWV3UmVmID0gYXBwVmlld01hbmFnZXIuY3JlYXRlUm9vdEhvc3RWaWV3KHByb3RvVmlldywgJ3NvbWUtY29tcG9uZW50JywgbnVsbCk7XG4gICAqICAgICB9KVxuICAgKiAgIH1cbiAgICpcbiAgICogICBuZ09uRGVzdHJveSgpIHtcbiAgICogICAgIHRoaXMuYXBwVmlld01hbmFnZXIuZGVzdHJveVJvb3RIb3N0Vmlldyh0aGlzLnZpZXdSZWYpO1xuICAgKiAgICAgdGhpcy52aWV3UmVmID0gbnVsbDtcbiAgICogICB9XG4gICAqIH1cbiAgICpcbiAgICogbmcuYm9vdHN0cmFwKE15QXBwKTtcbiAgICogYGBgXG4gICAqL1xuICBhYnN0cmFjdCBjcmVhdGVSb290SG9zdFZpZXcoaG9zdFZpZXdGYWN0b3J5UmVmOiBIb3N0Vmlld0ZhY3RvcnlSZWYsIG92ZXJyaWRlU2VsZWN0b3I6IHN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluamVjdG9yOiBJbmplY3RvciwgcHJvamVjdGFibGVOb2Rlcz86IGFueVtdW10pOiBIb3N0Vmlld1JlZjtcblxuICAvKipcbiAgICogRGVzdHJveXMgdGhlIEhvc3QgVmlldyBjcmVhdGVkIHZpYSB7QGxpbmsgQXBwVmlld01hbmFnZXIjY3JlYXRlUm9vdEhvc3RWaWV3fS5cbiAgICpcbiAgICogQWxvbmcgd2l0aCB0aGUgSG9zdCBWaWV3LCB0aGUgQ29tcG9uZW50IEluc3RhbmNlIGFzIHdlbGwgYXMgYWxsIG5lc3RlZCBWaWV3IGFuZCBDb21wb25lbnRzIGFyZVxuICAgKiBkZXN0cm95ZWQgYXMgd2VsbC5cbiAgICovXG4gIGFic3RyYWN0IGRlc3Ryb3lSb290SG9zdFZpZXcoaG9zdFZpZXdSZWY6IEhvc3RWaWV3UmVmKTtcblxuICAvKipcbiAgICogSW5zdGFudGlhdGVzIGFuIEVtYmVkZGVkIFZpZXcgYmFzZWQgb24gdGhlIHtAbGluayBUZW1wbGF0ZVJlZiBgdGVtcGxhdGVSZWZgfSBhbmQgaW5zZXJ0cyBpdFxuICAgKiBpbnRvIHRoZSBWaWV3IENvbnRhaW5lciBzcGVjaWZpZWQgdmlhIGB2aWV3Q29udGFpbmVyTG9jYXRpb25gIGF0IHRoZSBzcGVjaWZpZWQgYGluZGV4YC5cbiAgICpcbiAgICogUmV0dXJucyB0aGUge0BsaW5rIFZpZXdSZWZ9IGZvciB0aGUgbmV3bHkgY3JlYXRlZCBWaWV3LlxuICAgKlxuICAgKiBUaGlzIGFzIGEgbG93LWxldmVsIHdheSB0byBjcmVhdGUgYW5kIGF0dGFjaCBhbiBFbWJlZGRlZCB2aWEgdG8gYSBWaWV3IENvbnRhaW5lci4gTW9zdFxuICAgKiBhcHBsaWNhdGlvbnMgc2hvdWxkIHVzZWQge0BsaW5rIFZpZXdDb250YWluZXJSZWYjY3JlYXRlRW1iZWRkZWRWaWV3fSBpbnN0ZWFkLlxuICAgKlxuICAgKiBVc2Uge0BsaW5rIEFwcFZpZXdNYW5hZ2VyI2Rlc3Ryb3lWaWV3SW5Db250YWluZXJ9IHRvIGRlc3Ryb3kgdGhlIGNyZWF0ZWQgRW1iZWRkZWQgVmlldy5cbiAgICovXG4gIC8vIFRPRE8oaSk6IHRoaXMgbG93LWxldmVsIHZlcnNpb24gb2YgVmlld0NvbnRhaW5lclJlZiNjcmVhdGVFbWJlZGRlZFZpZXcgZG9lc24ndCBhZGQgYW55dGhpbmcgbmV3XG4gIC8vICAgIHdlIHNob3VsZCBtYWtlIGl0IHByaXZhdGUsIG90aGVyd2lzZSB3ZSBoYXZlIHR3byBhcGlzIHRvIGRvIHRoZSBzYW1lIHRoaW5nLlxuICBhYnN0cmFjdCBjcmVhdGVFbWJlZGRlZFZpZXdJbkNvbnRhaW5lcih2aWV3Q29udGFpbmVyTG9jYXRpb246IEVsZW1lbnRSZWYsIGluZGV4OiBudW1iZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZik6IEVtYmVkZGVkVmlld1JlZjtcblxuICAvKipcbiAgICogSW5zdGFudGlhdGVzIGEgc2luZ2xlIHtAbGluayBDb21wb25lbnR9IGFuZCBpbnNlcnRzIGl0cyBIb3N0IFZpZXcgaW50byB0aGUgVmlldyBDb250YWluZXJcbiAgICogZm91bmQgYXQgYHZpZXdDb250YWluZXJMb2NhdGlvbmAuIFdpdGhpbiB0aGUgY29udGFpbmVyLCB0aGUgdmlldyB3aWxsIGJlIGluc2VydGVkIGF0IHBvc2l0aW9uXG4gICAqIHNwZWNpZmllZCB2aWEgYGluZGV4YC5cbiAgICpcbiAgICogVGhlIGNvbXBvbmVudCBpcyBpbnN0YW50aWF0ZWQgdXNpbmcgaXRzIHtAbGluayBQcm90b1ZpZXdSZWYgYHByb3RvVmlld1JlZmB9IHdoaWNoIGNhbiBiZVxuICAgKiBvYnRhaW5lZCB2aWEge0BsaW5rIENvbXBpbGVyI2NvbXBpbGVJbkhvc3R9LlxuICAgKlxuICAgKiBZb3UgY2FuIG9wdGlvbmFsbHkgc3BlY2lmeSBgZHluYW1pY2FsbHlDcmVhdGVkUHJvdmlkZXJzYCwgd2hpY2ggY29uZmlndXJlIHRoZSB7QGxpbmsgSW5qZWN0b3J9XG4gICAqIHRoYXQgd2lsbCBiZSBjcmVhdGVkIGZvciB0aGUgSG9zdCBWaWV3LlxuICAgKlxuICAgKiBSZXR1cm5zIHRoZSB7QGxpbmsgSG9zdFZpZXdSZWZ9IG9mIHRoZSBIb3N0IFZpZXcgY3JlYXRlZCBmb3IgdGhlIG5ld2x5IGluc3RhbnRpYXRlZCBDb21wb25lbnQuXG4gICAqXG4gICAqIFVzZSB7QGxpbmsgQXBwVmlld01hbmFnZXIjZGVzdHJveVZpZXdJbkNvbnRhaW5lcn0gdG8gZGVzdHJveSB0aGUgY3JlYXRlZCBIb3N0IFZpZXcuXG4gICAqL1xuICBhYnN0cmFjdCBjcmVhdGVIb3N0Vmlld0luQ29udGFpbmVyKFxuICAgICAgdmlld0NvbnRhaW5lckxvY2F0aW9uOiBFbGVtZW50UmVmLCBpbmRleDogbnVtYmVyLCBob3N0Vmlld0ZhY3RvcnlSZWY6IEhvc3RWaWV3RmFjdG9yeVJlZixcbiAgICAgIGR5bmFtaWNhbGx5Q3JlYXRlZFByb3ZpZGVyczogUmVzb2x2ZWRQcm92aWRlcltdLCBwcm9qZWN0YWJsZU5vZGVzOiBhbnlbXVtdKTogSG9zdFZpZXdSZWY7XG5cbiAgLyoqXG4gICAqIERlc3Ryb3lzIGFuIEVtYmVkZGVkIG9yIEhvc3QgVmlldyBhdHRhY2hlZCB0byBhIFZpZXcgQ29udGFpbmVyIGF0IHRoZSBzcGVjaWZpZWQgYGluZGV4YC5cbiAgICpcbiAgICogVGhlIFZpZXcgQ29udGFpbmVyIGlzIGxvY2F0ZWQgdmlhIGB2aWV3Q29udGFpbmVyTG9jYXRpb25gLlxuICAgKi9cbiAgYWJzdHJhY3QgZGVzdHJveVZpZXdJbkNvbnRhaW5lcih2aWV3Q29udGFpbmVyTG9jYXRpb246IEVsZW1lbnRSZWYsIGluZGV4OiBudW1iZXIpO1xuXG4gIC8qKlxuICAgKlxuICAgKiBTZWUge0BsaW5rIEFwcFZpZXdNYW5hZ2VyI2RldGFjaFZpZXdJbkNvbnRhaW5lcn0uXG4gICAqL1xuICAvLyBUT0RPKGkpOiByZWZhY3RvciBkZXRhY2hWaWV3SW5Db250YWluZXIrYXR0YWNoVmlld0luQ29udGFpbmVyIHRvIG1vdmVWaWV3SW5Db250YWluZXJcbiAgYWJzdHJhY3QgYXR0YWNoVmlld0luQ29udGFpbmVyKHZpZXdDb250YWluZXJMb2NhdGlvbjogRWxlbWVudFJlZiwgaW5kZXg6IG51bWJlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpZXdSZWY6IEVtYmVkZGVkVmlld1JlZik6IEVtYmVkZGVkVmlld1JlZjtcblxuICAvKipcbiAgICogU2VlIHtAbGluayBBcHBWaWV3TWFuYWdlciNhdHRhY2hWaWV3SW5Db250YWluZXJ9LlxuICAgKi9cbiAgYWJzdHJhY3QgZGV0YWNoVmlld0luQ29udGFpbmVyKHZpZXdDb250YWluZXJMb2NhdGlvbjogRWxlbWVudFJlZiwgaW5kZXg6IG51bWJlcik6IEVtYmVkZGVkVmlld1JlZjtcbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEFwcFZpZXdNYW5hZ2VyXyBleHRlbmRzIEFwcFZpZXdNYW5hZ2VyIHtcbiAgcHJpdmF0ZSBfbmV4dENvbXBUeXBlSWQ6IG51bWJlciA9IDA7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfcmVuZGVyZXI6IFJvb3RSZW5kZXJlciwgQEluamVjdChBUFBfSUQpIHByaXZhdGUgX2FwcElkOiBzdHJpbmcpIHsgc3VwZXIoKTsgfVxuXG4gIGdldFZpZXdDb250YWluZXIobG9jYXRpb246IEVsZW1lbnRSZWYpOiBWaWV3Q29udGFpbmVyUmVmIHtcbiAgICByZXR1cm4gKDxFbGVtZW50UmVmXz5sb2NhdGlvbikuaW50ZXJuYWxFbGVtZW50LmdldFZpZXdDb250YWluZXJSZWYoKTtcbiAgfVxuXG4gIGdldEhvc3RFbGVtZW50KGhvc3RWaWV3UmVmOiBWaWV3UmVmKTogRWxlbWVudFJlZiB7XG4gICAgdmFyIGhvc3RWaWV3ID0gKDxWaWV3UmVmXz5ob3N0Vmlld1JlZikuaW50ZXJuYWxWaWV3O1xuICAgIGlmIChob3N0Vmlldy5wcm90by50eXBlICE9PSBWaWV3VHlwZS5IT1NUKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbignVGhpcyBvcGVyYXRpb24gaXMgb25seSBhbGxvd2VkIG9uIGhvc3Qgdmlld3MnKTtcbiAgICB9XG4gICAgcmV0dXJuIGhvc3RWaWV3LmFwcEVsZW1lbnRzWzBdLnJlZjtcbiAgfVxuXG4gIGdldE5hbWVkRWxlbWVudEluQ29tcG9uZW50Vmlldyhob3N0TG9jYXRpb246IEVsZW1lbnRSZWYsIHZhcmlhYmxlTmFtZTogc3RyaW5nKTogRWxlbWVudFJlZiB7XG4gICAgdmFyIGFwcEVsID0gKDxFbGVtZW50UmVmXz5ob3N0TG9jYXRpb24pLmludGVybmFsRWxlbWVudDtcbiAgICB2YXIgY29tcG9uZW50VmlldyA9IGFwcEVsLmNvbXBvbmVudFZpZXc7XG4gICAgaWYgKGlzQmxhbmsoY29tcG9uZW50VmlldykpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBUaGVyZSBpcyBubyBjb21wb25lbnQgZGlyZWN0aXZlIGF0IGVsZW1lbnQgJHtob3N0TG9jYXRpb259YCk7XG4gICAgfVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29tcG9uZW50Vmlldy5hcHBFbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGNvbXBBcHBFbCA9IGNvbXBvbmVudFZpZXcuYXBwRWxlbWVudHNbaV07XG4gICAgICBpZiAoU3RyaW5nTWFwV3JhcHBlci5jb250YWlucyhjb21wQXBwRWwucHJvdG8uZGlyZWN0aXZlVmFyaWFibGVCaW5kaW5ncywgdmFyaWFibGVOYW1lKSkge1xuICAgICAgICByZXR1cm4gY29tcEFwcEVsLnJlZjtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYENvdWxkIG5vdCBmaW5kIHZhcmlhYmxlICR7dmFyaWFibGVOYW1lfWApO1xuICB9XG5cbiAgZ2V0Q29tcG9uZW50KGhvc3RMb2NhdGlvbjogRWxlbWVudFJlZik6IGFueSB7XG4gICAgcmV0dXJuICg8RWxlbWVudFJlZl8+aG9zdExvY2F0aW9uKS5pbnRlcm5hbEVsZW1lbnQuZ2V0Q29tcG9uZW50KCk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9jcmVhdGVSb290SG9zdFZpZXdTY29wZTogV3RmU2NvcGVGbiA9IHd0ZkNyZWF0ZVNjb3BlKCdBcHBWaWV3TWFuYWdlciNjcmVhdGVSb290SG9zdFZpZXcoKScpO1xuXG4gIGNyZWF0ZVJvb3RIb3N0Vmlldyhob3N0Vmlld0ZhY3RvcnlSZWY6IEhvc3RWaWV3RmFjdG9yeVJlZiwgb3ZlcnJpZGVTZWxlY3Rvcjogc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgaW5qZWN0b3I6IEluamVjdG9yLCBwcm9qZWN0YWJsZU5vZGVzOiBhbnlbXVtdID0gbnVsbCk6IEhvc3RWaWV3UmVmIHtcbiAgICB2YXIgcyA9IHRoaXMuX2NyZWF0ZVJvb3RIb3N0Vmlld1Njb3BlKCk7XG4gICAgdmFyIGhvc3RWaWV3RmFjdG9yeSA9ICg8SG9zdFZpZXdGYWN0b3J5UmVmXz5ob3N0Vmlld0ZhY3RvcnlSZWYpLmludGVybmFsSG9zdFZpZXdGYWN0b3J5O1xuICAgIHZhciBzZWxlY3RvciA9IGlzUHJlc2VudChvdmVycmlkZVNlbGVjdG9yKSA/IG92ZXJyaWRlU2VsZWN0b3IgOiBob3N0Vmlld0ZhY3Rvcnkuc2VsZWN0b3I7XG4gICAgdmFyIHZpZXcgPSBob3N0Vmlld0ZhY3Rvcnkudmlld0ZhY3RvcnkodGhpcy5fcmVuZGVyZXIsIHRoaXMsIG51bGwsIHByb2plY3RhYmxlTm9kZXMsIHNlbGVjdG9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bGwsIGluamVjdG9yKTtcbiAgICByZXR1cm4gd3RmTGVhdmUocywgdmlldy5yZWYpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZGVzdHJveVJvb3RIb3N0Vmlld1Njb3BlOiBXdGZTY29wZUZuID0gd3RmQ3JlYXRlU2NvcGUoJ0FwcFZpZXdNYW5hZ2VyI2Rlc3Ryb3lSb290SG9zdFZpZXcoKScpO1xuXG4gIGRlc3Ryb3lSb290SG9zdFZpZXcoaG9zdFZpZXdSZWY6IFZpZXdSZWYpIHtcbiAgICB2YXIgcyA9IHRoaXMuX2Rlc3Ryb3lSb290SG9zdFZpZXdTY29wZSgpO1xuICAgIHZhciBob3N0VmlldyA9ICg8Vmlld1JlZl8+aG9zdFZpZXdSZWYpLmludGVybmFsVmlldztcbiAgICBob3N0Vmlldy5yZW5kZXJlci5kZXRhY2hWaWV3KGZsYXR0ZW5OZXN0ZWRWaWV3UmVuZGVyTm9kZXMoaG9zdFZpZXcucm9vdE5vZGVzT3JBcHBFbGVtZW50cykpO1xuICAgIGhvc3RWaWV3LmRlc3Ryb3koKTtcbiAgICB3dGZMZWF2ZShzKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2NyZWF0ZUVtYmVkZGVkVmlld0luQ29udGFpbmVyU2NvcGU6IFd0ZlNjb3BlRm4gPVxuICAgICAgd3RmQ3JlYXRlU2NvcGUoJ0FwcFZpZXdNYW5hZ2VyI2NyZWF0ZUVtYmVkZGVkVmlld0luQ29udGFpbmVyKCknKTtcblxuICBjcmVhdGVFbWJlZGRlZFZpZXdJbkNvbnRhaW5lcih2aWV3Q29udGFpbmVyTG9jYXRpb246IEVsZW1lbnRSZWYsIGluZGV4OiBudW1iZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZik6IEVtYmVkZGVkVmlld1JlZiB7XG4gICAgdmFyIHMgPSB0aGlzLl9jcmVhdGVFbWJlZGRlZFZpZXdJbkNvbnRhaW5lclNjb3BlKCk7XG4gICAgdmFyIGNvbnRleHRFbCA9ICg8VGVtcGxhdGVSZWZfPnRlbXBsYXRlUmVmKS5lbGVtZW50UmVmLmludGVybmFsRWxlbWVudDtcbiAgICB2YXIgdmlldzogQXBwVmlldyA9XG4gICAgICAgIGNvbnRleHRFbC5lbWJlZGRlZFZpZXdGYWN0b3J5KGNvbnRleHRFbC5wYXJlbnRWaWV3LnJlbmRlcmVyLCB0aGlzLCBjb250ZXh0RWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHRFbC5wYXJlbnRWaWV3LnByb2plY3RhYmxlTm9kZXMsIG51bGwsIG51bGwsIG51bGwpO1xuICAgIHRoaXMuX2F0dGFjaFZpZXdUb0NvbnRhaW5lcih2aWV3LCAoPEVsZW1lbnRSZWZfPnZpZXdDb250YWluZXJMb2NhdGlvbikuaW50ZXJuYWxFbGVtZW50LCBpbmRleCk7XG4gICAgcmV0dXJuIHd0ZkxlYXZlKHMsIHZpZXcucmVmKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2NyZWF0ZUhvc3RWaWV3SW5Db250YWluZXJTY29wZTogV3RmU2NvcGVGbiA9XG4gICAgICB3dGZDcmVhdGVTY29wZSgnQXBwVmlld01hbmFnZXIjY3JlYXRlSG9zdFZpZXdJbkNvbnRhaW5lcigpJyk7XG5cbiAgY3JlYXRlSG9zdFZpZXdJbkNvbnRhaW5lcih2aWV3Q29udGFpbmVyTG9jYXRpb246IEVsZW1lbnRSZWYsIGluZGV4OiBudW1iZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaG9zdFZpZXdGYWN0b3J5UmVmOiBIb3N0Vmlld0ZhY3RvcnlSZWYsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZHluYW1pY2FsbHlDcmVhdGVkUHJvdmlkZXJzOiBSZXNvbHZlZFByb3ZpZGVyW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdGFibGVOb2RlczogYW55W11bXSk6IEhvc3RWaWV3UmVmIHtcbiAgICB2YXIgcyA9IHRoaXMuX2NyZWF0ZUhvc3RWaWV3SW5Db250YWluZXJTY29wZSgpO1xuICAgIC8vIFRPRE8odGJvc2NoKTogVGhpcyBzaG91bGQgYmUgc3BlY2lmaWFibGUgdmlhIGFuIGFkZGl0aW9uYWwgYXJndW1lbnQhXG4gICAgdmFyIHZpZXdDb250YWluZXJMb2NhdGlvbl8gPSA8RWxlbWVudFJlZl8+dmlld0NvbnRhaW5lckxvY2F0aW9uO1xuICAgIHZhciBjb250ZXh0RWwgPSB2aWV3Q29udGFpbmVyTG9jYXRpb25fLmludGVybmFsRWxlbWVudDtcbiAgICB2YXIgaG9zdFZpZXdGYWN0b3J5ID0gKDxIb3N0Vmlld0ZhY3RvcnlSZWZfPmhvc3RWaWV3RmFjdG9yeVJlZikuaW50ZXJuYWxIb3N0Vmlld0ZhY3Rvcnk7XG4gICAgdmFyIHZpZXcgPSBob3N0Vmlld0ZhY3Rvcnkudmlld0ZhY3RvcnkoXG4gICAgICAgIGNvbnRleHRFbC5wYXJlbnRWaWV3LnJlbmRlcmVyLCBjb250ZXh0RWwucGFyZW50Vmlldy52aWV3TWFuYWdlciwgY29udGV4dEVsLFxuICAgICAgICBwcm9qZWN0YWJsZU5vZGVzLCBudWxsLCBkeW5hbWljYWxseUNyZWF0ZWRQcm92aWRlcnMsIG51bGwpO1xuICAgIHRoaXMuX2F0dGFjaFZpZXdUb0NvbnRhaW5lcih2aWV3LCB2aWV3Q29udGFpbmVyTG9jYXRpb25fLmludGVybmFsRWxlbWVudCwgaW5kZXgpO1xuICAgIHJldHVybiB3dGZMZWF2ZShzLCB2aWV3LnJlZik7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9kZXN0cm95Vmlld0luQ29udGFpbmVyU2NvcGUgPSB3dGZDcmVhdGVTY29wZSgnQXBwVmlld01hbmFuZ2VyI2Rlc3Ryb3lWaWV3SW5Db250YWluZXIoKScpO1xuXG4gIGRlc3Ryb3lWaWV3SW5Db250YWluZXIodmlld0NvbnRhaW5lckxvY2F0aW9uOiBFbGVtZW50UmVmLCBpbmRleDogbnVtYmVyKSB7XG4gICAgdmFyIHMgPSB0aGlzLl9kZXN0cm95Vmlld0luQ29udGFpbmVyU2NvcGUoKTtcbiAgICB2YXIgdmlldyA9XG4gICAgICAgIHRoaXMuX2RldGFjaFZpZXdJbkNvbnRhaW5lcigoPEVsZW1lbnRSZWZfPnZpZXdDb250YWluZXJMb2NhdGlvbikuaW50ZXJuYWxFbGVtZW50LCBpbmRleCk7XG4gICAgdmlldy5kZXN0cm95KCk7XG4gICAgd3RmTGVhdmUocyk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9hdHRhY2hWaWV3SW5Db250YWluZXJTY29wZSA9IHd0ZkNyZWF0ZVNjb3BlKCdBcHBWaWV3TWFuYW5nZXIjYXR0YWNoVmlld0luQ29udGFpbmVyKCknKTtcblxuICAvLyBUT0RPKGkpOiByZWZhY3RvciBkZXRhY2hWaWV3SW5Db250YWluZXIrYXR0YWNoVmlld0luQ29udGFpbmVyIHRvIG1vdmVWaWV3SW5Db250YWluZXJcbiAgYXR0YWNoVmlld0luQ29udGFpbmVyKHZpZXdDb250YWluZXJMb2NhdGlvbjogRWxlbWVudFJlZiwgaW5kZXg6IG51bWJlcixcbiAgICAgICAgICAgICAgICAgICAgICAgIHZpZXdSZWY6IFZpZXdSZWYpOiBFbWJlZGRlZFZpZXdSZWYge1xuICAgIHZhciB2aWV3UmVmXyA9IDxWaWV3UmVmXz52aWV3UmVmO1xuICAgIHZhciBzID0gdGhpcy5fYXR0YWNoVmlld0luQ29udGFpbmVyU2NvcGUoKTtcbiAgICB0aGlzLl9hdHRhY2hWaWV3VG9Db250YWluZXIodmlld1JlZl8uaW50ZXJuYWxWaWV3LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoPEVsZW1lbnRSZWZfPnZpZXdDb250YWluZXJMb2NhdGlvbikuaW50ZXJuYWxFbGVtZW50LCBpbmRleCk7XG4gICAgcmV0dXJuIHd0ZkxlYXZlKHMsIHZpZXdSZWZfKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2RldGFjaFZpZXdJbkNvbnRhaW5lclNjb3BlID0gd3RmQ3JlYXRlU2NvcGUoJ0FwcFZpZXdNYW5hbmdlciNkZXRhY2hWaWV3SW5Db250YWluZXIoKScpO1xuXG4gIC8vIFRPRE8oaSk6IHJlZmFjdG9yIGRldGFjaFZpZXdJbkNvbnRhaW5lcithdHRhY2hWaWV3SW5Db250YWluZXIgdG8gbW92ZVZpZXdJbkNvbnRhaW5lclxuICBkZXRhY2hWaWV3SW5Db250YWluZXIodmlld0NvbnRhaW5lckxvY2F0aW9uOiBFbGVtZW50UmVmLCBpbmRleDogbnVtYmVyKTogRW1iZWRkZWRWaWV3UmVmIHtcbiAgICB2YXIgcyA9IHRoaXMuX2RldGFjaFZpZXdJbkNvbnRhaW5lclNjb3BlKCk7XG4gICAgdmFyIHZpZXcgPVxuICAgICAgICB0aGlzLl9kZXRhY2hWaWV3SW5Db250YWluZXIoKDxFbGVtZW50UmVmXz52aWV3Q29udGFpbmVyTG9jYXRpb24pLmludGVybmFsRWxlbWVudCwgaW5kZXgpO1xuICAgIHJldHVybiB3dGZMZWF2ZShzLCB2aWV3LnJlZik7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIG9uVmlld0NyZWF0ZWQodmlldzogQXBwVmlldykge31cblxuICAvKiogQGludGVybmFsICovXG4gIG9uVmlld0Rlc3Ryb3llZCh2aWV3OiBBcHBWaWV3KSB7fVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgY3JlYXRlUmVuZGVyQ29tcG9uZW50VHlwZShlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZXM6IEFycmF5PHN0cmluZyB8IGFueVtdPik6IFJlbmRlckNvbXBvbmVudFR5cGUge1xuICAgIHJldHVybiBuZXcgUmVuZGVyQ29tcG9uZW50VHlwZShgJHt0aGlzLl9hcHBJZH0tJHt0aGlzLl9uZXh0Q29tcFR5cGVJZCsrfWAsIGVuY2Fwc3VsYXRpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlcyk7XG4gIH1cblxuICBwcml2YXRlIF9hdHRhY2hWaWV3VG9Db250YWluZXIodmlldzogQXBwVmlldywgdmNBcHBFbGVtZW50OiBBcHBFbGVtZW50LCB2aWV3SW5kZXg6IG51bWJlcikge1xuICAgIGlmICh2aWV3LnByb3RvLnR5cGUgPT09IFZpZXdUeXBlLkNPTVBPTkVOVCkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYENvbXBvbmVudCB2aWV3cyBjYW4ndCBiZSBtb3ZlZCFgKTtcbiAgICB9XG4gICAgdmFyIG5lc3RlZFZpZXdzID0gdmNBcHBFbGVtZW50Lm5lc3RlZFZpZXdzO1xuICAgIGlmIChuZXN0ZWRWaWV3cyA9PSBudWxsKSB7XG4gICAgICBuZXN0ZWRWaWV3cyA9IFtdO1xuICAgICAgdmNBcHBFbGVtZW50Lm5lc3RlZFZpZXdzID0gbmVzdGVkVmlld3M7XG4gICAgfVxuICAgIExpc3RXcmFwcGVyLmluc2VydChuZXN0ZWRWaWV3cywgdmlld0luZGV4LCB2aWV3KTtcbiAgICB2YXIgcmVmTm9kZTtcbiAgICBpZiAodmlld0luZGV4ID4gMCkge1xuICAgICAgdmFyIHByZXZWaWV3ID0gbmVzdGVkVmlld3Nbdmlld0luZGV4IC0gMV07XG4gICAgICByZWZOb2RlID0gcHJldlZpZXcucm9vdE5vZGVzT3JBcHBFbGVtZW50cy5sZW5ndGggPiAwID9cbiAgICAgICAgICAgICAgICAgICAgcHJldlZpZXcucm9vdE5vZGVzT3JBcHBFbGVtZW50c1twcmV2Vmlldy5yb290Tm9kZXNPckFwcEVsZW1lbnRzLmxlbmd0aCAtIDFdIDpcbiAgICAgICAgICAgICAgICAgICAgbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVmTm9kZSA9IHZjQXBwRWxlbWVudC5uYXRpdmVFbGVtZW50O1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHJlZk5vZGUpKSB7XG4gICAgICB2YXIgcmVmUmVuZGVyTm9kZSA9IGZpbmRMYXN0UmVuZGVyTm9kZShyZWZOb2RlKTtcbiAgICAgIHZpZXcucmVuZGVyZXIuYXR0YWNoVmlld0FmdGVyKHJlZlJlbmRlck5vZGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmbGF0dGVuTmVzdGVkVmlld1JlbmRlck5vZGVzKHZpZXcucm9vdE5vZGVzT3JBcHBFbGVtZW50cykpO1xuICAgIH1cbiAgICAvLyBUT0RPOiBUaGlzIGlzIG9ubHkgbmVlZGVkIHdoZW4gYSB2aWV3IGlzIGRlc3Ryb3llZCxcbiAgICAvLyBub3Qgd2hlbiBpdCBpcyBkZXRhY2hlZCBmb3IgcmVvcmRlcmluZyB3aXRoIG5nLWZvci4uLlxuICAgIHZjQXBwRWxlbWVudC5wYXJlbnRWaWV3LmNoYW5nZURldGVjdG9yLmFkZENvbnRlbnRDaGlsZCh2aWV3LmNoYW5nZURldGVjdG9yKTtcbiAgICB2Y0FwcEVsZW1lbnQudHJhdmVyc2VBbmRTZXRRdWVyaWVzQXNEaXJ0eSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBfZGV0YWNoVmlld0luQ29udGFpbmVyKHZjQXBwRWxlbWVudDogQXBwRWxlbWVudCwgdmlld0luZGV4OiBudW1iZXIpOiBBcHBWaWV3IHtcbiAgICB2YXIgdmlldyA9IExpc3RXcmFwcGVyLnJlbW92ZUF0KHZjQXBwRWxlbWVudC5uZXN0ZWRWaWV3cywgdmlld0luZGV4KTtcbiAgICBpZiAodmlldy5wcm90by50eXBlID09PSBWaWV3VHlwZS5DT01QT05FTlQpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBDb21wb25lbnQgdmlld3MgY2FuJ3QgYmUgbW92ZWQhYCk7XG4gICAgfVxuICAgIHZjQXBwRWxlbWVudC50cmF2ZXJzZUFuZFNldFF1ZXJpZXNBc0RpcnR5KCk7XG5cbiAgICB2aWV3LnJlbmRlcmVyLmRldGFjaFZpZXcoZmxhdHRlbk5lc3RlZFZpZXdSZW5kZXJOb2Rlcyh2aWV3LnJvb3ROb2Rlc09yQXBwRWxlbWVudHMpKTtcblxuICAgIC8vIFRPRE86IFRoaXMgaXMgb25seSBuZWVkZWQgd2hlbiBhIHZpZXcgaXMgZGVzdHJveWVkLFxuICAgIC8vIG5vdCB3aGVuIGl0IGlzIGRldGFjaGVkIGZvciByZW9yZGVyaW5nIHdpdGggbmctZm9yLi4uXG4gICAgdmlldy5jaGFuZ2VEZXRlY3Rvci5yZW1vdmUoKTtcbiAgICByZXR1cm4gdmlldztcbiAgfVxufVxuIl19