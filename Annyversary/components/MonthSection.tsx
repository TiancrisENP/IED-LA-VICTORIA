import type { Month } from "@/lib/months";

type Props = {
  month: Month;
  reverse: boolean;
};

export default function MonthSection({ month, reverse }: Props) {
  return (
    <section
      className={`month${reverse ? " is-reverse" : ""}`}
      id={month.id}
      data-bg-src={month.background.src}
      data-bg-type={month.background.type}
    >
      <div className="month-copy">
        <p className="month-kicker">Un año juntos</p>
        <h2>{month.label}</h2>
        <p className="month-text">{month.text}</p>
        <blockquote className="month-verse">
          <p>{month.verse}</p>
          <cite>{month.author}</cite>
        </blockquote>
      </div>
      <figure className="cuadro">
        {/* Polaroid frame needs native img for object-fit crop. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={month.cuadro} alt={`Recuerdo de ${month.label}`} />
      </figure>
    </section>
  );
}
