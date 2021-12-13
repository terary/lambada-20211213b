import { VisitorNodeType, IVisitor, SerializedTree} from "./types";

export class VisitorTreeToJson<T> implements IVisitor<T> {

  private _nodeType: VisitorNodeType; 
  private _json: SerializedTree<T> = {};
  private _rootNodeId: string;

  constructor(rootNodeId:string) {
    this._rootNodeId = rootNodeId;
    this._nodeType = 'all';
  }

  visit(parentId: string, nodeId: string, payload:T){
    if(nodeId === this._rootNodeId){
      this._json[nodeId] = {parentId:null, payload}
    } else {
      this._json[nodeId] = {parentId, payload}
    }
  }

  get startNodeId(){return this._rootNodeId}

  get nodeType(): VisitorNodeType {
    return this._nodeType
  }
  get jsonTree(): SerializedTree<T> {return this._json};
}
