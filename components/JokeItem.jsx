import React from "react";

export default function JokeItem(props) {
  return (
    <div key={props.joke.name} class="grid grid-cols-4">
      <div class="col-span-3 rounded m-1 px-3 py-1 bg-red-400">{props.joke.name}</div>
      <div class="col-span-1 rounded m-1 px-3 py-1 bg-red-400">{props.joke.rating}</div>
    </div>
  );
}
