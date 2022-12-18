import { useInfiniteQuery } from '@tanstack/react-query';
import { RsuvTxJsonServer } from 'rsuv-lib';
import { NextParamsType, PageType, QueryFnPrmType } from './types';
import { PAGE_SIZE, QUERY_KEY } from './constants';

export function useDataGet(jsonServer: RsuvTxJsonServer) {

  async function queryFn({ pageParam }: QueryFnPrmType): Promise<PageType> {
    const { pageNum = 1, pageSize = PAGE_SIZE } = pageParam || {};
    const total = await jsonServer.elemsCountGetAll()
    const data = await jsonServer.elemsGetPage(pageNum, pageSize);
    return { elems: data, total: total }
  }

  return useInfiniteQuery<PageType>({
    queryKey: QUERY_KEY,
    queryFn,
    getNextPageParam: (lastPage: PageType | undefined, allPages: PageType[]): NextParamsType | undefined => {
      console.log('!!-!!-!! 1959- lastPage {221218195756}\n', lastPage); // del+
      console.log('!!-!!-!! 1959- allPages {221218195915}\n', allPages); // del+

      const elemsCount = allPages.reduce((acc, page) => acc + page.elems.length, 0)
      if (elemsCount >= (lastPage?.total ?? 0)) {
        return undefined;
      }
      return { pageNum: allPages.length + 1, pageSize: PAGE_SIZE };
    },
    refetchOnWindowFocus: false
  })
}
