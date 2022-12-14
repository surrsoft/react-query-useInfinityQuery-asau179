export interface ElemType {
  id: string
  title: string,
}

export interface PageType {
  elems: ElemType[],
  total: number
}
