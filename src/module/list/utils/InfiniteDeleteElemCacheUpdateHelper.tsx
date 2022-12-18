import { ElemType, NextParamsListType, PageType } from '../types';
import { QueryClient } from '@tanstack/react-query';
import loChunk from 'lodash/chunk';

interface ElemDeleteHelperInType {
  pageSize: number;
  pages: PageType[],
  pageParams: NextParamsListType,
  idDeletedElem: string,
  queryClient?: QueryClient,
  queryKey?: any[]
}

/**
 * В ходе работы мутирует параметры {@param pages} и {@link pageParams}
 */
export function infiniteDeleteElemCacheUpdateHelper(
  { pageSize, pageParams, pages, idDeletedElem, queryClient, queryKey }: ElemDeleteHelperInType
): void {

  // обновление поля total
  const newTotal = pages[pages.length - 1].total - 1
  pages.forEach(page => page.total = newTotal)

  // все элементы всех страниц в том же порядке, за исключением удаляемого элемента
  const elems: ElemType[] = pages
    .reduce((acc: ElemType[], page) => {
      acc.push(...page.elems)
      return acc;
    }, [])
    .filter(elem => elem.id !== idDeletedElem)

  // двигаем элементы для компенсации удалённого элемента ("уплотняем" к началу списка)
  const chunks = loChunk(elems, pageSize)
  pages = pages.reduce((acc: PageType[], page, index) => {
    // чанков может получится меньше чем страниц
    page.elems = chunks[index] || []
    acc.push(page)
    return acc;
  }, [])

  if (queryClient && queryKey) {
    // обновляем кэш новыми данными
    queryClient.setQueryData(queryKey, (data: any) => {
      console.log('!!-!!-!!  data {221218203509}\n', data); // del+
      debugger; // del+
      return { pages, pageParams }
    })
  }

}
