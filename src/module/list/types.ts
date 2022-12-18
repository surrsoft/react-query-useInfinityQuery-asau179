import { PAGE_SIZE } from './constants';

export interface ElemType {
  id: string
  title: string,
}

export interface PageType {
  elems: ElemType[],
  total: number
}

export interface NextParamsType {
  pageNum: number,
  pageSize: number
}

export type QueryFnPrmType = { pageParam?: NextParamsType }

export type NextParamsListType = (NextParamsType | undefined)[]
