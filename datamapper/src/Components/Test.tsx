import React from 'react'
import createEngine, {DiagramModel} from "@projectstorm/react-diagrams";
import { DefaultLinkModel, DefaultNodeModel } from '@projectstorm/react-diagrams-defaults';
import { CanvasWidget } from '@projectstorm/react-canvas-core';
import DataMapperDiagram from "./Diagram/Diagram";
import {InputNode} from "./Diagram/Node";

const Test = () => {

    var engine = createEngine();
    var model = new DiagramModel();

    var node1= new DefaultNodeModel({
        name:'Input',
    });
    node1.setPosition(100,100);
    //let port1= node1.addOutPort('Out');

    var node2= new DefaultNodeModel({
        name:'Output'
    });
    node2.setPosition(200,100);
    //let port2= node2.addInPort();

    const inputNode = new InputNode();

    //let link1 = port1.link<DefaultLinkModel>(port2);
    model.addAll(node1,node2);
    engine.setModel(model);

  return (
    <>
        <div>Test</div>
        <DataMapperDiagram
            nodes={[inputNode]}
        />
    </>
  )
}

export default Test