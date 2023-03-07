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
// tslint:disable: jsx-no-lambda
import * as React from 'react';

import { AbstractReactFactory } from '@projectstorm/react-canvas-core';

import "reflect-metadata";
import { container, injectable, singleton } from "tsyringe";

import { IDataMapperNodeFactory } from "../Commons/DataMapperNode";
import { InputWidget} from "../Commons/InputWidget";
import { INPUT_NODE_TYPE, InputNode } from "./inputNode";
import { DiagramEngine } from "@projectstorm/react-diagrams";

@injectable()
@singleton()
export class InputNodeFactory extends AbstractReactFactory<InputNode, DiagramEngine> implements IDataMapperNodeFactory {
    constructor() {
        super(INPUT_NODE_TYPE);
    }

    generateReactWidget(event: { model: InputNode; }): JSX.Element {
        return (
            <InputWidget />
        );
    }

    generateModel(): InputNode {
        return new InputNode();
    }
}
container.register("NodeFactory", { useClass: InputNodeFactory });
