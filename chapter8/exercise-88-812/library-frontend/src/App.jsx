import { useState, useEffect } from 'react';
import { useApolloClient, useQuery, useSubscription } from '@apollo/client';
import Authors from './components/Authors';
import Books from './components/Books';
import NewBook from './components/NewBook';
import Login from './components/Login';
import { ALL_BOOKS, ALL_BOOKS_BY_GENRES, BOOK_ADDED } from './queries';
import Recommendations from './components/Recommendations';

const App = () => {
  const [page, setPage] = useState('authors');
  const [token, setToken] = useState(null);
  const client = useApolloClient();

  useEffect(() => {
    const userToken = localStorage.getItem('user');
    if (userToken) {
      setToken(userToken);
    }
  }, []);

  useSubscription(BOOK_ADDED, {
    onData: ({ data, client }) => {
      const newBook = data.data.bookAdded;
      if (newBook) {
        window.alert(
          `A new book with the title ${newBook.title} has been added!`
        );
        client.cache.updateQuery({ query: ALL_BOOKS }, (existingData) => {
          return {
            allBooks: [...existingData.allBooks, newBook],
          };
        });
        client.cache.updateQuery(
          { query: ALL_BOOKS_BY_GENRES },
          (existingData) => {
            return {
              allBooks: [...existingData.allBooks, newBook],
            };
          }
        );
      }
    },
  });

  const logout = () => {
    setToken(null);
    localStorage.clear();
    client.resetStore();
  };

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {token ? (
          <>
            <button onClick={() => setPage('add')}>add book</button>
            <button onClick={() => setPage('recommendations')}>
              recommendations
            </button>
            <button onClick={logout}>logout</button>
          </>
        ) : (
          <button onClick={() => setPage('login')}>login</button>
        )}
      </div>

      <Authors token={token} show={page === 'authors'} />

      <Books show={page === 'books'} />

      <NewBook token={token} show={page === 'add'} />

      <Login setPage={setPage} setToken={setToken} show={page === 'login'} />

      <Recommendations
        setPage={setPage}
        token={token}
        show={page == 'recommendations'}
      />
    </div>
  );
};

export default App;
