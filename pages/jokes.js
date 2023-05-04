import React from "react";

function ListJokes({ jokes }) {
  return (
    <ul>
      {jokes.map((joke) =>
        <li key={joke.name}>{joke.name}</li>
      )}
    </ul>
  );
}

export default function Jokes() {
  const jokes = [
    { name: 'korea', rating: 5 },
    { name: 'blind', rating: 2 },
    { name: 'herewego', rating: 3.5 }
  ];

  return (
    <div>
      <ListJokes jokes={jokes} />
    </div>
  );
}