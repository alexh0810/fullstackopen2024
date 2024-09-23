import { useQuery } from '@apollo/client';
import { useState, useEffect } from 'react';
import { ALL_BOOKS_BY_GENRES, USER_FAV_GENRE } from '../queries';

const Recommendations = (props) => {
  if (!props.show) {
    return null;
  }

  const [books, setBooks] = useState([]);
  console.log('🚀 ~ Recommendations ~ books:', books);
  const [genre, setGenre] = useState('');
  const userGenre = useQuery(USER_FAV_GENRE);
  const booksByGenre = useQuery(ALL_BOOKS_BY_GENRES, {
    variables: { genre },
  });

  useEffect(() => {
    if (userGenre && userGenre.data && userGenre.data.me) {
      setGenre(userGenre.data.me.favoriteGenre);
    }
    if (booksByGenre.data) {
      setBooks(booksByGenre.data.allBooks);
    }
  }, [userGenre, booksByGenre]);

  console.log('🚀 ~ Recommendations ~ userGenre:', userGenre);
  console.log('🚀 ~ Recommendations ~ allBooks:', booksByGenre);

  return (
    <div>
      <h2>Recommendations</h2>
      <p>
        books in your favorite genre <b>{genre}</b>
      </p>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div></div>
    </div>
  );
};

export default Recommendations;
