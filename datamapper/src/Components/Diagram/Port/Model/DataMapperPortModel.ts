/*
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
import { LinkModel, LinkModelGenerics, PortModel, PortModelGenerics } from "@projectstorm/react-diagrams";
import { DataMapperLinkModel } from "../../Link/Model/DataMapperLink";

export interface RecordFieldNodeModelGenerics {
	PORT: DataMapperPortModel;
}

export const FORM_FIELD_PORT = "form-field-port";

export class DataMapperPortModel extends PortModel<PortModelGenerics & RecordFieldNodeModelGenerics> {

	public linkedPorts: PortModel[];

	constructor(
		public portName: string,
		public portType: "IN" | "OUT",
		public index?: number,
		public parentModel?: DataMapperPortModel,
		public collapsed?: boolean,
		public hidden?: boolean,
		public descendantHasValue?: boolean) {
		super({
			type: FORM_FIELD_PORT,
			name: `${portName}.${portType}`
		});
		this.linkedPorts = [];
	}

	createLinkModel(): LinkModel {
		const lm = new DataMapperLinkModel();
		lm.registerListener({
			sourcePortChanged: () => {
				// lm.addLabel(evt.port.getName() + " = " + lm.getTargetPort().getName());
			},
			targetPortChanged: (async () => {
				// todo
			})
		});
		return lm;
	}

	addLink(link: LinkModel<LinkModelGenerics>): void {
		if (this.portType === 'IN'){
			this.parentModel?.setDescendantHasValue();
		}
		super.addLink(link);
	}

	addLinkedPort(port: PortModel): void{
		this.linkedPorts.push(port);
	}

	setDescendantHasValue(): void {
		this.descendantHasValue = true;
		if (this.parentModel){
			this.parentModel.setDescendantHasValue();
		}
	}

	canLinkToPort(port: DataMapperPortModel): boolean {
		let isLinkExists = false;
		if (port.portType === "IN") {
			isLinkExists = this.linkedPorts.some((linkedPort) => {
				return port.getID() === linkedPort.getID()
			})
		}
		return this.portType !== port.portType && !isLinkExists;
	}
}
