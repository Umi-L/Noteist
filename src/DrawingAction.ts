import {Action} from "./Action";

export class DrawingAction extends Action{
    element: SVGElement;
    drawArea: SVGElement;
    isRemoving: boolean;

    constructor(element: SVGElement, drawArea: SVGElement, isRemoving: boolean){
        super();
        this.element = element;
        this.drawArea = drawArea;
        this.isRemoving = isRemoving;
    }

    undo(){
        if(this.isRemoving){
            this.drawArea.appendChild(this.element);
        }else{
            this.element.remove();
        }
    }

    redo(){
        if(this.isRemoving){
            this.element.remove();
        }else{
            this.drawArea.appendChild(this.element);
        }
    }
}