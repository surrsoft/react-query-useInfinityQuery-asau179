import React, { useState } from 'react';
import styled from 'styled-components';
import { useDataGet } from './useDataGet';
import { RsuvTxJsonServer } from 'rsuv-lib';
import { ElemType, NextParamsListType, PageType, QueryFnPrmType } from './types';
import { useQueryClient } from '@tanstack/react-query';
import { PAGE_SIZE, QUERY_KEY } from './constants';
import { infiniteDeleteElemCacheUpdateHelper } from './utils/InfiniteDeleteElemCacheUpdateHelper';
import { infiniteDeleteTrimHelper } from './utils/InfiniteDeleteTrimHelper';

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

/**
 *
 * @constructor
 */
export function List() {
  const [renderForce, renderForceSet] = useState(true); // del+

  const { data, hasNextPage, fetchNextPage, refetch } = useDataGet(jsonServer);
  console.log('!!-!!-!!  data {221218004545}\n', data); // del+

  const pages: PageType[] | undefined = data?.pages;
  const pageParams = data?.pageParams as NextParamsListType | undefined;

  infiniteDeleteTrimHelper({ pages, pageParams });

  const queryClient = useQueryClient()

  const handleNext = async () => {
    await fetchNextPage();
  }

  const handleDelete = (id: string) => async () => {
    // удаление на бэке
    await jsonServer.elemDelete(id)

    if (pages && pages.length > 0 && pageParams) {
      infiniteDeleteElemCacheUpdateHelper({
        pageSize: PAGE_SIZE,
        pageParams,
        pages,
        idDeletedElem: id,
        queryClient,
        queryKey: QUERY_KEY
      });
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

  const handleRefetch = async () => {
    await refetch()
  }

  return <Container>
    <h2>list</h2>
    <button style={{ marginBottom: "16px" }} onClick={handleRefetch}>refetch</button>
    <PagesStyled>
      {pages && pages.map((page: PageType, index: number) => {
        return <PageStyled key={index}>
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
