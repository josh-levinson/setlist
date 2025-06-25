import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Joke, Tag } from "../types";
import { JokeForm } from "../components";
import { useAuth } from "../contexts/AuthContext";
import { jokeService, tagService } from "../services/dataService";
import styles from "./Pages.module.css";

export default function JokeFormPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [joke, setJoke] = useState<Joke | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, id]);

  const loadData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const [tagsData] = await Promise.all([tagService.getTags(user.id)]);

      setTags(tagsData);

      if (id && id !== "new") {
        const jokeData = await jokeService.getJoke(id);
        setJoke(jokeData);
        setIsEditing(true);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (
    jokeData: Omit<Joke, "id" | "user_id" | "created_at" | "updated_at">
  ) => {
    if (!user) return;

    try {
      if (isEditing && joke) {
        await jokeService.updateJoke(joke.id, jokeData);
      } else {
        await jokeService.createJoke({
          ...jokeData,
          user_id: user.id,
        });
      }
      navigate("/jokes");
    } catch (error) {
      console.error("Error saving joke:", error);
    }
  };

  const handleCancel = () => {
    navigate("/jokes");
  };

  const handleCreateTag = async (tagData: { name: string; color: string }) => {
    if (!user) return;

    try {
      const newTag = await tagService.createTag({
        ...tagData,
        user_id: user.id,
      });
      setTags((prev) => [...prev, newTag]);
    } catch (error) {
      console.error("Error creating tag:", error);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1>{isEditing ? "Edit Joke" : "Create New Joke"}</h1>
      </div>

      <JokeForm
        joke={joke || undefined}
        availableTags={tags}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        onCreateTag={handleCreateTag}
      />
    </div>
  );
}
