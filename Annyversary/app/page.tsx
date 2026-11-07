import BackgroundLayer from "@/components/BackgroundLayer";
import MonthSection from "@/components/MonthSection";
import { closing, months } from "@/lib/months";

export default function Home() {
  const first = months[0];

  return (
    <>
      <BackgroundLayer initial={first.background} />
      <main>
        <section
          className="hero"
          data-bg-src={first.background.src}
          data-bg-type={first.background.type}
        >
          <p className="hero-kicker">Maida y Cristian</p>
          <h1>Estas palabras son las más sinceras que puedo escribirte</h1>
          <p className="hero-date">2 de noviembre</p>
          <span className="hero-scroll">Desliza</span>
        </section>

        {months.map((month, index) => (
          <MonthSection
            key={month.id}
            month={month}
            reverse={index % 2 === 1}
          />
        ))}

        <section
          className="closing"
          id={closing.id}
          data-bg-src={closing.background.src}
          data-bg-type={closing.background.type}
        >
          <figure className="cuadro closing-cuadro">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={closing.cuadro} alt="Maida y Cristian" />
          </figure>
          <p className="hero-kicker">Un año</p>
          <h2 className="closing-line">{closing.text}</h2>
          <blockquote className="month-verse closing-verse">
            <p>{closing.verse}</p>
            <cite>{closing.author}</cite>
          </blockquote>
          <p className="closing-names">{closing.names}</p>
          <p className="hero-date">2 de noviembre</p>
        </section>
      </main>
    </>
  );
}
