'use client';

import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from '@repo/design-system/components/ui/carousel';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const imageUrls: string[] = [
  'https://cdn.jsdelivr.net/gh/Ethereumistic/echo-ray-assets/partners/m-texx-light.svg',
  'https://cdn.jsdelivr.net/gh/Ethereumistic/echo-ray-assets/partners/m-texx-dark.svg',
  'https://cdn.jsdelivr.net/gh/Ethereumistic/echo-ray-assets/partners/bio-ddd-light.png',
  'https://cdn.jsdelivr.net/gh/Ethereumistic/echo-ray-assets/partners/bio-ddd-dark.png'
];


export const Cases = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setTimeout(() => {
      if (api.selectedScrollSnap() + 1 === api.scrollSnapList().length) {
        setCurrent(0);
        api.scrollTo(0);
      } else {
        api.scrollNext();
        setCurrent(current + 1);
      }
    }, 1000);
  }, [api, current]);

  return (
    <div className="w-full py-20 lg:py-40">
      <div className="container mx-auto">
        <div className="flex flex-col gap-10">
          <h2 className="text-left font-regular text-xl tracking-tighter md:text-3xl lg:text-5xl lg:max-w-xl">
            Trusted by thousands of businesses worldwide
          </h2>
          <Carousel setApi={setApi} className="w-full">
            <CarouselContent>
              {imageUrls.map((url, index) => (
                <CarouselItem className="basis-1/4 lg:basis-1/6" key={index}>
                  <div className="flex aspect-square items-center justify-center rounded-md bg-muted p-6">
                    <Image src={url} alt={`Logo ${index + 1}`} width={200} height={200} className="object-contain" />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </div>
  );
};
