/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { ContentChild, Directive, ElementRef, EventEmitter, HostListener, Input, NgZone, Output, Renderer2 } from "@angular/core";
import { getDirectChildElement, getDropData, shouldPositionPlaceholderBeforeElement } from "./dnd-utils";
import { getDndType, getDropEffect, isExternalDrag, setDropEffect } from "./dnd-state";
/**
 * @record
 */
export function DndDropEvent() { }
if (false) {
    /** @type {?} */
    DndDropEvent.prototype.event;
    /** @type {?} */
    DndDropEvent.prototype.dropEffect;
    /** @type {?} */
    DndDropEvent.prototype.isExternal;
    /** @type {?|undefined} */
    DndDropEvent.prototype.data;
    /** @type {?|undefined} */
    DndDropEvent.prototype.index;
    /** @type {?|undefined} */
    DndDropEvent.prototype.type;
}
export class DndPlaceholderRefDirective {
    /**
     * @param {?} elementRef
     */
    constructor(elementRef) {
        this.elementRef = elementRef;
    }
}
DndPlaceholderRefDirective.decorators = [
    { type: Directive, args: [{
                selector: "[dndPlaceholderRef]"
            },] }
];
/** @nocollapse */
DndPlaceholderRefDirective.ctorParameters = () => [
    { type: ElementRef }
];
if (false) {
    /** @type {?} */
    DndPlaceholderRefDirective.prototype.elementRef;
}
export class DndDropzoneDirective {
    /**
     * @param {?} ngZone
     * @param {?} elementRef
     * @param {?} renderer
     */
    constructor(ngZone, elementRef, renderer) {
        this.ngZone = ngZone;
        this.elementRef = elementRef;
        this.renderer = renderer;
        this.dndAllowExternal = false;
        this.dndHorizontal = false;
        this.dndDragoverClass = "dndDragover";
        this.dndDropzoneDisabledClass = "dndDropzoneDisabled";
        this.dndDragover = new EventEmitter();
        this.dndDrop = new EventEmitter();
        this.placeholder = null;
        this.disabled = false;
        this.dragEnterEventHandler = (/**
         * @param {?} event
         * @return {?}
         */
        (event) => this.onDragEnter(event));
        this.dragOverEventHandler = (/**
         * @param {?} event
         * @return {?}
         */
        (event) => this.onDragOver(event));
        this.dragLeaveEventHandler = (/**
         * @param {?} event
         * @return {?}
         */
        (event) => this.onDragLeave(event));
    }
    /**
     * @param {?} value
     * @return {?}
     */
    set dndDisableIf(value) {
        this.disabled = !!value;
        if (this.disabled) {
            this.renderer.addClass(this.elementRef.nativeElement, this.dndDropzoneDisabledClass);
        }
        else {
            this.renderer.removeClass(this.elementRef.nativeElement, this.dndDropzoneDisabledClass);
        }
    }
    /**
     * @param {?} value
     * @return {?}
     */
    set dndDisableDropIf(value) {
        this.dndDisableIf = value;
    }
    /**
     * @return {?}
     */
    ngAfterViewInit() {
        this.placeholder = this.tryGetPlaceholder();
        this.removePlaceholderFromDOM();
        this.ngZone.runOutsideAngular((/**
         * @return {?}
         */
        () => {
            this.elementRef.nativeElement.addEventListener("dragenter", this.dragEnterEventHandler);
            this.elementRef.nativeElement.addEventListener("dragover", this.dragOverEventHandler);
            this.elementRef.nativeElement.addEventListener("dragleave", this.dragLeaveEventHandler);
        }));
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        this.elementRef.nativeElement.removeEventListener("dragenter", this.dragEnterEventHandler);
        this.elementRef.nativeElement.removeEventListener("dragover", this.dragOverEventHandler);
        this.elementRef.nativeElement.removeEventListener("dragleave", this.dragLeaveEventHandler);
    }
    /**
     * @param {?} event
     * @return {?}
     */
    onDragEnter(event) {
        // check if another dropzone is activated
        if (event._dndDropzoneActive === true) {
            this.cleanupDragoverState();
            return;
        }
        // set as active if the target element is inside this dropzone
        if (typeof event._dndDropzoneActive === "undefined") {
            /** @type {?} */
            const newTarget = document.elementFromPoint(event.clientX, event.clientY);
            if (this.elementRef.nativeElement.contains(newTarget)) {
                event._dndDropzoneActive = true;
            }
        }
        // check if this drag event is allowed to drop on this dropzone
        /** @type {?} */
        const type = getDndType(event);
        if (this.isDropAllowed(type) === false) {
            return;
        }
        // allow the dragenter
        event.preventDefault();
    }
    /**
     * @param {?} event
     * @return {?}
     */
    onDragOver(event) {
        // With nested dropzones, we want to ignore this event if a child dropzone
        // has already handled a dragover.  Historically, event.stopPropagation() was
        // used to prevent this bubbling, but that prevents any dragovers outside the
        // ngx-drag-drop component, and stops other use cases such as scrolling on drag.
        // Instead, we can check if the event was already prevented by a child and bail early.
        if (event.defaultPrevented) {
            return;
        }
        // check if this drag event is allowed to drop on this dropzone
        /** @type {?} */
        const type = getDndType(event);
        if (this.isDropAllowed(type) === false) {
            return;
        }
        this.checkAndUpdatePlaceholderPosition(event);
        /** @type {?} */
        const dropEffect = getDropEffect(event, this.dndEffectAllowed);
        if (dropEffect === "none") {
            this.cleanupDragoverState();
            return;
        }
        // allow the dragover
        event.preventDefault();
        // set the drop effect
        setDropEffect(event, dropEffect);
        this.dndDragover.emit(event);
        this.renderer.addClass(this.elementRef.nativeElement, this.dndDragoverClass);
    }
    /**
     * @param {?} event
     * @return {?}
     */
    onDrop(event) {
        try {
            // check if this drag event is allowed to drop on this dropzone
            /** @type {?} */
            const type = getDndType(event);
            if (this.isDropAllowed(type) === false) {
                return;
            }
            /** @type {?} */
            const data = getDropData(event, isExternalDrag());
            if (this.isDropAllowed(data.type) === false) {
                return;
            }
            // signal custom drop handling
            event.preventDefault();
            /** @type {?} */
            const dropEffect = getDropEffect(event);
            setDropEffect(event, dropEffect);
            if (dropEffect === "none") {
                return;
            }
            /** @type {?} */
            const dropIndex = this.getPlaceholderIndex();
            // if for whatever reason the placeholder is not present in the DOM but it should be there
            // we don't allow/emit the drop event since it breaks the contract
            // seems to only happen if drag and drop is executed faster than the DOM updates
            if (dropIndex === -1) {
                return;
            }
            this.dndDrop.emit({
                event: event,
                dropEffect: dropEffect,
                isExternal: isExternalDrag(),
                data: data.data,
                index: dropIndex,
                type: type,
            });
            event.stopPropagation();
        }
        finally {
            this.cleanupDragoverState();
        }
    }
    /**
     * @param {?} event
     * @return {?}
     */
    onDragLeave(event) {
        // check if still inside this dropzone and not yet handled by another dropzone
        if (typeof event._dndDropzoneActive === "undefined") {
            /** @type {?} */
            const newTarget = document.elementFromPoint(event.clientX, event.clientY);
            if (this.elementRef.nativeElement.contains(newTarget)) {
                event._dndDropzoneActive = true;
                return;
            }
        }
        this.cleanupDragoverState();
        // cleanup drop effect when leaving dropzone
        setDropEffect(event, "none");
    }
    /**
     * @private
     * @param {?=} type
     * @return {?}
     */
    isDropAllowed(type) {
        // dropzone is disabled -> deny it
        if (this.disabled === true) {
            return false;
        }
        // if drag did not start from our directive
        // and external drag sources are not allowed -> deny it
        if (isExternalDrag() === true
            && this.dndAllowExternal === false) {
            return false;
        }
        // no filtering by types -> allow it
        if (!this.dndDropzone) {
            return true;
        }
        // no type set -> allow it
        if (!type) {
            return true;
        }
        if (Array.isArray(this.dndDropzone) === false) {
            throw new Error("dndDropzone: bound value to [dndDropzone] must be an array!");
        }
        // if dropzone contains type -> allow it
        return this.dndDropzone.indexOf(type) !== -1;
    }
    /**
     * @private
     * @return {?}
     */
    tryGetPlaceholder() {
        if (typeof this.dndPlaceholderRef !== "undefined") {
            return (/** @type {?} */ (this.dndPlaceholderRef.elementRef.nativeElement));
        }
        // TODO nasty workaround needed because if ng-container / template is used @ContentChild() or DI will fail because
        // of wrong context see angular bug https://github.com/angular/angular/issues/13517
        return this.elementRef.nativeElement.querySelector("[dndPlaceholderRef]");
    }
    /**
     * @private
     * @return {?}
     */
    removePlaceholderFromDOM() {
        if (this.placeholder !== null
            && this.placeholder.parentNode !== null) {
            this.placeholder.parentNode.removeChild(this.placeholder);
        }
    }
    /**
     * @private
     * @param {?} event
     * @return {?}
     */
    checkAndUpdatePlaceholderPosition(event) {
        if (this.placeholder === null) {
            return;
        }
        // make sure the placeholder is in the DOM
        if (this.placeholder.parentNode !== this.elementRef.nativeElement) {
            this.renderer.appendChild(this.elementRef.nativeElement, this.placeholder);
        }
        // update the position if the event originates from a child element of the dropzone
        /** @type {?} */
        const directChild = getDirectChildElement(this.elementRef.nativeElement, (/** @type {?} */ (event.target)));
        // early exit if no direct child or direct child is placeholder
        if (directChild === null
            || directChild === this.placeholder) {
            return;
        }
        /** @type {?} */
        const positionPlaceholderBeforeDirectChild = shouldPositionPlaceholderBeforeElement(event, directChild, this.dndHorizontal);
        if (positionPlaceholderBeforeDirectChild) {
            // do insert before only if necessary
            if (directChild.previousSibling !== this.placeholder) {
                this.renderer.insertBefore(this.elementRef.nativeElement, this.placeholder, directChild);
            }
        }
        else {
            // do insert after only if necessary
            if (directChild.nextSibling !== this.placeholder) {
                this.renderer.insertBefore(this.elementRef.nativeElement, this.placeholder, directChild.nextSibling);
            }
        }
    }
    /**
     * @private
     * @return {?}
     */
    getPlaceholderIndex() {
        if (this.placeholder === null) {
            return undefined;
        }
        /** @type {?} */
        const element = (/** @type {?} */ (this.elementRef.nativeElement));
        return Array.prototype.indexOf.call(element.children, this.placeholder);
    }
    /**
     * @private
     * @return {?}
     */
    cleanupDragoverState() {
        this.renderer.removeClass(this.elementRef.nativeElement, this.dndDragoverClass);
        this.removePlaceholderFromDOM();
    }
}
DndDropzoneDirective.decorators = [
    { type: Directive, args: [{
                selector: "[dndDropzone]"
            },] }
];
/** @nocollapse */
DndDropzoneDirective.ctorParameters = () => [
    { type: NgZone },
    { type: ElementRef },
    { type: Renderer2 }
];
DndDropzoneDirective.propDecorators = {
    dndDropzone: [{ type: Input }],
    dndEffectAllowed: [{ type: Input }],
    dndAllowExternal: [{ type: Input }],
    dndHorizontal: [{ type: Input }],
    dndDragoverClass: [{ type: Input }],
    dndDropzoneDisabledClass: [{ type: Input }],
    dndDragover: [{ type: Output }],
    dndDrop: [{ type: Output }],
    dndPlaceholderRef: [{ type: ContentChild, args: [DndPlaceholderRefDirective,] }],
    dndDisableIf: [{ type: Input }],
    dndDisableDropIf: [{ type: Input }],
    onDrop: [{ type: HostListener, args: ["drop", ["$event"],] }]
};
if (false) {
    /** @type {?} */
    DndDropzoneDirective.prototype.dndDropzone;
    /** @type {?} */
    DndDropzoneDirective.prototype.dndEffectAllowed;
    /** @type {?} */
    DndDropzoneDirective.prototype.dndAllowExternal;
    /** @type {?} */
    DndDropzoneDirective.prototype.dndHorizontal;
    /** @type {?} */
    DndDropzoneDirective.prototype.dndDragoverClass;
    /** @type {?} */
    DndDropzoneDirective.prototype.dndDropzoneDisabledClass;
    /** @type {?} */
    DndDropzoneDirective.prototype.dndDragover;
    /** @type {?} */
    DndDropzoneDirective.prototype.dndDrop;
    /**
     * @type {?}
     * @private
     */
    DndDropzoneDirective.prototype.dndPlaceholderRef;
    /**
     * @type {?}
     * @private
     */
    DndDropzoneDirective.prototype.placeholder;
    /**
     * @type {?}
     * @private
     */
    DndDropzoneDirective.prototype.disabled;
    /**
     * @type {?}
     * @private
     */
    DndDropzoneDirective.prototype.dragEnterEventHandler;
    /**
     * @type {?}
     * @private
     */
    DndDropzoneDirective.prototype.dragOverEventHandler;
    /**
     * @type {?}
     * @private
     */
    DndDropzoneDirective.prototype.dragLeaveEventHandler;
    /**
     * @type {?}
     * @private
     */
    DndDropzoneDirective.prototype.ngZone;
    /**
     * @type {?}
     * @private
     */
    DndDropzoneDirective.prototype.elementRef;
    /**
     * @type {?}
     * @private
     */
    DndDropzoneDirective.prototype.renderer;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG5kLWRyb3B6b25lLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL25neC1kcmFnLWRyb3AvIiwic291cmNlcyI6WyJkbmQtZHJvcHpvbmUuZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSxPQUFPLEVBRUwsWUFBWSxFQUNaLFNBQVMsRUFDVCxVQUFVLEVBQ1YsWUFBWSxFQUNaLFlBQVksRUFDWixLQUFLLEVBQ0wsTUFBTSxFQUVOLE1BQU0sRUFDTixTQUFTLEVBQ1YsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUdMLHFCQUFxQixFQUNyQixXQUFXLEVBQ1gsc0NBQXNDLEVBQ3ZDLE1BQU0sYUFBYSxDQUFDO0FBQ3JCLE9BQU8sRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFFLGNBQWMsRUFBRSxhQUFhLEVBQUUsTUFBTSxhQUFhLENBQUM7Ozs7QUFHdkYsa0NBT0M7OztJQU5DLDZCQUFnQjs7SUFDaEIsa0NBQXNCOztJQUN0QixrQ0FBbUI7O0lBQ25CLDRCQUFVOztJQUNWLDZCQUFjOztJQUNkLDRCQUFVOztBQU1aLE1BQU0sT0FBTywwQkFBMEI7Ozs7SUFFckMsWUFBNkIsVUFBcUI7UUFBckIsZUFBVSxHQUFWLFVBQVUsQ0FBVztJQUNsRCxDQUFDOzs7WUFORixTQUFTLFNBQUU7Z0JBQ1YsUUFBUSxFQUFFLHFCQUFxQjthQUNoQzs7OztZQTlCQyxVQUFVOzs7O0lBaUNHLGdEQUFxQzs7QUFPcEQsTUFBTSxPQUFPLG9CQUFvQjs7Ozs7O0lBeUQvQixZQUFxQixNQUFhLEVBQ2IsVUFBcUIsRUFDckIsUUFBa0I7UUFGbEIsV0FBTSxHQUFOLE1BQU0sQ0FBTztRQUNiLGVBQVUsR0FBVixVQUFVLENBQVc7UUFDckIsYUFBUSxHQUFSLFFBQVEsQ0FBVTtRQWxEdkMscUJBQWdCLEdBQVcsS0FBSyxDQUFDO1FBR2pDLGtCQUFhLEdBQVcsS0FBSyxDQUFDO1FBRzlCLHFCQUFnQixHQUFVLGFBQWEsQ0FBQztRQUd4Qyw2QkFB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QyxDQUFDOzs7WUE5VkYsU0FBUyxTQUFFO2dCQUNWLFFBQVEsRUFBRSxlQUFlO2FBQzFCOzs7O1lBbkNDLE1BQU07WUFKTixVQUFVO1lBT1YsU0FBUzs7OzBCQW1DUixLQUFLOytCQUdMLEtBQUs7K0JBR0wsS0FBSzs0QkFHTCxLQUFLOytCQUdMLEtBQUs7dUNBR0wsS0FBSzswQkFHTCxNQUFNO3NCQUdOLE1BQU07Z0NBR04sWUFBWSxTQUFFLDBCQUEwQjsyQkFXeEMsS0FBSzsrQkFlTCxLQUFLO3FCQW1HTCxZQUFZLFNBQUUsTUFBTSxFQUFFLENBQUUsUUFBUSxDQUFFOzs7O0lBckpuQywyQ0FDc0I7O0lBRXRCLGdEQUMrQjs7SUFFL0IsZ0RBQ2lDOztJQUVqQyw2Q0FDOEI7O0lBRTlCLGdEQUN3Qzs7SUFFeEMsd0RBQ2lEOztJQUVqRCwyQ0FDNkU7O0lBRTdFLHVDQUMrRTs7Ozs7SUFFL0UsaURBQytEOzs7OztJQUUvRCwyQ0FBMEM7Ozs7O0lBRTFDLHdDQUFpQzs7Ozs7SUFFakMscURBQXNIOzs7OztJQUN0SCxvREFBb0g7Ozs7O0lBQ3BILHFEQUFzSDs7Ozs7SUFzQnpHLHNDQUFxQjs7Ozs7SUFDckIsMENBQTZCOzs7OztJQUM3Qix3Q0FBMEIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xyXG4gIEFmdGVyVmlld0luaXQsXHJcbiAgQ29udGVudENoaWxkLFxyXG4gIERpcmVjdGl2ZSxcclxuICBFbGVtZW50UmVmLFxyXG4gIEV2ZW50RW1pdHRlcixcclxuICBIb3N0TGlzdGVuZXIsXHJcbiAgSW5wdXQsXHJcbiAgTmdab25lLFxyXG4gIE9uRGVzdHJveSxcclxuICBPdXRwdXQsXHJcbiAgUmVuZGVyZXIyXHJcbn0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcclxuaW1wb3J0IHtcclxuICBEbmRFdmVudCxcclxuICBEcmFnRHJvcERhdGEsXHJcbiAgZ2V0RGlyZWN0Q2hpbGRFbGVtZW50LFxyXG4gIGdldERyb3BEYXRhLFxyXG4gIHNob3VsZFBvc2l0aW9uUGxhY2Vob2xkZXJCZWZvcmVFbGVtZW50XHJcbn0gZnJvbSBcIi4vZG5kLXV0aWxzXCI7XHJcbmltcG9ydCB7IGdldERuZFR5cGUsIGdldERyb3BFZmZlY3QsIGlzRXh0ZXJuYWxEcmFnLCBzZXREcm9wRWZmZWN0IH0gZnJvbSBcIi4vZG5kLXN0YXRlXCI7XHJcbmltcG9ydCB7IERyb3BFZmZlY3QsIEVmZmVjdEFsbG93ZWQgfSBmcm9tIFwiLi9kbmQtdHlwZXNcIjtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRG5kRHJvcEV2ZW50IHtcclxuICBldmVudDpEcmFnRXZlbnQ7XHJcbiAgZHJvcEVmZmVjdDpEcm9wRWZmZWN0O1xyXG4gIGlzRXh0ZXJuYWw6Ym9vbGVhbjtcclxuICBkYXRhPzphbnk7XHJcbiAgaW5kZXg/Om51bWJlcjtcclxuICB0eXBlPzphbnk7XHJcbn1cclxuXHJcbkBEaXJlY3RpdmUoIHtcclxuICBzZWxlY3RvcjogXCJbZG5kUGxhY2Vob2xkZXJSZWZdXCJcclxufSApXHJcbmV4cG9ydCBjbGFzcyBEbmRQbGFjZWhvbGRlclJlZkRpcmVjdGl2ZSB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCBwdWJsaWMgcmVhZG9ubHkgZWxlbWVudFJlZjpFbGVtZW50UmVmICkge1xyXG4gIH1cclxufVxyXG5cclxuQERpcmVjdGl2ZSgge1xyXG4gIHNlbGVjdG9yOiBcIltkbmREcm9wem9uZV1cIlxyXG59IClcclxuZXhwb3J0IGNsYXNzIERuZERyb3B6b25lRGlyZWN0aXZlIGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCwgT25EZXN0cm95IHtcclxuXHJcbiAgQElucHV0KClcclxuICBkbmREcm9wem9uZT86c3RyaW5nW107XHJcblxyXG4gIEBJbnB1dCgpXHJcbiAgZG5kRWZmZWN0QWxsb3dlZDpFZmZlY3RBbGxvd2VkO1xyXG5cclxuICBASW5wdXQoKVxyXG4gIGRuZEFsbG93RXh0ZXJuYWw6Ym9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICBASW5wdXQoKVxyXG4gIGRuZEhvcml6b250YWw6Ym9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICBASW5wdXQoKVxyXG4gIGRuZERyYWdvdmVyQ2xhc3M6c3RyaW5nID0gXCJkbmREcmFnb3ZlclwiO1xyXG5cclxuICBASW5wdXQoKVxyXG4gIGRuZERyb3B6b25lRGlzYWJsZWRDbGFzcyA9IFwiZG5kRHJvcHpvbmVEaXNhYmxlZFwiO1xyXG5cclxuICBAT3V0cHV0KClcclxuICByZWFkb25seSBkbmREcmFnb3ZlcjpFdmVudEVtaXR0ZXI8RHJhZ0V2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8RHJhZ0V2ZW50PigpO1xyXG5cclxuICBAT3V0cHV0KClcclxuICByZWFkb25seSBkbmREcm9wOkV2ZW50RW1pdHRlcjxEbmREcm9wRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxEbmREcm9wRXZlbnQ+KCk7XHJcblxyXG4gIEBDb250ZW50Q2hpbGQoIERuZFBsYWNlaG9sZGVyUmVmRGlyZWN0aXZlIClcclxuICBwcml2YXRlIHJlYWRvbmx5IGRuZFBsYWNlaG9sZGVyUmVmPzpEbmRQbGFjZWhvbGRlclJlZkRpcmVjdGl2ZTtcclxuXHJcbiAgcHJpdmF0ZSBwbGFjZWhvbGRlcjpFbGVtZW50IHwgbnVsbCA9IG51bGw7XHJcblxyXG4gIHByaXZhdGUgZGlzYWJsZWQ6Ym9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICBwcml2YXRlIHJlYWRvbmx5IGRyYWdFbnRlckV2ZW50SGFuZGxlcjooIGV2ZW50OkRyYWdFdmVudCApID0+IHZvaWQgPSAoIGV2ZW50OkRyYWdFdmVudCApID0+IHRoaXMub25EcmFnRW50ZXIoIGV2ZW50ICk7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBkcmFnT3ZlckV2ZW50SGFuZGxlcjooIGV2ZW50OkRyYWdFdmVudCApID0+IHZvaWQgPSAoIGV2ZW50OkRyYWdFdmVudCApID0+IHRoaXMub25EcmFnT3ZlciggZXZlbnQgKTtcclxuICBwcml2YXRlIHJlYWRvbmx5IGRyYWdMZWF2ZUV2ZW50SGFuZGxlcjooIGV2ZW50OkRyYWdFdmVudCApID0+IHZvaWQgPSAoIGV2ZW50OkRyYWdFdmVudCApID0+IHRoaXMub25EcmFnTGVhdmUoIGV2ZW50ICk7XHJcblxyXG4gIEBJbnB1dCgpXHJcbiAgc2V0IGRuZERpc2FibGVJZiggdmFsdWU6Ym9vbGVhbiApIHtcclxuXHJcbiAgICB0aGlzLmRpc2FibGVkID0gISF2YWx1ZTtcclxuXHJcbiAgICBpZiggdGhpcy5kaXNhYmxlZCApIHtcclxuXHJcbiAgICAgIHRoaXMucmVuZGVyZXIuYWRkQ2xhc3MoIHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LCB0aGlzLmRuZERyb3B6b25lRGlzYWJsZWRDbGFzcyApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcblxyXG4gICAgICB0aGlzLnJlbmRlcmVyLnJlbW92ZUNsYXNzKCB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCwgdGhpcy5kbmREcm9wem9uZURpc2FibGVkQ2xhc3MgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIEBJbnB1dCgpXHJcbiAgc2V0IGRuZERpc2FibGVEcm9wSWYoIHZhbHVlOmJvb2xlYW4gKSB7XHJcbiAgICB0aGlzLmRuZERpc2FibGVJZiA9IHZhbHVlO1xyXG4gIH1cclxuXHJcbiAgY29uc3RydWN0b3IoIHByaXZhdGUgbmdab25lOk5nWm9uZSxcclxuICAgICAgICAgICAgICAgcHJpdmF0ZSBlbGVtZW50UmVmOkVsZW1lbnRSZWYsXHJcbiAgICAgICAgICAgICAgIHByaXZhdGUgcmVuZGVyZXI6UmVuZGVyZXIyICkge1xyXG4gIH1cclxuXHJcbiAgbmdBZnRlclZpZXdJbml0KCk6dm9pZCB7XHJcblxyXG4gICAgdGhpcy5wbGFjZWhvbGRlciA9IHRoaXMudHJ5R2V0UGxhY2Vob2xkZXIoKTtcclxuXHJcbiAgICB0aGlzLnJlbW92ZVBsYWNlaG9sZGVyRnJvbURPTSgpO1xyXG5cclxuICAgIHRoaXMubmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCAoKSA9PiB7XHJcbiAgICAgIHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoIFwiZHJhZ2VudGVyXCIsIHRoaXMuZHJhZ0VudGVyRXZlbnRIYW5kbGVyICk7XHJcbiAgICAgIHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoIFwiZHJhZ292ZXJcIiwgdGhpcy5kcmFnT3ZlckV2ZW50SGFuZGxlciApO1xyXG4gICAgICB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCBcImRyYWdsZWF2ZVwiLCB0aGlzLmRyYWdMZWF2ZUV2ZW50SGFuZGxlciApO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgbmdPbkRlc3Ryb3koKTp2b2lkIHtcclxuICAgIHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoIFwiZHJhZ2VudGVyXCIsIHRoaXMuZHJhZ0VudGVyRXZlbnRIYW5kbGVyICk7XHJcbiAgICB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCBcImRyYWdvdmVyXCIsIHRoaXMuZHJhZ092ZXJFdmVudEhhbmRsZXIgKTtcclxuICAgIHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoIFwiZHJhZ2xlYXZlXCIsIHRoaXMuZHJhZ0xlYXZlRXZlbnRIYW5kbGVyICk7XHJcbiAgfVxyXG5cclxuICBvbkRyYWdFbnRlciggZXZlbnQ6RG5kRXZlbnQgKSB7XHJcblxyXG4gICAgLy8gY2hlY2sgaWYgYW5vdGhlciBkcm9wem9uZSBpcyBhY3RpdmF0ZWRcclxuICAgIGlmKCBldmVudC5fZG5kRHJvcHpvbmVBY3RpdmUgPT09IHRydWUgKSB7XHJcblxyXG4gICAgICB0aGlzLmNsZWFudXBEcmFnb3ZlclN0YXRlKCk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBzZXQgYXMgYWN0aXZlIGlmIHRoZSB0YXJnZXQgZWxlbWVudCBpcyBpbnNpZGUgdGhpcyBkcm9wem9uZVxyXG4gICAgaWYoIHR5cGVvZiBldmVudC5fZG5kRHJvcHpvbmVBY3RpdmUgPT09IFwidW5kZWZpbmVkXCIgKSB7XHJcblxyXG4gICAgICBjb25zdCBuZXdUYXJnZXQgPSBkb2N1bWVudC5lbGVtZW50RnJvbVBvaW50KCBldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZICk7XHJcblxyXG4gICAgICBpZiggdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuY29udGFpbnMoIG5ld1RhcmdldCApICkge1xyXG5cclxuICAgICAgICBldmVudC5fZG5kRHJvcHpvbmVBY3RpdmUgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gY2hlY2sgaWYgdGhpcyBkcmFnIGV2ZW50IGlzIGFsbG93ZWQgdG8gZHJvcCBvbiB0aGlzIGRyb3B6b25lXHJcbiAgICBjb25zdCB0eXBlID0gZ2V0RG5kVHlwZSggZXZlbnQgKTtcclxuICAgIGlmKCB0aGlzLmlzRHJvcEFsbG93ZWQoIHR5cGUgKSA9PT0gZmFsc2UgKSB7XHJcblxyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gYWxsb3cgdGhlIGRyYWdlbnRlclxyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICB9XHJcblxyXG4gIG9uRHJhZ092ZXIoIGV2ZW50OkRyYWdFdmVudCApIHtcclxuICAgIC8vIFdpdGggbmVzdGVkIGRyb3B6b25lcywgd2Ugd2FudCB0byBpZ25vcmUgdGhpcyBldmVudCBpZiBhIGNoaWxkIGRyb3B6b25lXHJcbiAgICAvLyBoYXMgYWxyZWFkeSBoYW5kbGVkIGEgZHJhZ292ZXIuICBIaXN0b3JpY2FsbHksIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpIHdhc1xyXG4gICAgLy8gdXNlZCB0byBwcmV2ZW50IHRoaXMgYnViYmxpbmcsIGJ1dCB0aGF0IHByZXZlbnRzIGFueSBkcmFnb3ZlcnMgb3V0c2lkZSB0aGVcclxuICAgIC8vIG5neC1kcmFnLWRyb3AgY29tcG9uZW50LCBhbmQgc3RvcHMgb3RoZXIgdXNlIGNhc2VzIHN1Y2ggYXMgc2Nyb2xsaW5nIG9uIGRyYWcuXHJcbiAgICAvLyBJbnN0ZWFkLCB3ZSBjYW4gY2hlY2sgaWYgdGhlIGV2ZW50IHdhcyBhbHJlYWR5IHByZXZlbnRlZCBieSBhIGNoaWxkIGFuZCBiYWlsIGVhcmx5LlxyXG4gICAgaWYoIGV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQgKSB7XHJcblxyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gY2hlY2sgaWYgdGhpcyBkcmFnIGV2ZW50IGlzIGFsbG93ZWQgdG8gZHJvcCBvbiB0aGlzIGRyb3B6b25lXHJcbiAgICBjb25zdCB0eXBlID0gZ2V0RG5kVHlwZSggZXZlbnQgKTtcclxuICAgIGlmKCB0aGlzLmlzRHJvcEFsbG93ZWQoIHR5cGUgKSA9PT0gZmFsc2UgKSB7XHJcblxyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5jaGVja0FuZFVwZGF0ZVBsYWNlaG9sZGVyUG9zaXRpb24oIGV2ZW50ICk7XHJcblxyXG4gICAgY29uc3QgZHJvcEVmZmVjdCA9IGdldERyb3BFZmZlY3QoIGV2ZW50LCB0aGlzLmRuZEVmZmVjdEFsbG93ZWQgKTtcclxuXHJcbiAgICBpZiggZHJvcEVmZmVjdCA9PT0gXCJub25lXCIgKSB7XHJcblxyXG4gICAgICB0aGlzLmNsZWFudXBEcmFnb3ZlclN0YXRlKCk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBhbGxvdyB0aGUgZHJhZ292ZXJcclxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgLy8gc2V0IHRoZSBkcm9wIGVmZmVjdFxyXG4gICAgc2V0RHJvcEVmZmVjdCggZXZlbnQsIGRyb3BFZmZlY3QgKTtcclxuXHJcbiAgICB0aGlzLmRuZERyYWdvdmVyLmVtaXQoIGV2ZW50ICk7XHJcblxyXG4gICAgdGhpcy5yZW5kZXJlci5hZGRDbGFzcyggdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQsIHRoaXMuZG5kRHJhZ292ZXJDbGFzcyApO1xyXG4gIH1cclxuXHJcbiAgQEhvc3RMaXN0ZW5lciggXCJkcm9wXCIsIFsgXCIkZXZlbnRcIiBdIClcclxuICBvbkRyb3AoIGV2ZW50OkRyYWdFdmVudCApIHtcclxuXHJcbiAgICB0cnkge1xyXG5cclxuICAgICAgLy8gY2hlY2sgaWYgdGhpcyBkcmFnIGV2ZW50IGlzIGFsbG93ZWQgdG8gZHJvcCBvbiB0aGlzIGRyb3B6b25lXHJcbiAgICAgIGNvbnN0IHR5cGUgPSBnZXREbmRUeXBlKCBldmVudCApO1xyXG4gICAgICBpZiggdGhpcy5pc0Ryb3BBbGxvd2VkKCB0eXBlICkgPT09IGZhbHNlICkge1xyXG5cclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IGRhdGE6RHJhZ0Ryb3BEYXRhID0gZ2V0RHJvcERhdGEoIGV2ZW50LCBpc0V4dGVybmFsRHJhZygpICk7XHJcblxyXG4gICAgICBpZiggdGhpcy5pc0Ryb3BBbGxvd2VkKCBkYXRhLnR5cGUgKSA9PT0gZmFsc2UgKSB7XHJcblxyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gc2lnbmFsIGN1c3RvbSBkcm9wIGhhbmRsaW5nXHJcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgICBjb25zdCBkcm9wRWZmZWN0ID0gZ2V0RHJvcEVmZmVjdCggZXZlbnQgKTtcclxuXHJcbiAgICAgIHNldERyb3BFZmZlY3QoIGV2ZW50LCBkcm9wRWZmZWN0ICk7XHJcblxyXG4gICAgICBpZiggZHJvcEVmZmVjdCA9PT0gXCJub25lXCIgKSB7XHJcblxyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgZHJvcEluZGV4ID0gdGhpcy5nZXRQbGFjZWhvbGRlckluZGV4KCk7XHJcblxyXG4gICAgICAvLyBpZiBmb3Igd2hhdGV2ZXIgcmVhc29uIHRoZSBwbGFjZWhvbGRlciBpcyBub3QgcHJlc2VudCBpbiB0aGUgRE9NIGJ1dCBpdCBzaG91bGQgYmUgdGhlcmVcclxuICAgICAgLy8gd2UgZG9uJ3QgYWxsb3cvZW1pdCB0aGUgZHJvcCBldmVudCBzaW5jZSBpdCBicmVha3MgdGhlIGNvbnRyYWN0XHJcbiAgICAgIC8vIHNlZW1zIHRvIG9ubHkgaGFwcGVuIGlmIGRyYWcgYW5kIGRyb3AgaXMgZXhlY3V0ZWQgZmFzdGVyIHRoYW4gdGhlIERPTSB1cGRhdGVzXHJcbiAgICAgIGlmKCBkcm9wSW5kZXggPT09IC0xICkge1xyXG5cclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuZG5kRHJvcC5lbWl0KCB7XHJcbiAgICAgICAgZXZlbnQ6IGV2ZW50LFxyXG4gICAgICAgIGRyb3BFZmZlY3Q6IGRyb3BFZmZlY3QsXHJcbiAgICAgICAgaXNFeHRlcm5hbDogaXNFeHRlcm5hbERyYWcoKSxcclxuICAgICAgICBkYXRhOiBkYXRhLmRhdGEsXHJcbiAgICAgICAgaW5kZXg6IGRyb3BJbmRleCxcclxuICAgICAgICB0eXBlOiB0eXBlLFxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuXHJcbiAgICB9XHJcbiAgICBmaW5hbGx5IHtcclxuXHJcbiAgICAgIHRoaXMuY2xlYW51cERyYWdvdmVyU3RhdGUoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIG9uRHJhZ0xlYXZlKCBldmVudDpEbmRFdmVudCApIHtcclxuXHJcbiAgICAvLyBjaGVjayBpZiBzdGlsbCBpbnNpZGUgdGhpcyBkcm9wem9uZSBhbmQgbm90IHlldCBoYW5kbGVkIGJ5IGFub3RoZXIgZHJvcHpvbmVcclxuICAgIGlmKCB0eXBlb2YgZXZlbnQuX2RuZERyb3B6b25lQWN0aXZlID09PSBcInVuZGVmaW5lZFwiICkge1xyXG5cclxuICAgICAgY29uc3QgbmV3VGFyZ2V0ID0gZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludCggZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSApO1xyXG5cclxuICAgICAgaWYoIHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmNvbnRhaW5zKCBuZXdUYXJnZXQgKSApIHtcclxuXHJcbiAgICAgICAgZXZlbnQuX2RuZERyb3B6b25lQWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmNsZWFudXBEcmFnb3ZlclN0YXRlKCk7XHJcblxyXG4gICAgLy8gY2xlYW51cCBkcm9wIGVmZmVjdCB3aGVuIGxlYXZpbmcgZHJvcHpvbmVcclxuICAgIHNldERyb3BFZmZlY3QoIGV2ZW50LCBcIm5vbmVcIiApO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBpc0Ryb3BBbGxvd2VkKCB0eXBlPzpzdHJpbmcgKTpib29sZWFuIHtcclxuXHJcbiAgICAvLyBkcm9wem9uZSBpcyBkaXNhYmxlZCAtPiBkZW55IGl0XHJcbiAgICBpZiggdGhpcy5kaXNhYmxlZCA9PT0gdHJ1ZSApIHtcclxuXHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBpZiBkcmFnIGRpZCBub3Qgc3RhcnQgZnJvbSBvdXIgZGlyZWN0aXZlXHJcbiAgICAvLyBhbmQgZXh0ZXJuYWwgZHJhZyBzb3VyY2VzIGFyZSBub3QgYWxsb3dlZCAtPiBkZW55IGl0XHJcbiAgICBpZiggaXNFeHRlcm5hbERyYWcoKSA9PT0gdHJ1ZVxyXG4gICAgICAmJiB0aGlzLmRuZEFsbG93RXh0ZXJuYWwgPT09IGZhbHNlICkge1xyXG5cclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIG5vIGZpbHRlcmluZyBieSB0eXBlcyAtPiBhbGxvdyBpdFxyXG4gICAgaWYoICF0aGlzLmRuZERyb3B6b25lICkge1xyXG5cclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gbm8gdHlwZSBzZXQgLT4gYWxsb3cgaXRcclxuICAgIGlmKCAhdHlwZSApIHtcclxuXHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmKCBBcnJheS5pc0FycmF5KCB0aGlzLmRuZERyb3B6b25lICkgPT09IGZhbHNlICkge1xyXG5cclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCBcImRuZERyb3B6b25lOiBib3VuZCB2YWx1ZSB0byBbZG5kRHJvcHpvbmVdIG11c3QgYmUgYW4gYXJyYXkhXCIgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBpZiBkcm9wem9uZSBjb250YWlucyB0eXBlIC0+IGFsbG93IGl0XHJcbiAgICByZXR1cm4gdGhpcy5kbmREcm9wem9uZS5pbmRleE9mKCB0eXBlICkgIT09IC0xO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSB0cnlHZXRQbGFjZWhvbGRlcigpOkVsZW1lbnQgfCBudWxsIHtcclxuXHJcbiAgICBpZiggdHlwZW9mIHRoaXMuZG5kUGxhY2Vob2xkZXJSZWYgIT09IFwidW5kZWZpbmVkXCIgKSB7XHJcblxyXG4gICAgICByZXR1cm4gdGhpcy5kbmRQbGFjZWhvbGRlclJlZi5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQgYXMgRWxlbWVudDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBUT0RPIG5hc3R5IHdvcmthcm91bmQgbmVlZGVkIGJlY2F1c2UgaWYgbmctY29udGFpbmVyIC8gdGVtcGxhdGUgaXMgdXNlZCBAQ29udGVudENoaWxkKCkgb3IgREkgd2lsbCBmYWlsIGJlY2F1c2VcclxuICAgIC8vIG9mIHdyb25nIGNvbnRleHQgc2VlIGFuZ3VsYXIgYnVnIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvaXNzdWVzLzEzNTE3XHJcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQucXVlcnlTZWxlY3RvciggXCJbZG5kUGxhY2Vob2xkZXJSZWZdXCIgKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgcmVtb3ZlUGxhY2Vob2xkZXJGcm9tRE9NKCkge1xyXG5cclxuICAgIGlmKCB0aGlzLnBsYWNlaG9sZGVyICE9PSBudWxsXHJcbiAgICAgICYmIHRoaXMucGxhY2Vob2xkZXIucGFyZW50Tm9kZSAhPT0gbnVsbCApIHtcclxuICAgICAgdGhpcy5wbGFjZWhvbGRlci5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKCB0aGlzLnBsYWNlaG9sZGVyICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGNoZWNrQW5kVXBkYXRlUGxhY2Vob2xkZXJQb3NpdGlvbiggZXZlbnQ6RHJhZ0V2ZW50ICk6dm9pZCB7XHJcblxyXG4gICAgaWYoIHRoaXMucGxhY2Vob2xkZXIgPT09IG51bGwgKSB7XHJcblxyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gbWFrZSBzdXJlIHRoZSBwbGFjZWhvbGRlciBpcyBpbiB0aGUgRE9NXHJcbiAgICBpZiggdGhpcy5wbGFjZWhvbGRlci5wYXJlbnROb2RlICE9PSB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCApIHtcclxuXHJcbiAgICAgIHRoaXMucmVuZGVyZXIuYXBwZW5kQ2hpbGQoIHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LCB0aGlzLnBsYWNlaG9sZGVyICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gdXBkYXRlIHRoZSBwb3NpdGlvbiBpZiB0aGUgZXZlbnQgb3JpZ2luYXRlcyBmcm9tIGEgY2hpbGQgZWxlbWVudCBvZiB0aGUgZHJvcHpvbmVcclxuICAgIGNvbnN0IGRpcmVjdENoaWxkID0gZ2V0RGlyZWN0Q2hpbGRFbGVtZW50KCB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCwgZXZlbnQudGFyZ2V0IGFzIEVsZW1lbnQgKTtcclxuXHJcbiAgICAvLyBlYXJseSBleGl0IGlmIG5vIGRpcmVjdCBjaGlsZCBvciBkaXJlY3QgY2hpbGQgaXMgcGxhY2Vob2xkZXJcclxuICAgIGlmKCBkaXJlY3RDaGlsZCA9PT0gbnVsbFxyXG4gICAgICB8fCBkaXJlY3RDaGlsZCA9PT0gdGhpcy5wbGFjZWhvbGRlciApIHtcclxuXHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBwb3NpdGlvblBsYWNlaG9sZGVyQmVmb3JlRGlyZWN0Q2hpbGQgPSBzaG91bGRQb3NpdGlvblBsYWNlaG9sZGVyQmVmb3JlRWxlbWVudCggZXZlbnQsIGRpcmVjdENoaWxkLCB0aGlzLmRuZEhvcml6b250YWwgKTtcclxuXHJcbiAgICBpZiggcG9zaXRpb25QbGFjZWhvbGRlckJlZm9yZURpcmVjdENoaWxkICkge1xyXG5cclxuICAgICAgLy8gZG8gaW5zZXJ0IGJlZm9yZSBvbmx5IGlmIG5lY2Vzc2FyeVxyXG4gICAgICBpZiggZGlyZWN0Q2hpbGQucHJldmlvdXNTaWJsaW5nICE9PSB0aGlzLnBsYWNlaG9sZGVyICkge1xyXG5cclxuICAgICAgICB0aGlzLnJlbmRlcmVyLmluc2VydEJlZm9yZSggdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQsIHRoaXMucGxhY2Vob2xkZXIsIGRpcmVjdENoaWxkICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG5cclxuICAgICAgLy8gZG8gaW5zZXJ0IGFmdGVyIG9ubHkgaWYgbmVjZXNzYXJ5XHJcbiAgICAgIGlmKCBkaXJlY3RDaGlsZC5uZXh0U2libGluZyAhPT0gdGhpcy5wbGFjZWhvbGRlciApIHtcclxuXHJcbiAgICAgICAgdGhpcy5yZW5kZXJlci5pbnNlcnRCZWZvcmUoIHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LCB0aGlzLnBsYWNlaG9sZGVyLCBkaXJlY3RDaGlsZC5uZXh0U2libGluZyApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldFBsYWNlaG9sZGVySW5kZXgoKTpudW1iZXIgfCB1bmRlZmluZWQge1xyXG5cclxuICAgIGlmKCB0aGlzLnBsYWNlaG9sZGVyID09PSBudWxsICkge1xyXG5cclxuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQgYXMgSFRNTEVsZW1lbnQ7XHJcblxyXG4gICAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5pbmRleE9mLmNhbGwoIGVsZW1lbnQuY2hpbGRyZW4sIHRoaXMucGxhY2Vob2xkZXIgKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgY2xlYW51cERyYWdvdmVyU3RhdGUoKSB7XHJcblxyXG4gICAgdGhpcy5yZW5kZXJlci5yZW1vdmVDbGFzcyggdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQsIHRoaXMuZG5kRHJhZ292ZXJDbGFzcyApO1xyXG5cclxuICAgIHRoaXMucmVtb3ZlUGxhY2Vob2xkZXJGcm9tRE9NKCk7XHJcbiAgfVxyXG59XHJcbiJdfQ==