import { CONST_EXPR, IS_DART } from 'angular2/src/facade/lang';
import { MessageBus } from 'angular2/src/web_workers/shared/message_bus';
import { NgZone } from 'angular2/src/core/zone/ng_zone';
import { ExceptionHandler, APPLICATION_COMMON_PROVIDERS, PLATFORM_COMMON_PROVIDERS, RootRenderer, PLATFORM_INITIALIZER } from 'angular2/core';
import { EVENT_MANAGER_PLUGINS, EventManager } from 'angular2/platform/common_dom';
import { Provider, OpaqueToken } from 'angular2/src/core/di';
import { DOM } from 'angular2/src/platform/dom/dom_adapter';
import { DomEventsPlugin } from 'angular2/src/platform/dom/events/dom_events';
import { KeyEventsPlugin } from 'angular2/src/platform/dom/events/key_events';
import { HammerGesturesPlugin } from 'angular2/src/platform/dom/events/hammer_gestures';
import { DOCUMENT } from 'angular2/src/platform/dom/dom_tokens';
import { DomRootRenderer, DomRootRenderer_ } from 'angular2/src/platform/dom/dom_renderer';
import { DomSharedStylesHost } from 'angular2/src/platform/dom/shared_styles_host';
import { SharedStylesHost } from "angular2/src/platform/dom/shared_styles_host";
import { BrowserDetails } from 'angular2/src/animate/browser_details';
import { AnimationBuilder } from 'angular2/src/animate/animation_builder';
import { XHR } from 'angular2/compiler';
import { XHRImpl } from 'angular2/src/platform/browser/xhr_impl';
import { Testability } from 'angular2/src/core/testability/testability';
import { BrowserGetTestability } from 'angular2/src/platform/browser/testability';
import { BrowserDomAdapter } from './browser/browser_adapter';
import { wtfInit } from 'angular2/src/core/profile/wtf_init';
import { MessageBasedRenderer } from 'angular2/src/web_workers/ui/renderer';
import { MessageBasedXHRImpl } from 'angular2/src/web_workers/ui/xhr_impl';
import { ServiceMessageBrokerFactory, ServiceMessageBrokerFactory_ } from 'angular2/src/web_workers/shared/service_message_broker';
import { ClientMessageBrokerFactory, ClientMessageBrokerFactory_ } from 'angular2/src/web_workers/shared/client_message_broker';
import { BrowserPlatformLocation } from 'angular2/src/platform/browser/location/browser_platform_location';
import { Serializer } from 'angular2/src/web_workers/shared/serializer';
import { ON_WEB_WORKER } from 'angular2/src/web_workers/shared/api';
import { RenderStore } from 'angular2/src/web_workers/shared/render_store';
import { HAMMER_GESTURE_CONFIG, HammerGestureConfig } from './dom/events/hammer_gestures';
export const WORKER_SCRIPT = CONST_EXPR(new OpaqueToken("WebWorkerScript"));
// Message based Worker classes that listen on the MessageBus
export const WORKER_RENDER_MESSAGING_PROVIDERS = CONST_EXPR([MessageBasedRenderer, MessageBasedXHRImpl]);
export const WORKER_RENDER_PLATFORM = CONST_EXPR([
    PLATFORM_COMMON_PROVIDERS,
    new Provider(PLATFORM_INITIALIZER, { useValue: initWebWorkerRenderPlatform, multi: true })
]);
/**
 * A list of {@link Provider}s. To use the router in a Worker enabled application you must
 * include these providers when setting up the render thread.
 */
export const WORKER_RENDER_ROUTER = CONST_EXPR([BrowserPlatformLocation]);
export const WORKER_RENDER_APPLICATION_COMMON = CONST_EXPR([
    APPLICATION_COMMON_PROVIDERS,
    WORKER_RENDER_MESSAGING_PROVIDERS,
    new Provider(ExceptionHandler, { useFactory: _exceptionHandler, deps: [] }),
    new Provider(DOCUMENT, { useFactory: _document, deps: [] }),
    // TODO(jteplitz602): Investigate if we definitely need EVENT_MANAGER on the render thread
    // #5298
    new Provider(EVENT_MANAGER_PLUGINS, { useClass: DomEventsPlugin, multi: true }),
    new Provider(EVENT_MANAGER_PLUGINS, { useClass: KeyEventsPlugin, multi: true }),
    new Provider(EVENT_MANAGER_PLUGINS, { useClass: HammerGesturesPlugin, multi: true }),
    new Provider(HAMMER_GESTURE_CONFIG, { useClass: HammerGestureConfig }),
    new Provider(DomRootRenderer, { useClass: DomRootRenderer_ }),
    new Provider(RootRenderer, { useExisting: DomRootRenderer }),
    new Provider(SharedStylesHost, { useExisting: DomSharedStylesHost }),
    new Provider(XHR, { useClass: XHRImpl }),
    MessageBasedXHRImpl,
    new Provider(ServiceMessageBrokerFactory, { useClass: ServiceMessageBrokerFactory_ }),
    new Provider(ClientMessageBrokerFactory, { useClass: ClientMessageBrokerFactory_ }),
    Serializer,
    new Provider(ON_WEB_WORKER, { useValue: false }),
    RenderStore,
    DomSharedStylesHost,
    Testability,
    BrowserDetails,
    AnimationBuilder,
    EventManager
]);
export function initializeGenericWorkerRenderer(injector) {
    var bus = injector.get(MessageBus);
    let zone = injector.get(NgZone);
    bus.attachToZone(zone);
    zone.run(() => {
        WORKER_RENDER_MESSAGING_PROVIDERS.forEach((token) => { injector.get(token).start(); });
    });
}
export function initWebWorkerRenderPlatform() {
    BrowserDomAdapter.makeCurrent();
    wtfInit();
    BrowserGetTestability.init();
}
function _exceptionHandler() {
    return new ExceptionHandler(DOM, !IS_DART);
}
function _document() {
    return DOM.defaultDoc();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2VyX3JlbmRlcl9jb21tb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLXczdzN6QVVxLnRtcC9hbmd1bGFyMi9zcmMvcGxhdGZvcm0vd29ya2VyX3JlbmRlcl9jb21tb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ik9BQU8sRUFBQyxVQUFVLEVBQUUsT0FBTyxFQUFDLE1BQU0sMEJBQTBCO09BQ3JELEVBQUMsVUFBVSxFQUFDLE1BQU0sNkNBQTZDO09BQy9ELEVBQUMsTUFBTSxFQUFDLE1BQU0sZ0NBQWdDO09BQzlDLEVBS0wsZ0JBQWdCLEVBR2hCLDRCQUE0QixFQUM1Qix5QkFBeUIsRUFDekIsWUFBWSxFQUNaLG9CQUFvQixFQUVyQixNQUFNLGVBQWU7T0FDZixFQUFDLHFCQUFxQixFQUFFLFlBQVksRUFBQyxNQUFNLDhCQUE4QjtPQUN6RSxFQUFVLFFBQVEsRUFBWSxXQUFXLEVBQUMsTUFBTSxzQkFBc0I7T0FFdEUsRUFBQyxHQUFHLEVBQUMsTUFBTSx1Q0FBdUM7T0FDbEQsRUFBQyxlQUFlLEVBQUMsTUFBTSw2Q0FBNkM7T0FDcEUsRUFBQyxlQUFlLEVBQUMsTUFBTSw2Q0FBNkM7T0FDcEUsRUFBQyxvQkFBb0IsRUFBQyxNQUFNLGtEQUFrRDtPQUM5RSxFQUFDLFFBQVEsRUFBQyxNQUFNLHNDQUFzQztPQUN0RCxFQUFDLGVBQWUsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLHdDQUF3QztPQUNqRixFQUFDLG1CQUFtQixFQUFDLE1BQU0sOENBQThDO09BQ3pFLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSw4Q0FBOEM7T0FDdEUsRUFBQyxjQUFjLEVBQUMsTUFBTSxzQ0FBc0M7T0FDNUQsRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLHdDQUF3QztPQUNoRSxFQUFDLEdBQUcsRUFBQyxNQUFNLG1CQUFtQjtPQUM5QixFQUFDLE9BQU8sRUFBQyxNQUFNLHdDQUF3QztPQUN2RCxFQUFDLFdBQVcsRUFBQyxNQUFNLDJDQUEyQztPQUM5RCxFQUFDLHFCQUFxQixFQUFDLE1BQU0sMkNBQTJDO09BQ3hFLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSwyQkFBMkI7T0FDcEQsRUFBQyxPQUFPLEVBQUMsTUFBTSxvQ0FBb0M7T0FDbkQsRUFBQyxvQkFBb0IsRUFBQyxNQUFNLHNDQUFzQztPQUNsRSxFQUFDLG1CQUFtQixFQUFDLE1BQU0sc0NBQXNDO09BQ2pFLEVBQ0wsMkJBQTJCLEVBQzNCLDRCQUE0QixFQUM3QixNQUFNLHdEQUF3RDtPQUN4RCxFQUNMLDBCQUEwQixFQUMxQiwyQkFBMkIsRUFDNUIsTUFBTSx1REFBdUQ7T0FDdkQsRUFDTCx1QkFBdUIsRUFDeEIsTUFBTSxrRUFBa0U7T0FDbEUsRUFBQyxVQUFVLEVBQUMsTUFBTSw0Q0FBNEM7T0FDOUQsRUFBQyxhQUFhLEVBQUMsTUFBTSxxQ0FBcUM7T0FDMUQsRUFBQyxXQUFXLEVBQUMsTUFBTSw4Q0FBOEM7T0FDakUsRUFBQyxxQkFBcUIsRUFBRSxtQkFBbUIsRUFBQyxNQUFNLDhCQUE4QjtBQUV2RixPQUFPLE1BQU0sYUFBYSxHQUFnQixVQUFVLENBQUMsSUFBSSxXQUFXLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO0FBRXpGLDZEQUE2RDtBQUM3RCxPQUFPLE1BQU0saUNBQWlDLEdBQzFDLFVBQVUsQ0FBQyxDQUFDLG9CQUFvQixFQUFFLG1CQUFtQixDQUFDLENBQUMsQ0FBQztBQUU1RCxPQUFPLE1BQU0sc0JBQXNCLEdBQTJDLFVBQVUsQ0FBQztJQUN2Rix5QkFBeUI7SUFDekIsSUFBSSxRQUFRLENBQUMsb0JBQW9CLEVBQUUsRUFBQyxRQUFRLEVBQUUsMkJBQTJCLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBQyxDQUFDO0NBQ3pGLENBQUMsQ0FBQztBQUVIOzs7R0FHRztBQUNILE9BQU8sTUFBTSxvQkFBb0IsR0FDN0IsVUFBVSxDQUFDLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxDQUFDO0FBRTFDLE9BQU8sTUFBTSxnQ0FBZ0MsR0FBMkMsVUFBVSxDQUFDO0lBQ2pHLDRCQUE0QjtJQUM1QixpQ0FBaUM7SUFDakMsSUFBSSxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsRUFBQyxVQUFVLEVBQUUsaUJBQWlCLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBQyxDQUFDO0lBQ3pFLElBQUksUUFBUSxDQUFDLFFBQVEsRUFBRSxFQUFDLFVBQVUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBQyxDQUFDO0lBQ3pELDBGQUEwRjtJQUMxRixRQUFRO0lBQ1IsSUFBSSxRQUFRLENBQUMscUJBQXFCLEVBQUUsRUFBQyxRQUFRLEVBQUUsZUFBZSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUMsQ0FBQztJQUM3RSxJQUFJLFFBQVEsQ0FBQyxxQkFBcUIsRUFBRSxFQUFDLFFBQVEsRUFBRSxlQUFlLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBQyxDQUFDO0lBQzdFLElBQUksUUFBUSxDQUFDLHFCQUFxQixFQUFFLEVBQUMsUUFBUSxFQUFFLG9CQUFvQixFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUMsQ0FBQztJQUNsRixJQUFJLFFBQVEsQ0FBQyxxQkFBcUIsRUFBRSxFQUFDLFFBQVEsRUFBRSxtQkFBbUIsRUFBQyxDQUFDO0lBQ3BFLElBQUksUUFBUSxDQUFDLGVBQWUsRUFBRSxFQUFDLFFBQVEsRUFBRSxnQkFBZ0IsRUFBQyxDQUFDO0lBQzNELElBQUksUUFBUSxDQUFDLFlBQVksRUFBRSxFQUFDLFdBQVcsRUFBRSxlQUFlLEVBQUMsQ0FBQztJQUMxRCxJQUFJLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxFQUFDLFdBQVcsRUFBRSxtQkFBbUIsRUFBQyxDQUFDO0lBQ2xFLElBQUksUUFBUSxDQUFDLEdBQUcsRUFBRSxFQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUMsQ0FBQztJQUN0QyxtQkFBbUI7SUFDbkIsSUFBSSxRQUFRLENBQUMsMkJBQTJCLEVBQUUsRUFBQyxRQUFRLEVBQUUsNEJBQTRCLEVBQUMsQ0FBQztJQUNuRixJQUFJLFFBQVEsQ0FBQywwQkFBMEIsRUFBRSxFQUFDLFFBQVEsRUFBRSwyQkFBMkIsRUFBQyxDQUFDO0lBQ2pGLFVBQVU7SUFDVixJQUFJLFFBQVEsQ0FBQyxhQUFhLEVBQUUsRUFBQyxRQUFRLEVBQUUsS0FBSyxFQUFDLENBQUM7SUFDOUMsV0FBVztJQUNYLG1CQUFtQjtJQUNuQixXQUFXO0lBQ1gsY0FBYztJQUNkLGdCQUFnQjtJQUNoQixZQUFZO0NBQ2IsQ0FBQyxDQUFDO0FBRUgsZ0RBQWdELFFBQWtCO0lBQ2hFLElBQUksR0FBRyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDbkMsSUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNoQyxHQUFHLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBRXZCLElBQUksQ0FBQyxHQUFHLENBQUM7UUFDUCxpQ0FBaUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLE9BQU8sUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3pGLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUVEO0lBQ0UsaUJBQWlCLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDaEMsT0FBTyxFQUFFLENBQUM7SUFDVixxQkFBcUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUMvQixDQUFDO0FBRUQ7SUFDRSxNQUFNLENBQUMsSUFBSSxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM3QyxDQUFDO0FBRUQ7SUFDRSxNQUFNLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxDQUFDO0FBQzFCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NPTlNUX0VYUFIsIElTX0RBUlR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge01lc3NhZ2VCdXN9IGZyb20gJ2FuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy9zaGFyZWQvbWVzc2FnZV9idXMnO1xuaW1wb3J0IHtOZ1pvbmV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3pvbmUvbmdfem9uZSc7XG5pbXBvcnQge1xuICBQTEFURk9STV9ESVJFQ1RJVkVTLFxuICBQTEFURk9STV9QSVBFUyxcbiAgQ29tcG9uZW50UmVmLFxuICBwbGF0Zm9ybSxcbiAgRXhjZXB0aW9uSGFuZGxlcixcbiAgUmVmbGVjdG9yLFxuICByZWZsZWN0b3IsXG4gIEFQUExJQ0FUSU9OX0NPTU1PTl9QUk9WSURFUlMsXG4gIFBMQVRGT1JNX0NPTU1PTl9QUk9WSURFUlMsXG4gIFJvb3RSZW5kZXJlcixcbiAgUExBVEZPUk1fSU5JVElBTElaRVIsXG4gIEFQUF9JTklUSUFMSVpFUlxufSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7RVZFTlRfTUFOQUdFUl9QTFVHSU5TLCBFdmVudE1hbmFnZXJ9IGZyb20gJ2FuZ3VsYXIyL3BsYXRmb3JtL2NvbW1vbl9kb20nO1xuaW1wb3J0IHtwcm92aWRlLCBQcm92aWRlciwgSW5qZWN0b3IsIE9wYXF1ZVRva2VufSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG4vLyBUT0RPIGNoYW5nZSB0aGVzZSBpbXBvcnRzIG9uY2UgZG9tX2FkYXB0ZXIgaXMgbW92ZWQgb3V0IG9mIGNvcmVcbmltcG9ydCB7RE9NfSBmcm9tICdhbmd1bGFyMi9zcmMvcGxhdGZvcm0vZG9tL2RvbV9hZGFwdGVyJztcbmltcG9ydCB7RG9tRXZlbnRzUGx1Z2lufSBmcm9tICdhbmd1bGFyMi9zcmMvcGxhdGZvcm0vZG9tL2V2ZW50cy9kb21fZXZlbnRzJztcbmltcG9ydCB7S2V5RXZlbnRzUGx1Z2lufSBmcm9tICdhbmd1bGFyMi9zcmMvcGxhdGZvcm0vZG9tL2V2ZW50cy9rZXlfZXZlbnRzJztcbmltcG9ydCB7SGFtbWVyR2VzdHVyZXNQbHVnaW59IGZyb20gJ2FuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9kb20vZXZlbnRzL2hhbW1lcl9nZXN0dXJlcyc7XG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICdhbmd1bGFyMi9zcmMvcGxhdGZvcm0vZG9tL2RvbV90b2tlbnMnO1xuaW1wb3J0IHtEb21Sb290UmVuZGVyZXIsIERvbVJvb3RSZW5kZXJlcl99IGZyb20gJ2FuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9kb20vZG9tX3JlbmRlcmVyJztcbmltcG9ydCB7RG9tU2hhcmVkU3R5bGVzSG9zdH0gZnJvbSAnYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2RvbS9zaGFyZWRfc3R5bGVzX2hvc3QnO1xuaW1wb3J0IHtTaGFyZWRTdHlsZXNIb3N0fSBmcm9tIFwiYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2RvbS9zaGFyZWRfc3R5bGVzX2hvc3RcIjtcbmltcG9ydCB7QnJvd3NlckRldGFpbHN9IGZyb20gJ2FuZ3VsYXIyL3NyYy9hbmltYXRlL2Jyb3dzZXJfZGV0YWlscyc7XG5pbXBvcnQge0FuaW1hdGlvbkJ1aWxkZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9hbmltYXRlL2FuaW1hdGlvbl9idWlsZGVyJztcbmltcG9ydCB7WEhSfSBmcm9tICdhbmd1bGFyMi9jb21waWxlcic7XG5pbXBvcnQge1hIUkltcGx9IGZyb20gJ2FuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9icm93c2VyL3hocl9pbXBsJztcbmltcG9ydCB7VGVzdGFiaWxpdHl9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3Rlc3RhYmlsaXR5L3Rlc3RhYmlsaXR5JztcbmltcG9ydCB7QnJvd3NlckdldFRlc3RhYmlsaXR5fSBmcm9tICdhbmd1bGFyMi9zcmMvcGxhdGZvcm0vYnJvd3Nlci90ZXN0YWJpbGl0eSc7XG5pbXBvcnQge0Jyb3dzZXJEb21BZGFwdGVyfSBmcm9tICcuL2Jyb3dzZXIvYnJvd3Nlcl9hZGFwdGVyJztcbmltcG9ydCB7d3RmSW5pdH0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvcHJvZmlsZS93dGZfaW5pdCc7XG5pbXBvcnQge01lc3NhZ2VCYXNlZFJlbmRlcmVyfSBmcm9tICdhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvdWkvcmVuZGVyZXInO1xuaW1wb3J0IHtNZXNzYWdlQmFzZWRYSFJJbXBsfSBmcm9tICdhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvdWkveGhyX2ltcGwnO1xuaW1wb3J0IHtcbiAgU2VydmljZU1lc3NhZ2VCcm9rZXJGYWN0b3J5LFxuICBTZXJ2aWNlTWVzc2FnZUJyb2tlckZhY3RvcnlfXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy9zaGFyZWQvc2VydmljZV9tZXNzYWdlX2Jyb2tlcic7XG5pbXBvcnQge1xuICBDbGllbnRNZXNzYWdlQnJva2VyRmFjdG9yeSxcbiAgQ2xpZW50TWVzc2FnZUJyb2tlckZhY3RvcnlfXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy9zaGFyZWQvY2xpZW50X21lc3NhZ2VfYnJva2VyJztcbmltcG9ydCB7XG4gIEJyb3dzZXJQbGF0Zm9ybUxvY2F0aW9uXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9icm93c2VyL2xvY2F0aW9uL2Jyb3dzZXJfcGxhdGZvcm1fbG9jYXRpb24nO1xuaW1wb3J0IHtTZXJpYWxpemVyfSBmcm9tICdhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvc2hhcmVkL3NlcmlhbGl6ZXInO1xuaW1wb3J0IHtPTl9XRUJfV09SS0VSfSBmcm9tICdhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvc2hhcmVkL2FwaSc7XG5pbXBvcnQge1JlbmRlclN0b3JlfSBmcm9tICdhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvc2hhcmVkL3JlbmRlcl9zdG9yZSc7XG5pbXBvcnQge0hBTU1FUl9HRVNUVVJFX0NPTkZJRywgSGFtbWVyR2VzdHVyZUNvbmZpZ30gZnJvbSAnLi9kb20vZXZlbnRzL2hhbW1lcl9nZXN0dXJlcyc7XG5cbmV4cG9ydCBjb25zdCBXT1JLRVJfU0NSSVBUOiBPcGFxdWVUb2tlbiA9IENPTlNUX0VYUFIobmV3IE9wYXF1ZVRva2VuKFwiV2ViV29ya2VyU2NyaXB0XCIpKTtcblxuLy8gTWVzc2FnZSBiYXNlZCBXb3JrZXIgY2xhc3NlcyB0aGF0IGxpc3RlbiBvbiB0aGUgTWVzc2FnZUJ1c1xuZXhwb3J0IGNvbnN0IFdPUktFUl9SRU5ERVJfTUVTU0FHSU5HX1BST1ZJREVSUzogQXJyYXk8YW55IC8qVHlwZSB8IFByb3ZpZGVyIHwgYW55W10qLz4gPVxuICAgIENPTlNUX0VYUFIoW01lc3NhZ2VCYXNlZFJlbmRlcmVyLCBNZXNzYWdlQmFzZWRYSFJJbXBsXSk7XG5cbmV4cG9ydCBjb25zdCBXT1JLRVJfUkVOREVSX1BMQVRGT1JNOiBBcnJheTxhbnkgLypUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXSovPiA9IENPTlNUX0VYUFIoW1xuICBQTEFURk9STV9DT01NT05fUFJPVklERVJTLFxuICBuZXcgUHJvdmlkZXIoUExBVEZPUk1fSU5JVElBTElaRVIsIHt1c2VWYWx1ZTogaW5pdFdlYldvcmtlclJlbmRlclBsYXRmb3JtLCBtdWx0aTogdHJ1ZX0pXG5dKTtcblxuLyoqXG4gKiBBIGxpc3Qgb2Yge0BsaW5rIFByb3ZpZGVyfXMuIFRvIHVzZSB0aGUgcm91dGVyIGluIGEgV29ya2VyIGVuYWJsZWQgYXBwbGljYXRpb24geW91IG11c3RcbiAqIGluY2x1ZGUgdGhlc2UgcHJvdmlkZXJzIHdoZW4gc2V0dGluZyB1cCB0aGUgcmVuZGVyIHRocmVhZC5cbiAqL1xuZXhwb3J0IGNvbnN0IFdPUktFUl9SRU5ERVJfUk9VVEVSOiBBcnJheTxhbnkgLypUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXSovPiA9XG4gICAgQ09OU1RfRVhQUihbQnJvd3NlclBsYXRmb3JtTG9jYXRpb25dKTtcblxuZXhwb3J0IGNvbnN0IFdPUktFUl9SRU5ERVJfQVBQTElDQVRJT05fQ09NTU9OOiBBcnJheTxhbnkgLypUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXSovPiA9IENPTlNUX0VYUFIoW1xuICBBUFBMSUNBVElPTl9DT01NT05fUFJPVklERVJTLFxuICBXT1JLRVJfUkVOREVSX01FU1NBR0lOR19QUk9WSURFUlMsXG4gIG5ldyBQcm92aWRlcihFeGNlcHRpb25IYW5kbGVyLCB7dXNlRmFjdG9yeTogX2V4Y2VwdGlvbkhhbmRsZXIsIGRlcHM6IFtdfSksXG4gIG5ldyBQcm92aWRlcihET0NVTUVOVCwge3VzZUZhY3Rvcnk6IF9kb2N1bWVudCwgZGVwczogW119KSxcbiAgLy8gVE9ETyhqdGVwbGl0ejYwMik6IEludmVzdGlnYXRlIGlmIHdlIGRlZmluaXRlbHkgbmVlZCBFVkVOVF9NQU5BR0VSIG9uIHRoZSByZW5kZXIgdGhyZWFkXG4gIC8vICM1Mjk4XG4gIG5ldyBQcm92aWRlcihFVkVOVF9NQU5BR0VSX1BMVUdJTlMsIHt1c2VDbGFzczogRG9tRXZlbnRzUGx1Z2luLCBtdWx0aTogdHJ1ZX0pLFxuICBuZXcgUHJvdmlkZXIoRVZFTlRfTUFOQUdFUl9QTFVHSU5TLCB7dXNlQ2xhc3M6IEtleUV2ZW50c1BsdWdpbiwgbXVsdGk6IHRydWV9KSxcbiAgbmV3IFByb3ZpZGVyKEVWRU5UX01BTkFHRVJfUExVR0lOUywge3VzZUNsYXNzOiBIYW1tZXJHZXN0dXJlc1BsdWdpbiwgbXVsdGk6IHRydWV9KSxcbiAgbmV3IFByb3ZpZGVyKEhBTU1FUl9HRVNUVVJFX0NPTkZJRywge3VzZUNsYXNzOiBIYW1tZXJHZXN0dXJlQ29uZmlnfSksXG4gIG5ldyBQcm92aWRlcihEb21Sb290UmVuZGVyZXIsIHt1c2VDbGFzczogRG9tUm9vdFJlbmRlcmVyX30pLFxuICBuZXcgUHJvdmlkZXIoUm9vdFJlbmRlcmVyLCB7dXNlRXhpc3Rpbmc6IERvbVJvb3RSZW5kZXJlcn0pLFxuICBuZXcgUHJvdmlkZXIoU2hhcmVkU3R5bGVzSG9zdCwge3VzZUV4aXN0aW5nOiBEb21TaGFyZWRTdHlsZXNIb3N0fSksXG4gIG5ldyBQcm92aWRlcihYSFIsIHt1c2VDbGFzczogWEhSSW1wbH0pLFxuICBNZXNzYWdlQmFzZWRYSFJJbXBsLFxuICBuZXcgUHJvdmlkZXIoU2VydmljZU1lc3NhZ2VCcm9rZXJGYWN0b3J5LCB7dXNlQ2xhc3M6IFNlcnZpY2VNZXNzYWdlQnJva2VyRmFjdG9yeV99KSxcbiAgbmV3IFByb3ZpZGVyKENsaWVudE1lc3NhZ2VCcm9rZXJGYWN0b3J5LCB7dXNlQ2xhc3M6IENsaWVudE1lc3NhZ2VCcm9rZXJGYWN0b3J5X30pLFxuICBTZXJpYWxpemVyLFxuICBuZXcgUHJvdmlkZXIoT05fV0VCX1dPUktFUiwge3VzZVZhbHVlOiBmYWxzZX0pLFxuICBSZW5kZXJTdG9yZSxcbiAgRG9tU2hhcmVkU3R5bGVzSG9zdCxcbiAgVGVzdGFiaWxpdHksXG4gIEJyb3dzZXJEZXRhaWxzLFxuICBBbmltYXRpb25CdWlsZGVyLFxuICBFdmVudE1hbmFnZXJcbl0pO1xuXG5leHBvcnQgZnVuY3Rpb24gaW5pdGlhbGl6ZUdlbmVyaWNXb3JrZXJSZW5kZXJlcihpbmplY3RvcjogSW5qZWN0b3IpIHtcbiAgdmFyIGJ1cyA9IGluamVjdG9yLmdldChNZXNzYWdlQnVzKTtcbiAgbGV0IHpvbmUgPSBpbmplY3Rvci5nZXQoTmdab25lKTtcbiAgYnVzLmF0dGFjaFRvWm9uZSh6b25lKTtcblxuICB6b25lLnJ1bigoKSA9PiB7XG4gICAgV09SS0VSX1JFTkRFUl9NRVNTQUdJTkdfUFJPVklERVJTLmZvckVhY2goKHRva2VuKSA9PiB7IGluamVjdG9yLmdldCh0b2tlbikuc3RhcnQoKTsgfSk7XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5pdFdlYldvcmtlclJlbmRlclBsYXRmb3JtKCk6IHZvaWQge1xuICBCcm93c2VyRG9tQWRhcHRlci5tYWtlQ3VycmVudCgpO1xuICB3dGZJbml0KCk7XG4gIEJyb3dzZXJHZXRUZXN0YWJpbGl0eS5pbml0KCk7XG59XG5cbmZ1bmN0aW9uIF9leGNlcHRpb25IYW5kbGVyKCk6IEV4Y2VwdGlvbkhhbmRsZXIge1xuICByZXR1cm4gbmV3IEV4Y2VwdGlvbkhhbmRsZXIoRE9NLCAhSVNfREFSVCk7XG59XG5cbmZ1bmN0aW9uIF9kb2N1bWVudCgpOiBhbnkge1xuICByZXR1cm4gRE9NLmRlZmF1bHREb2MoKTtcbn1cbiJdfQ==