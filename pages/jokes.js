import React from "react";
import JokeItem from "@/components/JokeItem";
import Link from 'next/link'

function ListJokes({ jokes }) {
  return (
    <div>
      {jokes.map((joke) =>
        <JokeItem joke={joke} />
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
    <div>
      <div class="flex p-5">
        <ListJokes jokes={jokes} />
      </div>
      <div>
        <Link href="/tags">tags</Link>
      </div>
    </div>
  );
}