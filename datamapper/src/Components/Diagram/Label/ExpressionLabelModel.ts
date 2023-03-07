import { BaseModelOptions, DeserializeEvent } from '@projectstorm/react-canvas-core';
import { LabelModel } from '@projectstorm/react-diagrams';

import { DataMapperLinkModel } from '../Link';

export interface ExpressionLabelOptions extends BaseModelOptions {
	value?: string;
	link?: DataMapperLinkModel;
	editorLabel?: string;
	deleteLink?: () => void;
}

export class ExpressionLabelModel extends LabelModel {
	value?: string;
	link?: DataMapperLinkModel;
	editorLabel?: string;
	deleteLink?: () => void;

	constructor(options: ExpressionLabelOptions = {}) {
		super({
			...options,
			type: 'expression-label'
		});
		this.value = options.value || '';
		this.link = options.link;
		this.editorLabel = options.editorLabel;
		this.deleteLink = options.deleteLink;
	}

	serialize() {
		return {
			...super.serialize(),
			value: this.value
		};
	}

	deserialize(event: DeserializeEvent<this>): void {
		super.deserialize(event);
		this.value = event.data.value;
	}
}
