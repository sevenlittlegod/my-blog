import { NewPostForm } from "../NewPostForm";

export default function NewPostPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">New Post</h1>
      <NewPostForm />
    </div>
  );
}
