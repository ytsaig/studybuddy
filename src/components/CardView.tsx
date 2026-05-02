import { Markdown } from './Markdown';

type Props = {
  front: string;
  back: string;
  flipped: boolean;
  onFlip: () => void;
};

export function CardView({ front, back, flipped, onFlip }: Props) {
  return (
    <button
      type="button"
      onClick={onFlip}
      aria-label={flipped ? 'Flip to front' : 'Flip to back'}
      className="card-flip-outer block w-full flex-1 min-h-0 text-left"
    >
      <div
        className={`card-flip-inner relative h-full w-full ${
          flipped ? 'is-flipped' : ''
        }`}
      >
        <div className="card-face absolute inset-0 flex items-center justify-center rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
          <div className="w-full text-center text-2xl leading-relaxed text-neutral-900">
            <Markdown>{front}</Markdown>
          </div>
        </div>
        <div className="card-face card-face-back absolute inset-0 flex items-center justify-center rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
          <div className="w-full text-center text-2xl leading-relaxed text-neutral-900">
            <Markdown>{back}</Markdown>
          </div>
        </div>
      </div>
    </button>
  );
}
