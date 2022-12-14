import { useInfiniteQuery } from '@tanstack/react-query';
import { RsuvTxJsonServer } from 'rsuv-lib';
import { PageType } from './types';

export const QUERY_KEY = ['hello']
const PAGE_SIZE = 4;
export const TOTAL = 25;

export function useDataGet(jsonServer: RsuvTxJsonServer) {

  async function queryFn(params: any): Promise<PageType> {
    const { pageParam: pageNum = 1 } = params;
    const total = await jsonServer.elemsCountGetAll()
    const data = await jsonServer.elemsGetPage(pageNum, PAGE_SIZE);
    return { elems: data, total: total }
  }

  return useInfiniteQuery<PageType>({
    queryKey: QUERY_KEY,
    queryFn,
    getNextPageParam: (lastPage: PageType, allPages: PageType[]) => {
      const elemsCount = allPages.reduce((acc, page) => {
        return acc + page.elems.length
      }, 0)
      if (elemsCount >= lastPage.total) {
        return undefined;
      }
      return allPages.length + 1;
    },
    refetchOnWindowFocus: false
  })
}
