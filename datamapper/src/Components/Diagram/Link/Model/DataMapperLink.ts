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
import { BezierCurve } from "@projectstorm/geometry";
import { DefaultLinkModel } from "@projectstorm/react-diagrams";

export const LINK_TYPE_ID = "datamapper-link";

export class DataMapperLinkModel extends DefaultLinkModel {

	constructor() {
		super({
			type: LINK_TYPE_ID,
			width: 1,
			curvyness: 0,
			locked: true,
			color: "#00c0ff"
		});
	}

	getSVGPath(): string {
		if (this.points.length === 2) {
			const curve = new BezierCurve();
			curve.setSource(this.getFirstPoint().getPosition());
			curve.setTarget(this.getLastPoint().getPosition());

			const srcControl = this.getFirstPoint().getPosition().clone();
			srcControl.translate(220, 0);
			const targetControl = this.getLastPoint().getPosition().clone();
			targetControl.translate(-220, 0);
			curve.setSourceControl(srcControl);
			curve.setTargetControl(targetControl);

			if (this.sourcePort) {
				curve.getSourceControl().translate(...this.calculateControlOffset(this.getSourcePort()));
			}

			if (this.targetPort) {
				curve.getTargetControl().translate(...this.calculateControlOffset(this.getTargetPort()));
			}
			return curve.getSVGCurve();
		}
		return "";
	}
}
