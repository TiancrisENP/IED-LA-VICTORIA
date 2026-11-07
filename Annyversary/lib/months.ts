export type Background = {
  type: "video" | "image";
  src: string;
};

export type Month = {
  id: string;
  label: string;
  text: string;
  verse: string;
  author: string;
  cuadro: string;
  background: Background;
};

function media(
  folder: string,
  cuadroFile: string,
  backgroundFile: string,
  backgroundType: Background["type"],
): Pick<Month, "cuadro" | "background"> {
  const base = `/${encodeURI(folder)}`;
  return {
    cuadro: `${base}/${cuadroFile}`,
    background: {
      type: backgroundType,
      src: `${base}/${backgroundFile}`,
    },
  };
}

export const months: Month[] = [
  {
    id: "noviembre",
    label: "Noviembre",
    text: "El tiempo se ha pasado tan rápido, pero siento que hemos vivido tantas cosas juntos. Ya te has vuelto una parte de mí, y cada día ocupas más espacio en mi corazón, cada día me enamoro más de ti.",
    verse: "Te amo sin saber cómo, ni cuándo, ni de dónde.",
    author: "Pablo Neruda",
    ...media("NOVIEMBRE", "CUADRO.jpeg", "BACKGROUND.mp4", "video"),
  },
  {
    id: "diciembre",
    label: "Diciembre",
    text: "Cuando estamos juntos y no paro de mirarte es porque me perdí en tu belleza. Los amaneceres o atardeceres no son vistas tan bonitas si te tengo a ti en frente, amor.",
    verse: "¿Qué es poesía? ¿Y tú me lo preguntas? Poesía… eres tú.",
    author: "Gustavo Adolfo Bécquer",
    ...media("DICIEMBRE", "CUADRO.jpeg", "BACKGROUND.mp4", "video"),
  },
  {
    id: "enero",
    label: "Enero",
    text: "Sacas la mejor versión de mí, haces que mejore día con día y aunque a veces no me gustes entiendo que quieres lo mejor para mí.",
    verse: "Te quiero porque sos mi amor, mi cómplice y todo.",
    author: "Mario Benedetti",
    ...media("ENERO", "CUADRO.jpeg", "BACKGROUND.mp4", "video"),
  },
  {
    id: "febrero",
    label: "Febrero",
    text: "Hemos pasado dificultades, peleas, días no tan buenos, pero son los que nos enseñan a crecer más cada día. Que no nos entendemos, que peleamos, pero entiendo que son necesarios y no hay otra persona con la que desee pelear que contigo.",
    verse: "Amar es combatir: si dos se besan el mundo cambia.",
    author: "Octavio Paz",
    ...media("FEBRERO", "CUADRO.jpeg", "BACKGROUND.mp4", "video"),
  },
  {
    id: "marzo",
    label: "Marzo",
    text: "Y no solo hemos tenido días malos. Gracias a Dios han sido más los días buenos, los logros que has conseguido y los que he conseguido.",
    verse: "Caminante, no hay camino, se hace camino al andar.",
    author: "Antonio Machado",
    ...media("MARZO", "CUADRO.jpeg", "BACKGROUND.mp4", "video"),
  },
  {
    id: "abril",
    label: "Abril",
    text: "Me hace más feliz celebrarlos contigo a mi lado. Verte conseguirlos me hace el hombre más orgulloso del mundo, y seguir cosechando más triunfos a tu lado, que sé que faltan muchos, mi amor. No solo te amo, también te admiro mucho y te amo con los ojos abiertos, con tus luces y tus sombras; te elijo porque contigo la vida se siente más bonita.",
    verse: "Te amo como se aman ciertas cosas oscuras, secretamente, entre la sombra y el alma.",
    author: "Pablo Neruda",
    ...media("ABRIL", "CUADRO.jpeg", "BACKGROUND.jpeg", "image"),
  },
  {
    id: "mayo",
    label: "Mayo",
    text: "Todavía recuerdo nuestra primera cita como si fuese ayer, y no sé qué hubiese sido de mí si no hubiese mandado ese mensaje. Fuiste la casualidad más bonita que tuve en mi vida.",
    verse: "Andábamos sin buscarnos, pero sabiendo que andábamos para encontrarnos.",
    author: "Julio Cortázar",
    ...media("MAYO", "CUADRO.jpeg", "BACKGROUND.jpeg", "image"),
  },
  {
    id: "junio",
    label: "Junio",
    text: "Todavía recuerdo los encuentros en la universidad como si fuesen hace nada, nuestras idas a comer helado, nuestro primer amor y amistad, nuestro primer beso.",
    verse: "Quiero hacer contigo lo que la primavera hace con los cerezos.",
    author: "Pablo Neruda",
    ...media("JUNIO", "CUADRO.jpeg", "BACKGROUND.jpeg", "image"),
  },
  {
    id: "julio",
    label: "Julio",
    text: "Y solo le pido a Dios que nunca me suelte de tu mano, porque quiero estar agarrado a ella por toda la eternidad. Hay algo con lo que nunca te puedo mentir, y es con mi mirada absorta en ti de lo muy enamorado que me tienes, ya que se me iluminan al verte.",
    verse: "Dame la mano y danzaremos; dame la mano y me amarás.",
    author: "Gabriela Mistral",
    ...media("JULIO", "CUADRO.jpeg", "BACKGROUND.mp4", "video"),
  },
  {
    id: "agosto",
    label: "Agosto",
    text: "Si te apagas, prometo amarte con más fuerza. Prometo devolverte la luz que te caracteriza, regar tu jardín con el amor que me brindaste.",
    verse: "Yo te he nombrado reina.",
    author: "Pablo Neruda",
    ...media("AGOSTO", "CUADRO.jpeg", "BACKGROUND.mp4", "video"),
  },
  {
    id: "septiembre",
    label: "Septiembre",
    text: "Te prometo cuidarte cuando te enfermes y hacer lo que haga falta para asegurarme que vuelvas a florecer. Porque si hay algo que le pido a Dios es que, si alguna vez llega a ser necesario, me permita ser aquello que te haga falta, para poder tener el privilegio de verte sonreír. Y crearía el mejor chiste si es necesario, porque sé que es capaz de provocar tu risa.",
    verse: "Quítame el pan si quieres, quítame el aire, pero no me quites tu risa.",
    author: "Pablo Neruda",
    ...media("SEPTIEMBRE", "CUADRO.jpeg", "BACKGROUND.mp4", "video"),
  },
  {
    id: "octubre",
    label: "Octubre",
    text: "Tu amor es sentir el calor de un rayo de sol incluso en el invierno más frío.",
    verse: "Quédate. Todavía queda sol en las azoteas.",
    author: "Mario Benedetti",
    ...media("OCTUBRE", "CUADRO.jpeg", "BACKGROUND.mp4", "video"),
  },
];

export const closing = {
  id: "cierre",
  label: "Un año",
  text: "Que sea el primero de infinitos",
  names: "Maida y Cristian",
  verse: "Como una sola flor seremos, como una flor, y nada más.",
  author: "Gabriela Mistral",
  ...media("NOVIEMBRE 2026", "CUADRO.jpg", "BACKGROUND.jpg", "image"),
};
