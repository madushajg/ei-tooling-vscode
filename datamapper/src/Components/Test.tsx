import { CanvasWidget } from "@projectstorm/react-canvas-core";
import { DiagramEngine, DiagramModel  } from "@projectstorm/react-diagrams";
import { DefaultLinkModel, DefaultNodeModel } from "@projectstorm/react-diagrams-defaults";

const Test = () =>{

    const engine = new DiagramEngine();
    const model = new DiagramModel();

    const node1 = new DefaultNodeModel({name:'1-0',color:'red'});
    node1.setPosition(100,100);
    let port1=node1.addOutPort('Out');

    const node2 = new DefaultNodeModel({name:'2-0',color:'green'});
    node2.setPosition(500,100);
    let port2= node2.addInPort('In');

    const link = port1.link<DefaultLinkModel>(port2);
    link.addLabel("Hello World");

    model.addAll(node1,node2,link);
    engine.setModel(model);

    return(
        <>
        <h1> Tyescript</h1>
        <CanvasWidget engine={engine}/>
        </>
    );
}

export default Test;