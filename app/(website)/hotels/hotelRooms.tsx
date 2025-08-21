

export default function AboutHero() {
    return (
        <section
            className="relative flex items-center justify-center overflow-hidden"
            style={{
                background: "url('/images/hotels/room.jpg') center center/cover no-repeat, #595959",
                height: '417px',
                flexShrink: 0,
            }}
        >
    

            {/* Content */}
            <div className="container mx-auto px-4 relative z-10 text-center">
                {/* Heading */}
                <h1 className="text-3xl sm:text-3xl md:text-4xl lg:text-4xl font-bold text-[#fff] tracking-wide uppercase mb-3">
                    Unique and Luxury Rooms<br />for your stay
                </h1>

            </div>
        </section>
    );
}
