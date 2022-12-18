import { NextParamsListType, PageType } from '../types';

export interface TrimHelperInType {
  pages?: PageType[],
  pageParams?: NextParamsListType
}

/**
 * Выполняет подравнивание данных если определяет что имело место удаление элемента с
 * использованием хелпера {@link infiniteDeleteElemCacheUpdateHelper}.
 * Мутирует входные параметры если требуется.
 * @param pages
 * @param pageParams
 */
export function infiniteDeleteTrimHelper({ pages, pageParams }: TrimHelperInType): void {
  if (pages && pages.length > 0 && pageParams && pageParams.length > 0) {
    const lastPageParam = pageParams[pageParams.length - 1]
    const countTarget = !lastPageParam ? 0 : lastPageParam.pageNum * lastPageParam.pageSize
    const elemsCountCurrent = pages.reduce((acc, page) => (acc + page.elems.length), 0)
    if (elemsCountCurrent > countTarget && pages.length > 1) {
      // ^ ситуация когда после запроса последней страницы элементов стало больше чем нужно
      // (такое может быть в результате удаления нами элемента с помощью infiniteElemDeleteHelper)

      // замена предпоследней страницы последней
      pages[pages.length - 2] = pages[pages.length - 1];
      pages.splice(pages.length - 1)
      pageParams.splice(pageParams.length - 1)
    } else {
      const lastPage = pages[pages.length - 1]
      if (lastPage && lastPage.elems.length < 1) {
        pages.splice(pages.length - 1)
        pageParams.splice(pageParams.length - 1)
      }
    }
  }
}
