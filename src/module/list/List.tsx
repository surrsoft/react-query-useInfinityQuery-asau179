import React, { useState } from 'react';
import styled from 'styled-components';
import { QUERY_KEY, TOTAL, useDataGet } from './useDataGet';
import { RsuvTxJsonServer } from 'rsuv-lib';
import { ElemType, PageType } from './types';
import { useQueryClient } from '@tanstack/react-query';

const Container = styled.div``

const jsonServer: RsuvTxJsonServer = new RsuvTxJsonServer('http://localhost:22136/', 'items')

const ElemStyled = styled.div`
  display: flex;
`

export interface ParamsType {
  some?: string;
}

export function List({ some }: ParamsType) {
  // const [count, countSet] = useState(0); // del+

  const result = useDataGet(jsonServer);
  console.log('!!-!!-!!  result {221214192810}\n', result); // del+
  const { data, hasNextPage, fetchNextPage, refetch } = result;
  console.log('!!-!!-!!  elems {221214212014}\n', data); // del+
  const pages: PageType[] | undefined = data?.pages;
  const pageParams: any = data?.pageParams;
  console.log('!!-!!-!! 2127- 1952- pages {221214195202}\n', pages); // del+
  console.log('!!-!!-!! 1952- pageParams {221214195207}\n', pageParams); // del+
  console.log('!!-!!-!!  hasNextPage {221214195525}\n', hasNextPage); // del+

  // const queryClient = useQueryClient()

  const handleNext = async () => {
    await fetchNextPage()
  }

  const handleDelete = (id: string) => async () => {

    await jsonServer.elemDelete(id)

    await refetch({
      refetchPage: (page: PageType) => {
        return page.elems.some(elem => elem.id === id)
      }
    })

    // const newPages = pages?.map(page => {
    //   page.elems = [...page.elems.filter(elem => elem.id !== id)]
    //   return { ...page };
    // }) ?? []
    // queryClient.setQueryData(QUERY_KEY, (data: any) => {
    //   return {
    //     pages: [...newPages],
    //     pageParams: data?.pageParams
    //   }
    // })
    // countSet(count + 1)
  }

  return <Container>
    <h2>list</h2>
    <div>
      {pages && pages.map((page: PageType) => {
        return page.elems.map((elem: ElemType) => {
          return <ElemStyled key={elem.id}>
            <div>{elem.title}</div>
            <button onClick={handleDelete(elem.id)}>delete</button>
          </ElemStyled>
        })
      })}
    </div>
    <div>
      <button disabled={!hasNextPage} onClick={handleNext}>next</button>
    </div>
  </Container>
}
