import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Marquee } from '@/components/ui/3d-testimonails';
import './Testimonials.css';

// Unique reviews data
const testimonials = [
  {
    name: 'Natalia',
    username: '@natalia',
    body: 'Inainte evitam oglinzile. Acum ma uit si zambesc. A fost clar, bland si constant.',
    img: '/Natalia.png',
    country: '-21 kg',
  },
  {
    name: 'Cristina',
    username: '@cristina',
    body: 'E primul program la care nu am renuntat. N-a fost despre perfectiune, ci despre consecventa.',
    img: '',
    country: '-31 kg',
  },
  {
    name: 'Galina',
    username: '@galina',
    body: 'Pasii mici, mesajele zilnice si grupul m-au tinut pe drum.',
    img: '',
    country: '-40 kg',
  },
  {
    name: 'Tanya Goncear',
    username: '@tanya',
    body: 'Cand am decis sa ma pun pe primul loc, mi-am promis ca nu voi renunta.',
    img: '',
    country: '-58 kg',
  },
  {
    name: 'Irina',
    username: '@irina',
    body: 'Am gasit ordine, claritate si o rutina care chiar imi place.',
    img: '/Irina.png',
    country: '-12 kg',
  },
  {
    name: 'Olga',
    username: '@olga',
    body: 'Rezultatul se vede nu doar pe cantar, ci si in oglinda.',
    img: '/olga-4kg-transformation.jpg',
    country: '-4 kg',
  },
  {
    name: 'Alina',
    username: '@alina',
    body: 'Mancarea, miscarea si disciplina au devenit normale.',
    img: '',
    country: '-16 kg',
  },
  {
    name: 'Diana',
    username: '@diana',
    body: 'Am primit suport, exemple clare si motivatie exact cand aveam nevoie.',
    img: '',
    country: '-9 kg',
  },
  {
    name: 'Marina',
    username: '@marina',
    body: 'Mi-am recapatat energia si increderea in corpul meu.',
    img: '',
    country: '-14 kg',
  },
];

function TestimonialCard({ img, name, username, body, country }: (typeof testimonials)[number]) {
  return (
    <Card className="testimonial-card w-50">
      <CardContent>
        <div className="flex items-center gap-2.5">
          <Avatar className="size-9">
            <AvatarImage src={img} alt="@reui_io" />
            <AvatarFallback>{name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <figcaption className="text-sm font-medium text-foreground flex items-center gap-1">
              {name} <span className="text-xs">{country}</span>
            </figcaption>
            <p className="text-xs font-medium text-muted-foreground">{username}</p>
          </div>
        </div>
        <blockquote className="mt-3 text-sm text-econdary-foreground">{body}</blockquote>
      </CardContent>
    </Card>
  );
}

function DemoOne() {
  return (
    <div className="border border-border rounded-lg relative flex h-96 w-full max-w-[800px] flex-row items-center justify-center overflow-hidden gap-1.5 [perspective:300px] testimonials-demo">
      <div
        className="flex flex-row items-center gap-4"
        style={{
          transform:
            'translateX(-100px) translateY(0px) translateZ(-100px) rotateX(20deg) rotateY(-10deg) rotateZ(20deg)',
        }}
      >
        {/* Vertical Marquee (downwards) */}
        <Marquee vertical pauseOnHover repeat={3} className="[--duration:40s]">
          {testimonials.map((review) => (
            <TestimonialCard key={review.username} {...review} />
          ))}
        </Marquee>
        {/* Vertical Marquee (upwards) */}
        <Marquee vertical pauseOnHover reverse repeat={3} className="[--duration:40s]">
          {testimonials.map((review) => (
            <TestimonialCard key={review.username} {...review} />
          ))}
        </Marquee>
        {/* Vertical Marquee (upwards) */}
        <Marquee vertical pauseOnHover repeat={3} className="[--duration:40s]">
          {testimonials.map((review) => (
            <TestimonialCard key={review.username} {...review} />
          ))}
        </Marquee>
        {/* Vertical Marquee (upwards) */}
        <Marquee vertical pauseOnHover reverse repeat={3} className="[--duration:40s]">
          {testimonials.map((review) => (
            <TestimonialCard key={review.username} {...review} />
          ))}
        </Marquee>
        {/* Gradient overlays for vertical marquee */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-background"></div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-background"></div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background"></div>
      </div>
    </div>
  );
}

export function Testimonials() {
  return (
    <section id="transformari" className="testimonials">
      <div className="container">
        <div className="testimonials-layout">
          <div className="testimonials-copy">
            <span className="testimonials-kicker">Rezultate reale</span>
            <h2>
              <i className="fas fa-heart" aria-hidden="true"></i>
              Povesti care se misca.
            </h2>
            <p className="testimonials-intro">
              Femei care au intrat in program pentru claritate, rutina si sprijin. Rezultatele lor nu sunt promisiuni goale, ci pasi repetati zi dupa zi.
            </p>
            <div className="testimonials-stats" aria-label="Rezultate FiiFit">
              <span><strong>4500+</strong> participante</span>
              <span><strong>-58 kg</strong> transformare</span>
              <span><strong>24</strong> lectii ghidate</span>
            </div>
          </div>
          <DemoOne />
        </div>
      </div>
    </section>
  );
}
