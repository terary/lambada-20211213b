export interface IExportToJson<T, J> {
  toJson(exportObject: T): J;
}
