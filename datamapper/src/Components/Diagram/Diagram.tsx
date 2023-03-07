
/* eslint-disable @typescript-eslint/await-thenable */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
// tslint:disable: jsx-no-multiline-js jsx-no-lambda no-console
import * as React from 'react';

import "reflect-metadata";
import { SelectionBoxLayerFactory } from "@projectstorm/react-canvas-core";
import { DefaultDiagramState, DefaultLabelFactory, DefaultLinkFactory, DefaultNodeFactory, DefaultPortFactory, DiagramEngine, DiagramModel, NodeLayerFactory, PathFindingLinkFactory } from '@projectstorm/react-diagrams';
import { container } from "tsyringe";
import { DataMapperNodeModel } from "./Node/Commons/DataMapperNode";
import { DataMapperLinkModel } from "./Link/Model/DataMapperLink";
import * as Nodes from "./Node";
import * as Ports from "./Port";
import * as Links from "./Link";
import * as Labels from "./Label";
import { DataMapperDIContext } from "../../utils/DataMapperDIContext/DataMapperDIContext";
import { DataMapperCanvasContainerWidget } from "./Canvas/DataMapperCanvasContainerWidget";
import { DataMapperCanvasWidget } from "./Canvas/DataMapperCanvasWidget";
import { DefaultState as LinkState } from './LinkState/DefaultState';

interface DataMapperDiagramProps {
    nodes?: DataMapperNodeModel[];
    links?: DataMapperLinkModel[];
    hideCanvas?: boolean;
}

const defaultModelOptions = { zoom: 90 }

function initDiagramEngine() {
    // START TODO: clear this up
    // this is a hack to load all modules for DI to work properly
    const _NF = Nodes;
    const _PF = Ports;
    const _LF = Links;
    const _LAF = Labels;
    // END TODO

    const diContext = container.resolve(DataMapperDIContext);

    const engine = new DiagramEngine({
        registerDefaultPanAndZoomCanvasAction: true,
        registerDefaultZoomCanvasAction: false
    });

    // register model factories
    engine.getLayerFactories().registerFactory(new NodeLayerFactory() as any);
    engine.getLayerFactories().registerFactory(new SelectionBoxLayerFactory());

    engine.getLabelFactories().registerFactory(new DefaultLabelFactory());
    engine.getNodeFactories().registerFactory(new DefaultNodeFactory());
    engine.getLinkFactories().registerFactory(new DefaultLinkFactory());
    engine.getLinkFactories().registerFactory(new PathFindingLinkFactory());
    engine.getPortFactories().registerFactory(new DefaultPortFactory());

    // register the default interaction behaviours
    engine.getStateMachine().pushState(new DefaultDiagramState());

    diContext.nodeFactories.forEach((nf) =>
        engine.getNodeFactories().registerFactory(nf));
    diContext.portFactories.forEach((pf) =>
        engine.getPortFactories().registerFactory(pf));
    diContext.linkFactories.forEach((lf) =>
        engine.getLinkFactories().registerFactory(lf));
    diContext.labelFactories.forEach((lbf) =>
        engine.getLabelFactories().registerFactory(lbf));

    const state = engine.getStateMachine().getCurrentState();
    if (state instanceof DefaultDiagramState) {
        state.dragNewLink.config.allowLooseLinks = false;
    }

    engine.getStateMachine().pushState(new LinkState());
    return engine;
}

function DataMapperDiagram(props: DataMapperDiagramProps): React.ReactElement {
    const { nodes, hideCanvas } = props;

    const [engine, setEngine] = React.useState<DiagramEngine>(initDiagramEngine());
    const [model, setModel] = React.useState(new DiagramModel(defaultModelOptions));

    React.useEffect(() => {
        async function genModel() {
            const zoomLevel = model.getZoomLevel();
            const offSetX = model.getOffsetX();
            const offSetY = model.getOffsetY();
            const dmNodes = nodes ? nodes : [];

            const newModel = new DiagramModel();
            newModel.setZoomLevel(zoomLevel);
            newModel.setOffset(offSetX, offSetY);
            newModel.addAll(...dmNodes);
            for (const node of dmNodes) {
                try {
                    node.setModel(newModel);
                    await node.initPorts();
                    node.initLinks();
                    engine.repaintCanvas();
                } catch (e) {
                    console.error(e)
                }
            }
            newModel.setLocked(true);
            engine.setModel(newModel);
            if (newModel.getLinks().length > 0) {
                await engine.repaintCanvas(true);
            }
            setModel(newModel);
        }
        void genModel();
    }, [nodes]);

    return (
        <>
            {engine && engine.getModel() && (
                <>
                    <DataMapperCanvasContainerWidget>
                        <DataMapperCanvasWidget engine={engine} />
                    </DataMapperCanvasContainerWidget>
                </>
            )}
        </>
    );


}

export default React.memo(DataMapperDiagram);
