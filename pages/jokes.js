import React from "react";
import RowItem from "@/components/RowItem";

function ListJokes({ jokes }) {
  return (
    <div>
      {jokes.map((joke) =>
        <RowItem joke={joke} />
      )}
    </div>
  );
}

export default function Jokes() {
  const jokes = [
    { name: 'korea', rating: 5.0 },
    { name: 'blind', rating: 2.0 },
    { name: 'herewego', rating: 3.5 }
  ];

  return (
    <div class="flex p-5">
      <ListJokes jokes={jokes} />
    </div>
  );
}