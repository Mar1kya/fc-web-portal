import Image from 'next/image'

const logos = [
    {
        image: 'https://cdn.shadcnstudio.com/ss-assets/brand-logo/amazon-logo-bw.png',
        alt: 'Sponsor 1'
    },
    {
        image: 'https://cdn.shadcnstudio.com/ss-assets/brand-logo/hubspot-logo-bw.png',
        alt: 'Sponsor 2'
    },
    {
        image: 'https://cdn.shadcnstudio.com/ss-assets/brand-logo/walmart-logo-bw.png',
        alt: 'Sponsor 3'
    },
    {
        image: 'https://cdn.shadcnstudio.com/ss-assets/brand-logo/microsoft-logo-bw.png',
        alt: 'Sponsor 4'
    },
    {
        image: 'https://cdn.shadcnstudio.com/ss-assets/brand-logo/paypal-logo-bw.png',
        alt: 'Sponsor 5'
    },
    {
        image: 'https://cdn.shadcnstudio.com/ss-assets/brand-logo/adobe-logo-bw.png',
        alt: 'Sponsor 6'
    },
]

export default function SponsorsPanel() {
    return (
        <section className='px-2 bg-background/80'>
            <div className='container border-t py-10 sm:py-14 mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='flex flex-wrap items-center justify-center gap-x-16 lg:gap-x-24 gap-y-10 max-sm:flex-col'>
                    {logos.map((logo, index) => (
                        <div
                            key={index}
                            className='relative h-8 md:h-10 w-30 md:w-37.5 opacity-50 grayscale transition-all duration-300 cursor-pointer hover:opacity-100 hover:grayscale-0 hover:drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]'>
                            <Image
                                src={logo.image}
                                alt={logo.alt}
                                fill
                                sizes="(max-width: 768px) 120px, 150px"
                                className='object-contain'
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}