import React from "react";

export default function TagItem(props) {
  return (
    <div key={props.tag} className="rounded m-1 px-3 py-1 bg-blue-400">{props.tag}</div>
  );
}