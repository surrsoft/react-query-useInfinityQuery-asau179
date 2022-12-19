import React from 'react';
import styled from 'styled-components';

const DelButtonStyled = styled.button`
  margin-left: 8px;
`

export interface ParamsType {
  id: string;
  atClick: (id: string) => void
}

export function DelButton({ id, atClick }: ParamsType) {
  function handleDelete() {
    debugger; // del+
    atClick(id)
  }

  return <DelButtonStyled onClick={handleDelete}>delete</DelButtonStyled>
}
