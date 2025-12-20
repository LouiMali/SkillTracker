import { useEffect, useState } from "react";
import { getSkills } from "../api/skills";

export default function SkillsPage() {
  const [skills, setSkills] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getSkills()
      .then(setSkills)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h1>Skills</h1>
      {error && <p style={{ color: "crimson" }}>{error}</p>}
      <ul>
        {skills.map((s) => (
          <li key={s.id ?? s.skill_id ?? s.skillId}>
            {s.name} {s.category ? `(${s.category})` : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}
