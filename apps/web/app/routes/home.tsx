import { redirect } from "react-router";

export function loader() {
  return redirect("/family");
}

export default function Home() {
  return null;
}
