import React from 'react';
import './App.css';
import { List } from './module/list/List';
import styled from 'styled-components';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient()

const Container = styled.div`
  padding: 16px;
`

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Container>
        <List/>
      </Container>
    </QueryClientProvider>
  );
}

export default App;
