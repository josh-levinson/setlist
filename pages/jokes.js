import React from "react";

function ListJokes({ jokes }) {
  return (
    <ul>
      {jokes.map((joke) =>
      <div class="rounded">
        <li key={joke.name}>{joke.name}</li>
      </div>
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
    <div class="flex p-5">
      <ListJokes jokes={jokes} />
    </div>
  );
}