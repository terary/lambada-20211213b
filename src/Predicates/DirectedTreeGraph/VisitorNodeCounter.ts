import { VisitorNodeType, IVisitor} from "./types";

export class VisitorNodeCounter<T> implements IVisitor<T> {
  private _nodeCount =0;
  private _nodeType: VisitorNodeType; 
  constructor(nodeType: VisitorNodeType = 'all') {
    this._nodeType = nodeType;
  }
  visit(parentId: string, nodeId: string, payload:T){
    this._nodeCount++;
  }

  get nodeType(): VisitorNodeType {
    return this._nodeType
  }

  get nodeCount(){return this._nodeCount}
}
