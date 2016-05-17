import { isBlank, isPresent } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { StringMapWrapper } from 'angular2/src/facade/collection';
import * as cd from 'angular2/src/core/change_detection/pipes';
export class ProtoPipes {
    constructor(
        /**
        * Map of {@link PipeMetadata} names to {@link PipeMetadata} implementations.
        */
        config) {
        this.config = config;
        this.config = config;
    }
    static fromProviders(providers) {
        var config = {};
        providers.forEach(b => config[b.name] = b);
        return new ProtoPipes(config);
    }
    get(name) {
        var provider = this.config[name];
        if (isBlank(provider))
            throw new BaseException(`Cannot find pipe '${name}'.`);
        return provider;
    }
}
export class Pipes {
    constructor(proto, injector) {
        this.proto = proto;
        this.injector = injector;
        /** @internal */
        this._config = {};
    }
    get(name) {
        var cached = StringMapWrapper.get(this._config, name);
        if (isPresent(cached))
            return cached;
        var p = this.proto.get(name);
        var transform = this.injector.instantiateResolved(p);
        var res = new cd.SelectedPipe(transform, p.pure);
        if (p.pure) {
            StringMapWrapper.set(this._config, name, res);
        }
        return res;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGlwZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLXczdzN6QVVxLnRtcC9hbmd1bGFyMi9zcmMvY29yZS9waXBlcy9waXBlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiT0FBTyxFQUFDLE9BQU8sRUFBRSxTQUFTLEVBQWMsTUFBTSwwQkFBMEI7T0FDakUsRUFBQyxhQUFhLEVBQW1CLE1BQU0sZ0NBQWdDO09BQ3ZFLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxnQ0FBZ0M7T0FVeEQsS0FBSyxFQUFFLE1BQU0sMENBQTBDO0FBRTlEO0lBT0U7UUFDSTs7VUFFRTtRQUNLLE1BQXFDO1FBQXJDLFdBQU0sR0FBTixNQUFNLENBQStCO1FBQzlDLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0lBQ3ZCLENBQUM7SUFaRCxPQUFPLGFBQWEsQ0FBQyxTQUF5QjtRQUM1QyxJQUFJLE1BQU0sR0FBa0MsRUFBRSxDQUFDO1FBQy9DLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDM0MsTUFBTSxDQUFDLElBQUksVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2hDLENBQUM7SUFVRCxHQUFHLENBQUMsSUFBWTtRQUNkLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDakMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQUMsTUFBTSxJQUFJLGFBQWEsQ0FBQyxxQkFBcUIsSUFBSSxJQUFJLENBQUMsQ0FBQztRQUM5RSxNQUFNLENBQUMsUUFBUSxDQUFDO0lBQ2xCLENBQUM7QUFDSCxDQUFDO0FBSUQ7SUFJRSxZQUFtQixLQUFpQixFQUFTLFFBQWtCO1FBQTVDLFVBQUssR0FBTCxLQUFLLENBQVk7UUFBUyxhQUFRLEdBQVIsUUFBUSxDQUFVO1FBSC9ELGdCQUFnQjtRQUNoQixZQUFPLEdBQXFDLEVBQUUsQ0FBQztJQUVtQixDQUFDO0lBRW5FLEdBQUcsQ0FBQyxJQUFZO1FBQ2QsSUFBSSxNQUFNLEdBQUcsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDdEQsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUNyQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM3QixJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JELElBQUksR0FBRyxHQUFHLElBQUksRUFBRSxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRWpELEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ1gsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ2hELENBQUM7UUFFRCxNQUFNLENBQUMsR0FBRyxDQUFDO0lBQ2IsQ0FBQztBQUNILENBQUM7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7aXNCbGFuaywgaXNQcmVzZW50LCBDT05TVCwgVHlwZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbiwgV3JhcHBlZEV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7U3RyaW5nTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7XG4gIEluamVjdGFibGUsXG4gIE9wdGlvbmFsTWV0YWRhdGEsXG4gIFNraXBTZWxmTWV0YWRhdGEsXG4gIFByb3ZpZGVyLFxuICBJbmplY3RvcixcbiAgYmluZFxufSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge1BpcGVQcm92aWRlcn0gZnJvbSAnLi9waXBlX3Byb3ZpZGVyJztcbmltcG9ydCAqIGFzIGNkIGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2NoYW5nZV9kZXRlY3Rpb24vcGlwZXMnO1xuXG5leHBvcnQgY2xhc3MgUHJvdG9QaXBlcyB7XG4gIHN0YXRpYyBmcm9tUHJvdmlkZXJzKHByb3ZpZGVyczogUGlwZVByb3ZpZGVyW10pOiBQcm90b1BpcGVzIHtcbiAgICB2YXIgY29uZmlnOiB7W2tleTogc3RyaW5nXTogUGlwZVByb3ZpZGVyfSA9IHt9O1xuICAgIHByb3ZpZGVycy5mb3JFYWNoKGIgPT4gY29uZmlnW2IubmFtZV0gPSBiKTtcbiAgICByZXR1cm4gbmV3IFByb3RvUGlwZXMoY29uZmlnKTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgLyoqXG4gICAgICAqIE1hcCBvZiB7QGxpbmsgUGlwZU1ldGFkYXRhfSBuYW1lcyB0byB7QGxpbmsgUGlwZU1ldGFkYXRhfSBpbXBsZW1lbnRhdGlvbnMuXG4gICAgICAqL1xuICAgICAgcHVibGljIGNvbmZpZzoge1trZXk6IHN0cmluZ106IFBpcGVQcm92aWRlcn0pIHtcbiAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgfVxuXG4gIGdldChuYW1lOiBzdHJpbmcpOiBQaXBlUHJvdmlkZXIge1xuICAgIHZhciBwcm92aWRlciA9IHRoaXMuY29uZmlnW25hbWVdO1xuICAgIGlmIChpc0JsYW5rKHByb3ZpZGVyKSkgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYENhbm5vdCBmaW5kIHBpcGUgJyR7bmFtZX0nLmApO1xuICAgIHJldHVybiBwcm92aWRlcjtcbiAgfVxufVxuXG5cblxuZXhwb3J0IGNsYXNzIFBpcGVzIGltcGxlbWVudHMgY2QuUGlwZXMge1xuICAvKiogQGludGVybmFsICovXG4gIF9jb25maWc6IHtba2V5OiBzdHJpbmddOiBjZC5TZWxlY3RlZFBpcGV9ID0ge307XG5cbiAgY29uc3RydWN0b3IocHVibGljIHByb3RvOiBQcm90b1BpcGVzLCBwdWJsaWMgaW5qZWN0b3I6IEluamVjdG9yKSB7fVxuXG4gIGdldChuYW1lOiBzdHJpbmcpOiBjZC5TZWxlY3RlZFBpcGUge1xuICAgIHZhciBjYWNoZWQgPSBTdHJpbmdNYXBXcmFwcGVyLmdldCh0aGlzLl9jb25maWcsIG5hbWUpO1xuICAgIGlmIChpc1ByZXNlbnQoY2FjaGVkKSkgcmV0dXJuIGNhY2hlZDtcbiAgICB2YXIgcCA9IHRoaXMucHJvdG8uZ2V0KG5hbWUpO1xuICAgIHZhciB0cmFuc2Zvcm0gPSB0aGlzLmluamVjdG9yLmluc3RhbnRpYXRlUmVzb2x2ZWQocCk7XG4gICAgdmFyIHJlcyA9IG5ldyBjZC5TZWxlY3RlZFBpcGUodHJhbnNmb3JtLCBwLnB1cmUpO1xuXG4gICAgaWYgKHAucHVyZSkge1xuICAgICAgU3RyaW5nTWFwV3JhcHBlci5zZXQodGhpcy5fY29uZmlnLCBuYW1lLCByZXMpO1xuICAgIH1cblxuICAgIHJldHVybiByZXM7XG4gIH1cbn1cbiJdfQ==