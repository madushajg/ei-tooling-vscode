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
import { Point } from "@projectstorm/geometry";
import { DataMapperNodeModel } from "../Commons/DataMapperNode";


export const INPUT_NODE_TYPE = "input-node";

export class InputNode extends DataMapperNodeModel {

    constructor() {
        super(
            INPUT_NODE_TYPE
        );
    }

    async initPorts() {
        // todo
    }

    initLinks(): void {
        // todo
    }

    setPosition(point: Point): void;
    setPosition(x: number, y: number): void;
    setPosition(x: number | Point, y?: number): void {
        if (typeof x === "number") {
            if (typeof y === "number") {
                super.setPosition(x, y);
            }
        }
    }
}
