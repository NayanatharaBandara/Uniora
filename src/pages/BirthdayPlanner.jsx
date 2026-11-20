
import { useState } from "react";
import { CalendarDays, Gift, PartyPopper } from "lucide-react";
import "../styles/birthdayPlanner.css";

function BirthdayPlanner() {
  const [birthdayName, setBirthdayName] = useState("");
  const [birthdayDate, setBirthdayDate] = useState("");
  const [birthdayTheme, setBirthdayTheme] = useState("Pastel");

  function handleSubmit(event) {
    event.preventDefault();

    if (!birthdayName.trim() || !birthdayDate) {
      alert("Please enter a name and birthday date.");
      return;
    }

    alert(
      `Birthday plan created for ${birthdayName}! Theme: ${birthdayTheme}.`
    );
  }

  return (
    <div className="birthday-planner-page">
      <section className="birthday-hero">
        <PartyPopper size={45} />

        <h1>Make Every Birthday Special</h1>

        <p>
          Plan beautiful birthday celebrations and create
          unforgettable memories with UNIORA.
        </p>
      </section>

      <section className="birthday-planner-content">
        <div className="birthday-intro">
          <Gift size={35} />

          <h2>Birthday Planner</h2>

          <p>
            Start planning your next special celebration.
          </p>
        </div>

        <form
          className="birthday-form"
          onSubmit={handleSubmit}
        >
          <label>Birthday Person's Name</label>

          <input
            type="text"
            placeholder="Enter a name"
            value={birthdayName}
            onChange={(event) =>
              setBirthdayName(event.target.value)
            }
            required
          />

          <label>Birthday Date</label>

          <div className="birthday-date-input">
            <CalendarDays size={19} />

            <input
              type="date"
              value={birthdayDate}
              onChange={(event) =>
                setBirthdayDate(event.target.value)
              }
              required
            />
          </div>

          <label>Choose a Birthday Theme</label>

          <select
            value={birthdayTheme}
            onChange={(event) =>
              setBirthdayTheme(event.target.value)
            }
          >
            <option value="Pastel">Pastel Theme</option>
            <option value="Floral">Floral Theme</option>
            <option value="Elegant">Elegant Theme</option>
            <option value="Colorful">Colorful Theme</option>
          </select>

          <button type="submit">
            Create Birthday Plan
          </button>
        </form>
      </section>
    </div>
  );
}

export default BirthdayPlanner;
