import type { ProjectImage } from "@/data/projects";

interface Props {
  images: ProjectImage[];
}

/**
 * Fotogalerij: horizontaal swipebaar op mobiel, raster vanaf md.
 */
export const ProjectGallery = ({ images }: Props) => {
  if (!images.length) return null;
  return (
    <>
      <div className="md:hidden -mx-6 px-6 flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2">
        {images.map((img) => (
          <figure key={img.src + img.alt} className="snap-start shrink-0 w-[85%]">
            <img
              src={img.src}
              alt={img.alt}
              loading="lazy"
              className="w-full aspect-[4/3] object-cover bg-surface-strong"
            />
          </figure>
        ))}
      </div>
      <div className="hidden md:grid gap-6 md:grid-cols-2" data-reveal>
        {images.map((img) => (
          <figure key={img.src + img.alt}>
            <img
              src={img.src}
              alt={img.alt}
              loading="lazy"
              className="w-full aspect-[4/3] object-cover bg-surface-strong"
            />
          </figure>
        ))}
      </div>
    </>
  );
};
