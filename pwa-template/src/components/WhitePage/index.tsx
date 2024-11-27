import { useState, useEffect } from "react";

function WhitePage() {
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString()
  );
  const [quote, setQuote] = useState("");

  const quotes = [
    "Time is what we want most, but what we use worst. – William Penn",
    "The way we spend our time defines who we are. – Jonathan Estrin",
    "Time is the most valuable thing a man can spend. – Theophrastus",
    "Time is the school in which we learn, time is the fire in which we burn. – Delmore Schwartz",
    "Time slips away like grains of sand never to return again. – Robin Sharma",
  ];

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    const quoteInterval = setInterval(() => {
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      setQuote(randomQuote);
    }, 10000); // Change the quote every 10 seconds

    return () => {
      clearInterval(timerId);
      clearInterval(quoteInterval);
    };
  }, [quotes]);

  return (
    <div style={{ textAlign: "center", fontSize: "24px", padding: "20px" }}>
      <h1>Understanding Time</h1>
      <p>Current time:</p>
      <div>{currentTime}</div>
      <img
        alt="time"
        style={{ marginTop: "20px" }}
        width={window.innerWidth / 2}
        height={window.innerHeight / 2}
        src="https://static.vecteezy.com/system/resources/previews/012/322/442/original/take-your-time-creative-inspiration-lettering-illustration-colorful-typography-design-on-a-dark-background-vector.jpg"
      />
      <h2>Motivational Quote</h2>
      <p>{quote || "Loading a motivational quote..."}</p>
      <p>
        Time management is essential in our everyday lives to balance work,
        leisure, and responsibilities. Effective use of time leads to improved
        efficiency, less stress, and more success in life. Remember, every
        moment counts!
      </p>
    </div>
  );
}

export default WhitePage;
