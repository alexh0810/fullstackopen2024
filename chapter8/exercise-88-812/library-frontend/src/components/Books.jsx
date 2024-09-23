import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { ALL_BOOKS_BY_GENRES, ALL_GENRES } from '../queries';

const Books = (props) => {
  if (!props.show) {
    return null;
  }

  const [books, setBooks] = useState([]);
  const [genre, setGenre] = useState('');
  const [genres, setGenres] = useState([]);
  const allBookGenres = useQuery(ALL_GENRES);
  const booksByGenre = useQuery(ALL_BOOKS_BY_GENRES, {
    variables: { genre },
  });

  useEffect(() => {
    if (booksByGenre.data && allBookGenres.data) {
      setBooks(booksByGenre.data.allBooks);
      setGenres([
        ...new Set(allBookGenres.data.allBooks.flatMap((book) => book.genres)),
      ]);
    }
  }, [booksByGenre, allBookGenres]);

  const showBookByGenres = (genre) => {
    setGenre(genre);
  };

  return (
    <div>
      <h2>books</h2>
      <p>
        in genre <b>{genre}</b>
      </p>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {genre &&
            books.map((a) => (
              <tr key={a.title}>
                <td>{a.title}</td>
                <td>{a.author.name}</td>
                <td>{a.published}</td>
              </tr>
            ))}
        </tbody>
      </table>
      <div>
        {genres.map((genre) => (
          <button onClick={() => showBookByGenres(genre)}>{genre}</button>
        ))}
      </div>
    </div>
  );
};

export default Books;
