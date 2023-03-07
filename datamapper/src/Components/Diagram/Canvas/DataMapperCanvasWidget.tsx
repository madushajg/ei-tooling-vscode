// tslint:disable: jsx-no-lambda jsx-no-multiline-js no-unused-expression
import * as React from 'react';

import styled from '@emotion/styled';
import { CanvasEngine, CanvasEngineListener, ListenerHandle, SmartLayerWidget, TransformLayerWidget } from '@projectstorm/react-canvas-core'

export interface DiagramProps {
	engine: CanvasEngine;
	className?: string;
}

export const Canvas = styled.div`
	position: relative;
	cursor: move;
	overflow: hidden;
	& > svg {
		overflow: visible;
	}
`;

export const DMCanvasContainerID = "data-mapper-canvas-container";

export class DataMapperCanvasWidget extends React.Component<DiagramProps> {
	ref: React.RefObject<HTMLDivElement>;
	keyUp: ((this: Document, event: KeyboardEvent) => void) | undefined;
	keyDown: ((this: Document, event: KeyboardEvent) => void) | undefined;
	canvasListener: CanvasEngineListener | ListenerHandle | undefined;

	constructor(props: DiagramProps) {
		super(props);

		this.ref = React.createRef();
		this.state = {
			action: null,
			diagramEngineListener: null
		};
	}

	componentWillUnmount() {
		if (this.canvasListener && this.keyUp && this.keyDown) {
			this.props.engine.deregisterListener(this.canvasListener);
			this.props.engine.setCanvas(undefined);

			document.removeEventListener('keyup', this.keyUp);
			document.removeEventListener('keydown', this.keyDown);
		}
	}

	registerCanvas() {
		this.props.engine.setCanvas(this.ref.current ? this.ref.current : undefined);
		this.props.engine.iterateListeners((list) => {
			list.rendered && list.rendered();
		});
	}

	componentDidUpdate() {
		this.registerCanvas();
	}

	componentDidMount() {
		this.canvasListener = this.props.engine.registerListener({
			repaintCanvas: () => {
				this.forceUpdate();
			}
		});

		this.keyDown = (event: KeyboardEvent) => {
			this.props.engine.getActionEventBus().fireAction({ event: event as any });
		};
		this.keyUp = (event: KeyboardEvent) => {
			this.props.engine.getActionEventBus().fireAction({ event: event as any });
		};

		document.addEventListener('keyup', this.keyUp);
		document.addEventListener('keydown', this.keyDown);
		this.registerCanvas();
	}

	render() {
		const engine = this.props.engine;
		const model = engine.getModel();
  		const layers = model.getLayers();
  		const svgLayers = layers.filter((layer) => layer.getOptions().isSvg);
  		const nonSVGLayers = layers.filter((layer) => !layer.getOptions().isSvg);
  		const reArrangedLayers = [...nonSVGLayers, ...svgLayers];

		return (
			<Canvas
				id={DMCanvasContainerID}
				className={this.props.className}
				ref={this.ref}
				onWheel={(event) => {
					this.props.engine.getActionEventBus().fireAction({ event });
				}}
				onMouseDown={(event) => {
					this.props.engine.getActionEventBus().fireAction({ event });
				}}
				onMouseUp={(event) => {
					this.props.engine.getActionEventBus().fireAction({ event });
				}}
				onMouseMove={(event) => {
					this.props.engine.getActionEventBus().fireAction({ event });
				}}
				onTouchStart={(event) => {
					this.props.engine.getActionEventBus().fireAction({ event });
				}}
				onTouchEnd={(event) => {
					this.props.engine.getActionEventBus().fireAction({ event });
				}}
				onTouchMove={(event) => {
					this.props.engine.getActionEventBus().fireAction({ event });
				}}
			>
				{reArrangedLayers.map((layer) => {
					return (
						<TransformLayerWidget layer={layer} key={layer.getID()}>
							<SmartLayerWidget layer={layer} engine={this.props.engine} key={layer.getID()} />
						</TransformLayerWidget>
					);
				})}
			</Canvas>
		);
	}
}
