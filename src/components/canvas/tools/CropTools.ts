import { fabric } from 'fabric';

import Tools, { ITools } from './Tools';

export interface ICropTools extends ITools {
    cropObject?: fabric.Object;
    cropRect?: fabric.Rect;
    validType(): boolean;
    start(): void;
    finish(): void;
    cancel(): void;
    resize(opt: fabric.IEvent): void;
    moving(opt: fabric.IEvent): void;
}

class CropTools extends Tools implements ICropTools {
    cropObject: fabric.Object;
    cropRect: fabric.Rect;

    validType() {
        const activeObject = this.canvas.getActiveObject();
        if (!activeObject) {
            return true;
        }
        if (activeObject.type === 'image') {
            return false;
        }
        return true;
    }

    start() {
        if (this.validType()) {
            return;
        }
        this.canvas.interactionMode = 'crop';
        this.cropObject = this.canvas.getActiveObject();
        const { left, top } = this.cropObject;
        this.cropRect = new fabric.Rect({
            width: this.cropObject.width,
            height: this.cropObject.height,
            scaleX: this.cropObject.scaleX,
            scaleY: this.cropObject.scaleY,
            originX: 'left',
            originY: 'top',
            left,
            top,
            hasRotatingPoint: false,
            fill: 'rgba(0, 0, 0, 0.2)',
        });
        this.canvas.add(this.cropRect);
        this.canvas.setActiveObject(this.cropRect);
        this.cropObject.selectable = false;
        this.cropObject.evented = false;
        this.canvas.renderAll();
    }

    finish() {
        const { left, top, width, height, scaleX, scaleY } = this.cropRect;
        const croppedImg = this.cropObject.toDataURL({
            left: left - this.cropObject.left,
            top: top - this.cropObject.top,
            width: width * scaleX,
            height: height * scaleY,
        });
        this.canvas.generalTools.setImage(this.cropObject, croppedImg);
        this.cancel();
    }

    cancel() {
        this.canvas.interactionMode = 'selection';
        this.cropObject.selectable = true;
        this.cropObject.evented = true;
        this.canvas.setActiveObject(this.cropObject);
        this.canvas.remove(this.cropRect);
        this.cropRect = null;
        this.cropObject = null;
        this.canvas.renderAll();
    }

    resize(opt: fabric.IEvent) {
        const { target, transform: { original, corner } } = opt;
        const { left, top, width, height, scaleX, scaleY } = target;
        const {
            left: cropLeft,
            top: cropTop,
            width: cropWidth,
            height: cropHeight,
            scaleX: cropScaleX,
            scaleY: cropScaleY,
        } = this.cropObject;
        if (corner === 'tl') {
            if (Math.round(cropLeft) > Math.round(left)) { // left
                const originRight = Math.round(cropLeft + cropWidth);
                const targetRight = Math.round(target.getBoundingRect().left + target.getBoundingRect().width);
                const diffRightRatio = 1 - ((originRight - targetRight) / cropWidth);
                target.set({
                    left: cropLeft,
                    scaleX: diffRightRatio > 1 ? 1 : diffRightRatio,
                });
            }
            if (Math.round(cropTop) > Math.round(top)) { // top
                const originBottom = Math.round(cropTop + cropHeight);
                const targetBottom = Math.round(target.getBoundingRect().top + target.getBoundingRect().height);
                const diffBottomRatio = 1 - ((originBottom - targetBottom) / cropHeight);
                target.set({
                    top: cropTop,
                    scaleY: diffBottomRatio > 1 ? 1 : diffBottomRatio,
                });
            }
        } else if (corner === 'bl') {
            if (Math.round(cropLeft) > Math.round(left)) { // left
                const originRight = Math.round(cropLeft + cropWidth);
                const targetRight = Math.round(target.getBoundingRect().left + target.getBoundingRect().width);
                const diffRightRatio = 1 - ((originRight - targetRight) / cropWidth);
                target.set({
                    left: cropLeft,
                    scaleX: diffRightRatio > 1 ? 1 : diffRightRatio,
                });
            }
            if (Math.round(cropTop + (cropHeight * cropScaleY) < Math.round(top + (height * scaleY)))) { // bottom
                const diffTopRatio = 1 - ((original.top - cropTop) / cropHeight);
                target.set({
                    top: original.top,
                    scaleY: diffTopRatio > 1 ? 1 : diffTopRatio,
                });
            }
        } else if (corner === 'tr') {
            if (Math.round(cropLeft + (cropWidth * cropScaleX)) < Math.round(left + (width * scaleX))) { // right
                const diffLeftRatio = 1 - ((original.left - cropLeft) / cropWidth);
                target.set({
                    left: original.left,
                    scaleX: diffLeftRatio > 1 ? 1 : diffLeftRatio,
                });
            }
            if (Math.round(cropTop) > Math.round(top)) { // top
                const originBottom = Math.round(cropTop + cropHeight);
                const targetBottom = Math.round(target.getBoundingRect().top + target.getBoundingRect().height);
                const diffBottomRatio = 1 - ((originBottom - targetBottom) / cropHeight);
                target.set({
                    top: cropTop,
                    scaleY: diffBottomRatio > 1 ? 1 : diffBottomRatio,
                });
            }
        } else if (corner === 'br') {
            if (Math.round(cropLeft + (cropWidth * cropScaleX)) < Math.round(left + (width * scaleX))) { // right
                const diffLeftRatio = 1 - ((original.left - cropLeft) / cropWidth);
                target.set({
                    left: original.left,
                    scaleX: diffLeftRatio > 1 ? 1 : diffLeftRatio,
                });
            }
            if (Math.round(cropTop + (cropHeight * cropScaleY) < Math.round(top + (height * scaleY)))) { // bottom
                const diffTopRatio = 1 - ((original.top - cropTop) / cropHeight);
                target.set({
                    top: original.top,
                    scaleY: diffTopRatio > 1 ? 1 : diffTopRatio,
                });
            }
        } else if (corner === 'ml') {
            if (Math.round(cropLeft) > Math.round(left)) { // left
                const originRight = Math.round(cropLeft + cropWidth);
                const targetRight = Math.round(target.getBoundingRect().left + target.getBoundingRect().width);
                const diffRightRatio = 1 - ((originRight - targetRight) / cropWidth);
                target.set({
                    left: cropLeft,
                    scaleX: diffRightRatio > 1 ? 1 : diffRightRatio,
                });
            }
        } else if (corner === 'mt') {
            if (Math.round(cropTop) > Math.round(top)) { // top
                const originBottom = Math.round(cropTop + cropHeight);
                const targetBottom = Math.round(target.getBoundingRect().top + target.getBoundingRect().height);
                const diffBottomRatio = 1 - ((originBottom - targetBottom) / cropHeight);
                target.set({
                    top: cropTop,
                    scaleY: diffBottomRatio > 1 ? 1 : diffBottomRatio,
                });
            }
        } else if (corner === 'mb') {
            if (Math.round(cropTop + (cropHeight * cropScaleY) < Math.round(top + (height * scaleY)))) { // bottom
                const diffTopRatio = 1 - ((original.top - cropTop) / cropHeight);
                target.set({
                    top: original.top,
                    scaleY: diffTopRatio > 1 ? 1 : diffTopRatio,
                });
            }
        } else if (corner === 'mr') {
            if (Math.round(cropLeft + (cropWidth * cropScaleX)) < Math.round(left + (width * scaleX))) { // right
                const diffLeftRatio = 1 - ((original.left - cropLeft) / cropWidth);
                target.set({
                    left: original.left,
                    scaleX: diffLeftRatio > 1 ? 1 : diffLeftRatio,
                });
            }
        }
    }

    moving(opt: fabric.IEvent) {
        const { target } = opt;
        const { left, top, width, height, scaleX, scaleY } = target;
        const {
            left: cropLeft,
            top: cropTop,
            width: cropWidth,
            height: cropHeight,
        } = this.cropObject.getBoundingRect();
        const movedTop = () => {
            if (Math.round(cropTop) >= Math.round(top)) {
                target.set({
                    top: cropTop,
                });
            } else if (Math.round(cropTop + cropHeight) <= Math.round(top + (height * scaleY))) {
                target.set({
                    top: cropTop + cropHeight - (height * scaleY),
                });
            }
        };
        if (Math.round(cropLeft) >= Math.round(left)) {
            target.set({
                left: Math.max(left, cropLeft),
            });
            movedTop();
        } else if (Math.round(cropLeft + cropWidth) <= Math.round(left + (width * scaleX))) {
            target.set({
                left: cropLeft + cropWidth - (width * scaleX),
            });
            movedTop();
        } else if (Math.round(cropTop) >= Math.round(top)) {
            target.set({
                top: cropTop,
            });
        } else if (Math.round(cropTop + cropHeight) <= Math.round(top + (height * scaleY))) {
            target.set({
                top: cropTop + cropHeight - (height * scaleY),
            });
        }
    }
}

export default CropTools;
