import React from "react";
import TagItem from "@/components/TagItem";
import Link from 'next/link';

function ListTags({ tags }) {
  return (
    <div class="flex flex-row">
      {tags.map((tags) =>
        <TagItem tag={tags} />
      )}
    </div>
  );
}
export default function Tags() {
  const tags = ['dark', 'zany', 'sexy', 'awkward'];

  return(
    <div>
      <ListTags tags={tags} />
      <Link href="/jokes">jokes</Link>
    </div>
  );
}