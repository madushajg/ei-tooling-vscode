import {
	DragCanvasState,
	SelectingState,
	State
} from '@projectstorm/react-canvas-core';
import { DiagramEngine, DragDiagramItemsState } from '@projectstorm/react-diagrams-core';


export class DefaultState extends State<DiagramEngine> {
	dragCanvas: DragCanvasState;
	dragItems: DragDiagramItemsState;

	constructor() {
		super({ name: 'starting-state' });
		this.childStates = [new SelectingState()];
		this.dragCanvas = new DragCanvasState();
		this.dragItems = new DragDiagramItemsState();
	}
}
