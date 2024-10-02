import { useMutation, useQuery, useSubscription } from '@apollo/client';
import { useEffect, useState } from 'react';
import { ALL_AUTHORS, EDIT_AUTHOR, BOOK_ADDED } from '../queries';

const Authors = (props) => {
  const [authors, setAuthors] = useState([]);
  const [authorName, setAuthorName] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const result = useQuery(ALL_AUTHORS);
  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    onError: (error) => {
      console.error('Error editing author:', error.message);
      console.error('Error details:', error.graphQLErrors, error.networkError);
    },
    refetchQueries: [{ query: ALL_AUTHORS }],
  });

  const submit = async (event) => {
    event.preventDefault();

    editAuthor({
      variables: { authorName, birthYear: parseInt(birthYear) },
    });
    setBirthYear('');
    setAuthorName('');
  };

  useEffect(() => {
    if (result.data) {
      const allAuthors = result.data.allAuthors;
      setAuthors(allAuthors);
      if (allAuthors.length > 0) {
        setAuthorName(allAuthors[0].name);
      }
    }
  }, [result]);

  if (result.loading) {
    return <div>loading...</div>;
  }

  if (!props.show) {
    return null;
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {props.token && (
        <>
          <h2>Set birthyear</h2>
          <form onSubmit={submit}>
            <div>
              name
              {authors && (
                <select
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                >
                  {authors.map((a) => (
                    <option key={a.name} value={a.name}>
                      {a.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              born
              <input
                type="number"
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
              />
            </div>
            <button type="submit">update author</button>
          </form>
        </>
      )}
    </div>
  );
};

export default Authors;
