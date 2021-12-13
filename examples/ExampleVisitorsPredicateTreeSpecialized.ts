import { PredicateFormulaEditorFactory, TPredicateProperties } from "../src";
import type { IVisitor, VisitorNodeType } from "../src";
import { EXAMPLE_JSON_BLUE_SKIES } from "../src";

const { predicateTreeJson } = EXAMPLE_JSON_BLUE_SKIES;
const { predicateSubjectsDictionaryJson: subjectDictionaryJson } =
  EXAMPLE_JSON_BLUE_SKIES;

const predicateFormula = PredicateFormulaEditorFactory.fromJson({
  predicateTreeJson: predicateTreeJson,
  subjectDictionaryJson: subjectDictionaryJson,
});

/**
 * IVisitor<TPredicateProperties>           -> nodeType = 'leaf'
 * IVisitor<TPredicatePropertiesArrayValue> -> nodeType = 'leaf'
 * IVisitor<TPredicatePropertiesJunction>   -> nodeType = 'branch'
 * IVisitor<TPredicateNode>                 -> nodeType = 'branch' | 'leaf' | 'all'
 *
 * IVisitor<TPredicateNode> is aliased as IVisitorPredicateTree
 * see General example
 */

class SpecializedVisitor implements IVisitor<TPredicateProperties> {
  // by using IVisitor<TPredicateProperties> our payload will
  // will also be TPredicateProperties,
  // which is helpful for IDE code-assist and type checking
  private _startBrachId: string;
  private _leafIds: string[] = [];
  private _leafSubjectIds: string[] = [];

  constructor(startBranchId: string) {
    this._startBrachId = startBranchId;
  }

  get startNodeId() {
    return this._startBrachId;
  }
  visit(parentId: string, nodeId: string, payload: TPredicateProperties) {
    this._leafIds.push(nodeId);
    this._leafSubjectIds.push(payload.subjectId);
  }

  get nodeType(): VisitorNodeType {
    return "leaf";
  }

  get leafIds() {
    return this._leafIds;
  }
  get leafSubjectIds() {
    return this._leafSubjectIds;
  }
}
const specializedVisitor = new SpecializedVisitor(predicateFormula.rootNodeId);
predicateFormula.predicatesAcceptVisitor(specializedVisitor);
console.log(specializedVisitor.leafIds);
console.log(specializedVisitor.leafSubjectIds);
