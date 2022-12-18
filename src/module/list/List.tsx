import React, { useState } from 'react';
import styled from 'styled-components';
import { useDataGet } from './useDataGet';
import { RsuvTxJsonServer } from 'rsuv-lib';
import { ElemType, NextParamsType, PageType, QueryFnPrmType, NextParamsListType } from './types';
import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { PAGE_SIZE, QUERY_KEY } from './constants';
import loChunk from 'lodash/chunk'

const Container = styled.div``

const jsonServer: RsuvTxJsonServer = new RsuvTxJsonServer('http://localhost:22136/', 'items')

const ElemStyled = styled.div`
  display: flex;
`

const PageStyled = styled.div`
  padding: 8px;
  border: 1px solid red;
  border-radius: 8px;
`

const PagesStyled = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 8px;
`

const ButtonContainerStyled = styled.div`
  margin-top: 16px;
`

const DelButtonStyled = styled.button`
  margin-left: 8px;
`

export interface ParamsType {
  some?: string;
}

interface ElemDeleteHelperInType {
  pageParams: NextParamsListType,
  pages: PageType[],
  idDeletedElem: string,
  hasNextPage?: boolean,
  queryClient?: QueryClient,
  queryKey?: any[]
}

export interface ElemDeleteHelperRetType {
  pageParamsNext: NextParamsListType,
  pagesNext: PageType[]
}

function infiniteElemDeleteHelper(
  {
    pageParams,
    pages,
    idDeletedElem,
    hasNextPage = false,
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
  const chunks = loChunk(elems, PAGE_SIZE)
  pagesNext = pagesNext.reduce((acc: PageType[], page, index) => {
    // чанков может получится меньше чем страниц
    page.elems = chunks[index] || []
    acc.push(page)
    return acc;
  }, [])

  if (hasNextPage) {
    // удаляем последнюю страницу и её параметры
    pagesNext.splice(pagesNext.length - 1)
    pageParamsNext.splice(pageParamsNext.length - 1)
  } else {
    // если у последней страницы теперь нет элементов, удаляем её и её параметры
    if (pagesNext[pagesNext.length - 1].elems.length < 1) {
      pageParamsNext.splice(pageParamsNext.length - 1)
      pagesNext = pagesNext.filter(page => page.elems.length > 0)
    }
  }

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

export function List({ some }: ParamsType) {
  const [renderForce, renderForceSet] = useState(true); // del+

  const result = useDataGet(jsonServer);
  const { data, hasNextPage, fetchNextPage, refetch } = result;
  console.log('!!-!!-!!  data {221218004545}\n', data); // del+
  const pages: PageType[] | undefined = data?.pages;
  const pageParams = data?.pageParams as NextParamsListType | undefined;

  const queryClient = useQueryClient()

  const handleNext = async () => {
    await fetchNextPage();
  }

  const handleDelete = (id: string) => async () => {
    // удаление на бэке
    await jsonServer.elemDelete(id)

    if (pages && pages.length > 0 && pageParams) {

      // ---

      infiniteElemDeleteHelper({
        pageParams,
        pages,
        idDeletedElem: id,
        hasNextPage,
        queryClient,
        queryKey: QUERY_KEY
      });

      // ---

      if (hasNextPage) {
        // перезапрашиваем последнюю страницу
        const fetchNextObj: QueryFnPrmType = {
          pageParam: {
            pageNum: pages.length,
            pageSize: PAGE_SIZE
          }
        }
        await fetchNextPage(fetchNextObj)
      } else {
        // принуждаем к перерендеру т.к. queryClient.setQueryData() перерендер не инициирует
        renderForceSet(!renderForce)
      }
    }

  }

  return <Container>
    <h2>list</h2>
    <PagesStyled>
      {pages && pages.map((page: PageType) => {
        return <PageStyled>
          {
            page.elems.map((elem: ElemType) => {
              return (<ElemStyled key={elem.id}>
                <div>{elem.title}</div>
                <DelButtonStyled onClick={handleDelete(elem.id)}>delete</DelButtonStyled>
              </ElemStyled>)
            })
          }
        </PageStyled>

      })}
    </PagesStyled>
    <ButtonContainerStyled>
      <button disabled={!hasNextPage} onClick={handleNext}>next</button>
    </ButtonContainerStyled>
  </Container>
}
