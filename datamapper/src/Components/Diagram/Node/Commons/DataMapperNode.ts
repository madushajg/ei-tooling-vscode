/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
// tslint:disable: no-empty-interface
import { DiagramModel, NodeModel, NodeModelGenerics } from '@projectstorm/react-diagrams';
import { DataMapperPortModel } from "../../Port/Model/DataMapperPortModel";

export interface DataMapperNodeModelGenerics {
    PORT: DataMapperPortModel;
}

export interface IDataMapperNodeFactory {

}

export abstract class DataMapperNodeModel extends NodeModel<NodeModelGenerics & DataMapperNodeModelGenerics> {

    private diagramModel: DiagramModel | undefined;

    constructor(type: string) {
        super({
            type
        });
    }

    public setModel(model: DiagramModel) {
        this.diagramModel = model;
    }

    public getModel() {
        return this.diagramModel;
    }

    abstract initPorts(): void;
    abstract initLinks(): void;
    // extend this class to add link init, port init logics
}
