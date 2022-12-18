import { ElemType, NextParamsListType, PageType } from '../types';
import { QueryClient } from '@tanstack/react-query';
import loChunk from 'lodash/chunk';

interface ElemDeleteHelperInType {
  pageSize: number;
  pageParams: NextParamsListType,
  pages: PageType[],
  idDeletedElem: string,
  queryClient?: QueryClient,
  queryKey?: any[]
}

export interface ElemDeleteHelperRetType {
  pageParamsNext: NextParamsListType,
  pagesNext: PageType[]
}

export function infiniteDeleteElemCacheUpdateHelper(
  {
    pageSize,
    pageParams,
    pages,
    idDeletedElem,
    queryClient,
    queryKey
  }: ElemDeleteHelperInType
): ElemDeleteHelperRetType {
  let pageParamsNext = [...pageParams]
  let pagesNext = [...pages];

  // обновление поля total
  const newTotal = pages[pages.length - 1].total - 1
  pagesNext.forEach(page => page.total = newTotal)

  // все элементы всех страниц в том же порядке, за исключением удаляемого элемента
  const elems: ElemType[] = pagesNext
    .reduce((acc: ElemType[], page) => {
      acc.push(...page.elems)
      return acc;
    }, [])
    .filter(elem => elem.id !== idDeletedElem)

  // двигаем элементы для компенсации удалённого элемента ("уплотняем" к началу списка)
  const chunks = loChunk(elems, pageSize)
  pagesNext = pagesNext.reduce((acc: PageType[], page, index) => {
    // чанков может получится меньше чем страниц
    page.elems = chunks[index] || []
    acc.push(page)
    return acc;
  }, [])

  if (queryClient && queryKey) {
    // обновляем кэш новыми данными
    queryClient.setQueryData(queryKey, () => {
      return {
        pages: pagesNext,
        pageParams: pageParamsNext
      }
    })
  }

  return { pageParamsNext, pagesNext };
}
