import axios from "axios";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const userId = localStorage.getItem("userId");
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState("");

  const load = async () => {
    const res = await axios.get(`http://localhost:5000/items/${userId}`);
    setItems(res.data);
  };

  const add = async () => {
    await axios.post("http://localhost:5000/items", { title, userId });
    setTitle("");
    load();
  };

  const del = async (id) => {
    await axios.delete(`http://localhost:5000/items/${id}`);
    load();
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      <input
        placeholder="New Item"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <button onClick={add}>Add</button>

      {items.map((i) => (
        <div key={i.id}>
          {i.title}
          <button onClick={() => del(i.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
