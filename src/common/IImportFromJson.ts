export interface IImportFromJson<J, T> {
  fromJson(json: J): T;
}
